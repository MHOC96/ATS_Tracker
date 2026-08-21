-- Admin-only hard delete for candidates and applications (GDPR / admin cleanup).
-- Jobs already have jobs_delete_admin from initial RLS migration.

CREATE POLICY candidates_delete_admin ON public.candidates
  FOR DELETE TO authenticated
  USING (public.is_admin());

CREATE POLICY candidate_applications_delete_admin ON public.candidate_applications
  FOR DELETE TO authenticated
  USING (public.is_admin());
