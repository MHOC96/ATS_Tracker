-- Initial schema for AI Recruitment Platform
-- Based on AGENTS.md sections 28-42

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

CREATE TYPE user_role AS ENUM ('ADMIN', 'RECRUITER', 'REVIEWER');

CREATE TYPE job_type AS ENUM (
  'FULL_TIME',
  'PART_TIME',
  'INTERNSHIP',
  'CONTRACT',
  'TEMPORARY'
);

CREATE TYPE job_status AS ENUM (
  'DRAFT',
  'PUBLISHED',
  'CLOSED',
  'ARCHIVED'
);

CREATE TYPE application_status AS ENUM (
  'APPLIED',
  'PROCESSING',
  'AI_REVIEWED',
  'MANUAL_REVIEW',
  'SHORTLISTED',
  'INTERVIEW',
  'ON_HOLD',
  'REJECTED',
  'HIRED'
);

CREATE TYPE criteria_type AS ENUM (
  'WEIGHT',
  'MINIMUM',
  'MANDATORY'
);

CREATE TYPE storage_status AS ENUM (
  'UPLOADED',
  'ARCHIVED'
);

CREATE TYPE extraction_status AS ENUM (
  'PENDING',
  'COMPLETED',
  'FAILED',
  'MANUAL_REVIEW'
);

CREATE TYPE recommendation AS ENUM (
  'STRONG_MATCH',
  'MATCH',
  'BORDERLINE',
  'WEAK_MATCH'
);

CREATE TYPE admin_decision_type AS ENUM (
  'SHORTLIST',
  'INTERVIEW',
  'HOLD',
  'REJECT',
  'MANUAL_REVIEW'
);

CREATE TYPE ai_processing_job_type AS ENUM (
  'CV_SCREENING',
  'JD_GENERATION'
);

CREATE TYPE ai_processing_status AS ENUM (
  'UPLOADED',
  'QUEUED',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'MANUAL_REVIEW'
);

-- ---------------------------------------------------------------------------
-- users (extends Supabase auth.users)
-- ---------------------------------------------------------------------------

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'RECRUITER',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- jobs
-- Drive layout (stage-first): Recruitment/Incoming_CVs/{slug}/,
-- Manual_Review/{slug}/, Archive/{slug}/. System stage root IDs live in env.
-- ---------------------------------------------------------------------------

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  job_type job_type NOT NULL,
  description TEXT,
  responsibilities TEXT,
  requirements TEXT,
  required_skills TEXT[] DEFAULT '{}',
  preferred_skills TEXT[] DEFAULT '{}',
  status job_status NOT NULL DEFAULT 'DRAFT',
  drive_folder_id TEXT,
  incoming_folder_id TEXT,
  manual_review_folder_id TEXT,
  archive_folder_id TEXT,
  created_by UUID REFERENCES users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

COMMENT ON COLUMN jobs.drive_folder_id IS
  'Optional legacy/reference folder ID. Per-stage job subfolder IDs below are authoritative.';
COMMENT ON COLUMN jobs.incoming_folder_id IS
  'Drive ID for Recruitment/Incoming_CVs/{job_slug}/';
COMMENT ON COLUMN jobs.manual_review_folder_id IS
  'Drive ID for Recruitment/Manual_Review/{job_slug}/';
COMMENT ON COLUMN jobs.archive_folder_id IS
  'Drive ID for Recruitment/Archive/{job_slug}/';

-- ---------------------------------------------------------------------------
-- job_description_versions
-- ---------------------------------------------------------------------------

CREATE TABLE job_description_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs (id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  generated_by_ai BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (job_id, version)
);

-- ---------------------------------------------------------------------------
-- scoring_models
-- ---------------------------------------------------------------------------

CREATE TABLE scoring_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  total_weight NUMERIC(5, 2) NOT NULL DEFAULT 0,
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX scoring_models_one_active_per_job
  ON scoring_models (job_id)
  WHERE is_active = TRUE;

-- ---------------------------------------------------------------------------
-- scoring_criteria
-- ---------------------------------------------------------------------------

