-- Admin CRUD performance: indexes, batch counts, transactional RPCs.

CREATE INDEX IF NOT EXISTS idx_jobs_created_at
  ON jobs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_scoring_models_job_id
  ON scoring_models (job_id);

-- Batch application counts for paginated job lists (staff only).
CREATE OR REPLACE FUNCTION public.get_job_application_counts(p_job_ids UUID[])
RETURNS TABLE (job_id UUID, application_count BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ca.job_id, COUNT(*)::BIGINT
  FROM candidate_applications ca
  WHERE ca.job_id = ANY(p_job_ids)
    AND public.is_staff()
  GROUP BY ca.job_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_job_application_counts(UUID[]) TO authenticated;

-- Single round-trip job + scoring model + criteria update.
CREATE OR REPLACE FUNCTION public.update_job_with_scoring(
  p_job_id UUID,
  p_title TEXT,
  p_job_type job_type,
  p_hiring_period_start DATE,
  p_hiring_period_end DATE,
  p_description TEXT,
  p_responsibilities TEXT,
  p_requirements TEXT,
  p_required_skills TEXT[],
  p_preferred_skills TEXT[],
  p_scoring_name TEXT,
  p_scoring_description TEXT,
  p_total_weight NUMERIC,
  p_criteria JSONB,
  p_jd_content TEXT,
  p_ai_generated_jd BOOLEAN,
  p_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status job_status;
  v_scoring_model_id UUID;
  v_latest_jd_version INTEGER;
  criterion JSONB;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin only';
  END IF;

  SELECT status INTO v_status FROM jobs WHERE id = p_job_id;

  IF v_status IS NULL THEN
    RAISE EXCEPTION 'Job not found';
  END IF;

  IF v_status = 'ARCHIVED' THEN
    RAISE EXCEPTION 'Archived jobs cannot be edited';
  END IF;

  UPDATE jobs
  SET
    title = p_title,
    job_type = p_job_type,
    hiring_period_start = p_hiring_period_start,
    hiring_period_end = p_hiring_period_end,
    description = p_description,
    responsibilities = p_responsibilities,
    requirements = p_requirements,
    required_skills = COALESCE(p_required_skills, '{}'),
    preferred_skills = COALESCE(p_preferred_skills, '{}'),
    updated_at = NOW()
  WHERE id = p_job_id;

  SELECT id INTO v_scoring_model_id
  FROM scoring_models
  WHERE job_id = p_job_id
  ORDER BY version DESC
  LIMIT 1;

  IF v_scoring_model_id IS NULL THEN
    RAISE EXCEPTION 'Scoring model not found for this job';
  END IF;

  UPDATE scoring_models
  SET
    name = p_scoring_name,
    description = p_scoring_description,
    total_weight = p_total_weight,
    updated_at = NOW()
  WHERE id = v_scoring_model_id;

  DELETE FROM scoring_criteria WHERE scoring_model_id = v_scoring_model_id;

  FOR criterion IN SELECT value FROM jsonb_array_elements(p_criteria)
  LOOP
    INSERT INTO scoring_criteria (
      scoring_model_id,
      name,
      description,
      weight,
      criteria_type,
      minimum_value,
      is_mandatory
    ) VALUES (
      v_scoring_model_id,
      criterion->>'name',
      NULLIF(criterion->>'description', ''),
      COALESCE((criterion->>'weight')::NUMERIC, 0),
      COALESCE((criterion->>'criteria_type')::criteria_type, 'WEIGHT'),
      CASE
        WHEN criterion->>'minimum_value' IS NULL
          OR trim(criterion->>'minimum_value') = ''
        THEN NULL
        ELSE (criterion->>'minimum_value')::NUMERIC
      END,
      COALESCE((criterion->>'is_mandatory')::BOOLEAN, FALSE)
    );
  END LOOP;

  IF p_jd_content IS NOT NULL AND length(trim(p_jd_content)) > 0 THEN
    SELECT version INTO v_latest_jd_version
    FROM job_description_versions
    WHERE job_id = p_job_id
    ORDER BY version DESC
    LIMIT 1;

    INSERT INTO job_description_versions (
      job_id,
      version,
      content,
      generated_by_ai,
      created_by
    ) VALUES (
      p_job_id,
      COALESCE(v_latest_jd_version, 0) + 1,
      p_jd_content,
      COALESCE(p_ai_generated_jd, FALSE),
      p_user_id
    );
  END IF;

  RETURN p_job_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_job_with_scoring(
  UUID,
  TEXT,
  job_type,
  DATE,
  DATE,
  TEXT,
  TEXT,
  TEXT,
  TEXT[],
  TEXT[],
  TEXT,
  TEXT,
  NUMERIC,
  JSONB,
  TEXT,
  BOOLEAN,
  UUID
) TO authenticated;

-- Atomic recruiter decision + application status update.
CREATE OR REPLACE FUNCTION public.save_admin_decision(
  p_application_id UUID,
  p_status application_status,
  p_decision admin_decision_type,
  p_notes TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_recruiter_or_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM candidate_applications WHERE id = p_application_id
  ) THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  INSERT INTO admin_decisions (
    candidate_application_id,
    reviewer_id,
    decision,
    notes
  ) VALUES (
    p_application_id,
    auth.uid(),
    p_decision,
    NULLIF(trim(p_notes), '')
  );

  UPDATE candidate_applications
  SET status = p_status, updated_at = NOW()
  WHERE id = p_application_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_admin_decision(
  UUID,
  application_status,
  admin_decision_type,
  TEXT
) TO authenticated;
