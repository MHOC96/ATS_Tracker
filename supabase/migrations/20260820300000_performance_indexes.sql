-- Performance indexes for application list and dashboard queries

CREATE INDEX IF NOT EXISTS idx_candidate_applications_applied_at
  ON candidate_applications (applied_at DESC);

CREATE INDEX IF NOT EXISTS idx_candidate_applications_status_applied_at
  ON candidate_applications (status, applied_at DESC);