CREATE TABLE scoring_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scoring_model_id UUID NOT NULL REFERENCES scoring_models (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  weight NUMERIC(5, 2) NOT NULL DEFAULT 0,
  criteria_type criteria_type NOT NULL DEFAULT 'WEIGHT',
  minimum_value NUMERIC(10, 2),
  is_mandatory BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- candidates
-- ---------------------------------------------------------------------------

CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- candidate_applications
-- ---------------------------------------------------------------------------

CREATE TABLE candidate_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates (id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs (id) ON DELETE CASCADE,
  cv_file_id UUID,
  drive_file_id TEXT,
  drive_file_url TEXT,
  status application_status NOT NULL DEFAULT 'APPLIED',
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (job_id, drive_file_id)
);

-- ---------------------------------------------------------------------------
-- candidate_profiles
-- ---------------------------------------------------------------------------

CREATE TABLE candidate_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates (id) ON DELETE CASCADE UNIQUE,
  university TEXT,
  degree TEXT,
  gpa NUMERIC(4, 2),
  years_experience NUMERIC(4, 1),
  skills TEXT[] DEFAULT '{}',
  education JSONB DEFAULT '[]',
  experience JSONB DEFAULT '[]',
  certifications JSONB DEFAULT '[]',
  projects JSONB DEFAULT '[]',
  extracted_by_ai BOOLEAN NOT NULL DEFAULT FALSE,
  extraction_model TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- cv_files
-- ---------------------------------------------------------------------------

CREATE TABLE cv_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_application_id UUID NOT NULL REFERENCES candidate_applications (id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  file_size BIGINT,
  drive_file_id TEXT NOT NULL,
  drive_folder_id TEXT,
  storage_status storage_status NOT NULL DEFAULT 'UPLOADED',
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);

COMMENT ON COLUMN cv_files.drive_folder_id IS
  'Current parent folder ID (Incoming_CVs/{slug}, Manual_Review/{slug}, or Archive/{slug}).';

ALTER TABLE candidate_applications
  ADD CONSTRAINT candidate_applications_cv_file_id_fkey
  FOREIGN KEY (cv_file_id) REFERENCES cv_files (id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- screening_results
-- ---------------------------------------------------------------------------

CREATE TABLE screening_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_application_id UUID NOT NULL REFERENCES candidate_applications (id) ON DELETE CASCADE,
  model TEXT NOT NULL,
  model_version TEXT,
  extraction_status extraction_status NOT NULL DEFAULT 'PENDING',
  confidence NUMERIC(5, 4),
  raw_structured_data JSONB,
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- candidate_scores
-- ---------------------------------------------------------------------------

CREATE TABLE candidate_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_application_id UUID NOT NULL REFERENCES candidate_applications (id) ON DELETE CASCADE,
  scoring_model_id UUID NOT NULL REFERENCES scoring_models (id) ON DELETE RESTRICT,
  final_score NUMERIC(5, 2) NOT NULL,
  recommendation recommendation NOT NULL,
  matched_skills TEXT[] DEFAULT '{}',
  missing_skills TEXT[] DEFAULT '{}',
  mandatory_failures TEXT[] DEFAULT '{}',
  reasoning TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- criterion_scores
-- ---------------------------------------------------------------------------

CREATE TABLE criterion_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_score_id UUID NOT NULL REFERENCES candidate_scores (id) ON DELETE CASCADE,
  criterion_id UUID NOT NULL REFERENCES scoring_criteria (id) ON DELETE RESTRICT,
  score NUMERIC(5, 2) NOT NULL,
  maximum_score NUMERIC(5, 2) NOT NULL,
  reasoning TEXT
);

-- ---------------------------------------------------------------------------
-- admin_decisions
-- ---------------------------------------------------------------------------

CREATE TABLE admin_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_application_id UUID NOT NULL REFERENCES candidate_applications (id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  decision admin_decision_type NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- ai_processing_jobs
-- ---------------------------------------------------------------------------

CREATE TABLE ai_processing_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_application_id UUID NOT NULL REFERENCES candidate_applications (id) ON DELETE CASCADE,
  job_type ai_processing_job_type NOT NULL,
  status ai_processing_status NOT NULL DEFAULT 'QUEUED',
  attempts INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- audit_logs
-- ---------------------------------------------------------------------------

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users (id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX idx_jobs_status ON jobs (status);
CREATE INDEX idx_jobs_slug ON jobs (slug);
CREATE INDEX idx_candidate_applications_job_id ON candidate_applications (job_id);
CREATE INDEX idx_candidate_applications_status ON candidate_applications (status);
CREATE INDEX idx_candidate_applications_drive_file_id ON candidate_applications (drive_file_id);
CREATE INDEX idx_ai_processing_jobs_status ON ai_processing_jobs (status);
CREATE INDEX idx_candidate_scores_application ON candidate_scores (candidate_application_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON audit_logs (user_id);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER scoring_models_updated_at
  BEFORE UPDATE ON scoring_models
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER candidates_updated_at
  BEFORE UPDATE ON candidates
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER candidate_applications_updated_at
  BEFORE UPDATE ON candidate_applications
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER candidate_profiles_updated_at
  BEFORE UPDATE ON candidate_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER screening_results_updated_at
  BEFORE UPDATE ON screening_results
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER admin_decisions_updated_at
  BEFORE UPDATE ON admin_decisions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security (policies added during auth integration)
-- ---------------------------------------------------------------------------

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_description_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoring_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoring_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE screening_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE criterion_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_processing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
