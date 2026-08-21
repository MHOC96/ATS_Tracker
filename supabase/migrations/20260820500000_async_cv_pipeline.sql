-- Async CV pipeline: staging storage path, transactional apply RPC, latest scores view.

ALTER TYPE storage_status ADD VALUE IF NOT EXISTS 'PENDING_UPLOAD';

ALTER TABLE cv_files
  ALTER COLUMN drive_file_id DROP NOT NULL;

ALTER TABLE cv_files
  ADD COLUMN IF NOT EXISTS storage_path TEXT;

COMMENT ON COLUMN cv_files.storage_path IS
  'Supabase Storage path in cv-staging bucket until copied to Google Drive.';

-- Latest score per application (avoids loading full score history in list queries).
CREATE OR REPLACE VIEW latest_candidate_scores
WITH (security_invoker = true) AS
SELECT DISTINCT ON (candidate_application_id)
  id,
  candidate_application_id,
  scoring_model_id,
  final_score,
  recommendation,
  matched_skills,
  missing_skills,
  mandatory_failures,
  reasoning,
  created_at
FROM candidate_scores
ORDER BY candidate_application_id, created_at DESC;

GRANT SELECT ON latest_candidate_scores TO authenticated;

-- Atomic application create (candidate + application + cv_file + processing job).
CREATE OR REPLACE FUNCTION create_application_with_pending_cv(
  p_job_id UUID,
  p_full_name TEXT,
  p_email TEXT,
  p_file_name TEXT,
  p_mime_type TEXT,
  p_file_size BIGINT,
  p_storage_path TEXT,
  p_drive_folder_id TEXT
)
RETURNS TABLE (application_id UUID, job_title TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job_status job_status;
  v_job_title TEXT;
  v_candidate_id UUID;
  v_application_id UUID;
  v_cv_file_id UUID;
BEGIN
  SELECT status, title
  INTO v_job_status, v_job_title
  FROM jobs
  WHERE id = p_job_id;

  IF v_job_title IS NULL THEN
    RAISE EXCEPTION 'Job not found';
  END IF;

  IF v_job_status <> 'PUBLISHED' THEN
    RAISE EXCEPTION 'Job is not accepting applications';
  END IF;

  IF p_drive_folder_id IS NULL OR p_drive_folder_id = '' THEN
    RAISE EXCEPTION 'Job incoming folder is not configured';
  END IF;

  INSERT INTO candidates (full_name, email)
  VALUES (p_full_name, p_email)
  RETURNING id INTO v_candidate_id;

  INSERT INTO candidate_applications (candidate_id, job_id, status)
  VALUES (v_candidate_id, p_job_id, 'APPLIED')
  RETURNING id INTO v_application_id;

  INSERT INTO cv_files (
    candidate_application_id,
    file_name,
    mime_type,
    file_size,
    drive_file_id,
    drive_folder_id,
    storage_status,
    storage_path
  )
  VALUES (
    v_application_id,
    p_file_name,
    p_mime_type,
    p_file_size,
    NULL,
    p_drive_folder_id,
    'PENDING_UPLOAD',
    p_storage_path
  )
  RETURNING id INTO v_cv_file_id;

  UPDATE candidate_applications
  SET cv_file_id = v_cv_file_id
  WHERE id = v_application_id;

  INSERT INTO ai_processing_jobs (
    candidate_application_id,
    job_type,
    status
  )
  VALUES (v_application_id, 'CV_SCREENING', 'QUEUED');

  application_id := v_application_id;
  job_title := v_job_title;
  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION create_application_with_pending_cv FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_application_with_pending_cv TO service_role;

-- Staging bucket for CV files before Google Drive upload (worker copies to Drive).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cv-staging',
  'cv-staging',
  false,
  4194304,
  ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Service role manages staging files; no public access.
DROP POLICY IF EXISTS cv_staging_service_all ON storage.objects;
CREATE POLICY cv_staging_service_all ON storage.objects
  FOR ALL TO service_role
  USING (bucket_id = 'cv-staging')
  WITH CHECK (bucket_id = 'cv-staging');
