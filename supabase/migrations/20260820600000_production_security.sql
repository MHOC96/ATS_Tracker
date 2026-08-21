-- Production security hardening: role escalation, RPC lockdown, signup defaults.

-- Never trust signup metadata for role assignment.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
    'RECRUITER'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- Prevent self-service role escalation.
DROP POLICY IF EXISTS users_update_own_or_admin ON public.users;

CREATE POLICY users_update_own_profile ON public.users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT u.role FROM public.users u WHERE u.id = auth.uid())
  );

CREATE POLICY users_update_admin ON public.users
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- RPC: service_role only; validate inputs server-side.
REVOKE ALL ON FUNCTION create_application_with_pending_cv(
  UUID, TEXT, TEXT, TEXT, TEXT, BIGINT, TEXT, TEXT
) FROM authenticated;

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
  v_incoming_folder_id TEXT;
  v_candidate_id UUID;
  v_application_id UUID;
  v_cv_file_id UUID;
BEGIN
  IF p_file_size IS NULL OR p_file_size <= 0 OR p_file_size > 4194304 THEN
    RAISE EXCEPTION 'Invalid CV file size';
  END IF;

  IF p_mime_type IS NULL OR p_mime_type <> 'application/pdf' THEN
    RAISE EXCEPTION 'CV must be a PDF';
  END IF;

  IF p_file_name IS NULL OR length(trim(p_file_name)) = 0 OR length(p_file_name) > 255 THEN
    RAISE EXCEPTION 'Invalid file name';
  END IF;

  IF p_storage_path IS NULL
    OR p_storage_path ~ '\.\.'
    OR p_storage_path !~ '^[a-zA-Z0-9._\-/]+$'
    OR length(p_storage_path) > 512 THEN
    RAISE EXCEPTION 'Invalid storage path';
  END IF;

  SELECT status, title, incoming_folder_id
  INTO v_job_status, v_job_title, v_incoming_folder_id
  FROM jobs
  WHERE id = p_job_id;

  IF v_job_title IS NULL THEN
    RAISE EXCEPTION 'Job not found';
  END IF;

  IF v_job_status <> 'PUBLISHED' THEN
    RAISE EXCEPTION 'Job is not accepting applications';
  END IF;

  IF v_incoming_folder_id IS NULL OR v_incoming_folder_id = '' THEN
    RAISE EXCEPTION 'Job incoming folder is not configured';
  END IF;

  IF p_drive_folder_id IS DISTINCT FROM v_incoming_folder_id THEN
    RAISE EXCEPTION 'Drive folder does not match job configuration';
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
    v_incoming_folder_id,
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

REVOKE ALL ON FUNCTION create_application_with_pending_cv(
  UUID, TEXT, TEXT, TEXT, TEXT, BIGINT, TEXT, TEXT
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_application_with_pending_cv(
  UUID, TEXT, TEXT, TEXT, TEXT, BIGINT, TEXT, TEXT
) TO service_role;
