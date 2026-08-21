-- Online profiles and other URLs extracted from CVs (LinkedIn, GitHub, portfolio, etc.).

ALTER TABLE candidate_profiles
  ADD COLUMN IF NOT EXISTS profile_links JSONB NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN candidate_profiles.profile_links IS
  'Array of {label, url} objects from CV (e.g. LinkedIn, GitHub, portfolio).';
