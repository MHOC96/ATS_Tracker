-- Additional indexes for hot query paths.

CREATE INDEX IF NOT EXISTS idx_candidate_scores_app_created
  ON candidate_scores (candidate_application_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_processing_jobs_application
  ON ai_processing_jobs (candidate_application_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_cv_files_application
  ON cv_files (candidate_application_id);

CREATE INDEX IF NOT EXISTS idx_admin_decisions_application_created
  ON admin_decisions (candidate_application_id, created_at DESC);
