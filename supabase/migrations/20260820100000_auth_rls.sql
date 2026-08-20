-- Auth sync + Row Level Security policies
-- Run after 20260820000000_initial_schema.sql

-- ---------------------------------------------------------------------------
-- Sync auth.users -> public.users on signup
-- ---------------------------------------------------------------------------

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
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'RECRUITER')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Role helper
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_user_role() = 'ADMIN';
$$;

CREATE OR REPLACE FUNCTION public.is_recruiter_or_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_user_role() IN ('ADMIN', 'RECRUITER');
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_user_role() IN ('ADMIN', 'RECRUITER', 'REVIEWER');
$$;

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------

CREATE POLICY users_select_own_or_admin ON public.users
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY users_update_own_or_admin ON public.users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- ---------------------------------------------------------------------------
-- jobs — admin writes; staff reads
-- ---------------------------------------------------------------------------

CREATE POLICY jobs_select_staff ON public.jobs
  FOR SELECT TO authenticated
  USING (public.is_staff());

CREATE POLICY jobs_insert_admin ON public.jobs
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY jobs_update_admin ON public.jobs
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY jobs_delete_admin ON public.jobs
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- job_description_versions
-- ---------------------------------------------------------------------------

CREATE POLICY job_description_versions_staff ON public.job_description_versions
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- scoring_models + scoring_criteria
-- ---------------------------------------------------------------------------

CREATE POLICY scoring_models_staff ON public.scoring_models
  FOR SELECT TO authenticated
  USING (public.is_staff());

CREATE POLICY scoring_models_admin ON public.scoring_models
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY scoring_criteria_staff ON public.scoring_criteria
  FOR SELECT TO authenticated
  USING (public.is_staff());

CREATE POLICY scoring_criteria_admin ON public.scoring_criteria
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- candidates + applications — recruiters upload; staff read
-- ---------------------------------------------------------------------------

CREATE POLICY candidates_select_staff ON public.candidates
  FOR SELECT TO authenticated
  USING (public.is_staff());

CREATE POLICY candidates_write_recruiter ON public.candidates
  FOR INSERT TO authenticated
  WITH CHECK (public.is_recruiter_or_admin());

CREATE POLICY candidates_update_recruiter ON public.candidates
  FOR UPDATE TO authenticated
  USING (public.is_recruiter_or_admin())
  WITH CHECK (public.is_recruiter_or_admin());

CREATE POLICY candidate_applications_select_staff ON public.candidate_applications
  FOR SELECT TO authenticated
  USING (public.is_staff());

CREATE POLICY candidate_applications_write_recruiter ON public.candidate_applications
  FOR INSERT TO authenticated
  WITH CHECK (public.is_recruiter_or_admin());

CREATE POLICY candidate_applications_update_recruiter ON public.candidate_applications
  FOR UPDATE TO authenticated
  USING (public.is_recruiter_or_admin())
  WITH CHECK (public.is_recruiter_or_admin());

-- ---------------------------------------------------------------------------
-- candidate_profiles, cv_files, screening, scores
-- ---------------------------------------------------------------------------

CREATE POLICY candidate_profiles_staff ON public.candidate_profiles
  FOR SELECT TO authenticated
  USING (public.is_staff());

CREATE POLICY candidate_profiles_write_recruiter ON public.candidate_profiles
  FOR ALL TO authenticated
  USING (public.is_recruiter_or_admin())
  WITH CHECK (public.is_recruiter_or_admin());

CREATE POLICY cv_files_staff ON public.cv_files
  FOR SELECT TO authenticated
  USING (public.is_staff());

CREATE POLICY cv_files_write_recruiter ON public.cv_files
  FOR ALL TO authenticated
  USING (public.is_recruiter_or_admin())
  WITH CHECK (public.is_recruiter_or_admin());

CREATE POLICY screening_results_staff ON public.screening_results
  FOR SELECT TO authenticated
  USING (public.is_staff());

CREATE POLICY screening_results_write_recruiter ON public.screening_results
  FOR ALL TO authenticated
  USING (public.is_recruiter_or_admin())
  WITH CHECK (public.is_recruiter_or_admin());

CREATE POLICY candidate_scores_staff ON public.candidate_scores
  FOR SELECT TO authenticated
  USING (public.is_staff());

CREATE POLICY candidate_scores_write_recruiter ON public.candidate_scores
  FOR ALL TO authenticated
  USING (public.is_recruiter_or_admin())
  WITH CHECK (public.is_recruiter_or_admin());

CREATE POLICY criterion_scores_staff ON public.criterion_scores
  FOR SELECT TO authenticated
  USING (public.is_staff());

CREATE POLICY criterion_scores_write_recruiter ON public.criterion_scores
  FOR ALL TO authenticated
  USING (public.is_recruiter_or_admin())
  WITH CHECK (public.is_recruiter_or_admin());

-- ---------------------------------------------------------------------------
-- admin_decisions — staff read; admin + recruiter write
-- ---------------------------------------------------------------------------

CREATE POLICY admin_decisions_select_staff ON public.admin_decisions
  FOR SELECT TO authenticated
  USING (public.is_staff());

CREATE POLICY admin_decisions_write_recruiter ON public.admin_decisions
  FOR ALL TO authenticated
  USING (public.is_recruiter_or_admin())
  WITH CHECK (public.is_recruiter_or_admin());

-- ---------------------------------------------------------------------------
-- ai_processing_jobs + audit_logs
-- ---------------------------------------------------------------------------

CREATE POLICY ai_processing_jobs_staff ON public.ai_processing_jobs
  FOR SELECT TO authenticated
  USING (public.is_staff());

CREATE POLICY ai_processing_jobs_write_recruiter ON public.ai_processing_jobs
  FOR ALL TO authenticated
  USING (public.is_recruiter_or_admin())
  WITH CHECK (public.is_recruiter_or_admin());

CREATE POLICY audit_logs_select_staff ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.is_staff());

CREATE POLICY audit_logs_insert_staff ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (public.is_staff());
