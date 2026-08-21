-- Fixed-term hiring window for internship and contract roles.

ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS hiring_period_start DATE,
  ADD COLUMN IF NOT EXISTS hiring_period_end DATE;

COMMENT ON COLUMN jobs.hiring_period_start IS
  'Start of the fixed-term hire period (internship/contract). NULL for full-time roles.';
COMMENT ON COLUMN jobs.hiring_period_end IS
  'End of the fixed-term hire period (internship/contract). NULL for full-time roles.';
