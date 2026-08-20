# AGENTS.md
# Production Recruitment AI Swarm

**Project:** Autonomous AI Recruitment Management Platform
**Version:** 2.5.0 (MVP — AI JD generation + public preview)
**Status:** In development — deploy and realtime status pending
**Architecture:** Next.js + LangGraph + Gemini + Groq + MCP + Supabase PostgreSQL + Google Drive + Railway
**Frontend:** Next.js + Tailwind CSS
**Backend Gateway:** Next.js Server / API Routes (Vercel)
**Backend Workers:** LangGraph Workers (Railway)
**Database:** Supabase PostgreSQL
**File Storage:** Google Drive (MVP Scale)
**AI Vision:** Gemini Flash
**AI Reasoning:** Groq-hosted Llama model
**Deployment:** Vercel (Frontend/API) + Railway (Worker Runtime)
**Authentication:** Supabase Auth (email/password, RBAC, RLS)

## 0. IMPLEMENTATION STATUS (current build)

### Implemented and working (manual QA)
| Area | Status | Notes |
|------|--------|-------|
| Supabase Auth + login | Done | `/login`, middleware protects `/admin/*` |
| RBAC + RLS | Done | Migrations `20260820100000_auth_rls.sql` |
| Admin dashboard shell | Done | Live stats + recent applications from Supabase |
| Job create (draft) | Done | `/admin/jobs/new` — Zod, scoring weights = 100% |
| Job list + detail | Done | `/admin/jobs`, `/admin/jobs/[id]` |
| Job publish | Done | Creates `{slug}/` under each Drive stage folder |
| Google Drive OAuth | Done | Personal Gmail quota; **not** service account |
| Auto refresh token | Done | Admin → Settings → Connect; stored in `platform_settings` |
| CV upload (admin/recruiter) | Done | Upload to `Incoming_CVs/{slug}/`, queues worker |
| Worker HTTP + LangGraph pipeline | Done | Gemini extract → Groq audit → Supabase persist |
| Queue handoff | Done | Vercel `POST /api/applications/[id]/process` → Railway |
| Gemini CV extraction (worker) | Done | `worker/src/ai/gemini.ts` — vision model from env |
| Groq auditor / scoring (worker) | Done | `worker/src/ai/groq.ts` — reasoning model from env |
| Store screening scores in DB (worker) | Done | `screening_results`, profiles, scores, criterion_scores |
| Drive archive / manual-review moves (worker) | Done | Incoming → Archive on success; Manual_Review on failure |
| Worker Google Drive OAuth | Done | Reads refresh token from `platform_settings` or env |
| Public careers + self-apply | Done | `/`, `/jobs`, `/jobs/[slug]` — service-role apply action |
| Dashboard live metrics | Done | Active jobs, applications, pending review, interviews |
| Admin candidate review | Done | `/admin/candidates`, score breakdown, recruiter decisions |
| Manual review queue UI | Done | `/admin/manual-review` filters `MANUAL_REVIEW` |
| AI JD generation | Done | Groq on job create form; version stored in `job_description_versions` |
| Admin public preview | Done | Draft/published job detail shows `JobPublicPreview` |

### Not yet implemented
| Area | Status |
|------|--------|
| Real-time application status (Realtime) | Pending |
| Vercel + Railway production deploy | Pending |

### Supabase migrations (run in order)
1. `supabase/migrations/20260820000000_initial_schema.sql`
2. `supabase/migrations/20260820100000_auth_rls.sql`
3. `supabase/migrations/20260820200000_platform_settings.sql`

### Repository layout
```
app/                    # Next.js App Router (Vercel gateway)
  (admin)/admin/        # Dashboard, jobs, candidates, settings
  api/                  # health, applications/process, google/oauth
lib/
  google/               # Drive + OAuth (personal Gmail)
  jobs/                 # Server actions: create draft, publish
  applications/         # CV upload server action
  platform/settings.ts  # platform_settings (refresh token)
worker/                 # LangGraph on Railway (separate deploy)
packages/shared/        # Zod schemas
supabase/migrations/
```

### Verified local flow (happy path)
1. Login as **ADMIN** (`/login`)
2. **Settings** → Connect Google Drive (one-time OAuth)
3. Ensure stage folder IDs in `.env` (`GOOGLE_DRIVE_*_ROOT_ID`)
4. **Jobs → Create** → fill form → **Save draft**
5. Job detail → **Publish job** (Drive subfolders created)
6. **Upload CV** on published job
7. Run worker: `cd worker && npm run dev`
8. Worker receives job at `POST /process` (via queue handoff)

## 1. PROJECT OBJECTIVE
Build a production-ready AI-powered recruitment management platform.
The system allows administrators to:
1. Create job vacancies.
2. Select a job type.
3. Generate Job Descriptions using AI.
4. Edit and approve AI-generated Job Descriptions.
5. Configure candidate scoring rules.
6. Publish vacancies.
7. Automatically create Google Drive folders for each vacancy.
8. Upload candidate CVs into the correct vacancy.
9. Automatically screen CVs using Gemini.
10. Compare candidates against the vacancy requirements.
11. Score candidates using configurable scoring rules.
12. Send low-quality/unreadable CVs to Manual Review.
13. Store all structured recruitment data in Supabase PostgreSQL.
14. Store original CV files in Google Drive.
15. Display candidates and scores in the Admin Dashboard.
16. Allow recruiters/managers to manually review AI results.
17. Rank candidates for each vacancy.
18. Track recruitment status throughout the hiring process.

The AI must assist recruiters.
The AI must NOT make irreversible hiring decisions without human review.

## 2. CORE ARCHITECTURE
* **ADMIN PANEL:** Next.js (Vercel)
* **SUPABASE AUTH:** Authentication/RBAC
* **NEXT.JS BACKEND:** API Routes / Server Code (Vercel)
* **WORKER QUEUE:** Event handoff to Railway
* **BACKGROUND WORKERS:** LangGraph AI Workflow (Railway)
* **DATABASE:** Supabase PostgreSQL
* **FILE STORAGE:** Google Drive
* **AI MODELS:** Gemini Flash (Vision/OCR) & Groq Llama (Reasoning)

## 3. TECHNOLOGY STACK
**Frontend**
* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui
* React Hook Form
* Zod

**Backend (API Gateway)**
* Next.js Server Actions / Route Handlers (Vercel)
* TypeScript

**Backend (Workers - Deployed on Railway)**
* LangGraph
* Persistent background worker (BullMQ, Inngest, or similar HTTP triggers)

**Database**
* Supabase PostgreSQL

**Authentication**
* Supabase Auth

**AI**
* **Vision:** Gemini Flash. Used for PDF CV extraction, Image CV extraction, OCR, Structured candidate extraction.
* **Reasoning:** Groq-hosted Llama model. Used for Candidate/JD comparison, Scoring, Skill matching, Reasoning, Candidate ranking.

**Storage**
* **Google Drive.** Stores: Original CVs, Job-related files, Manual-review files, Archived CVs.

**MCP**
* Model Context Protocol is used to expose controlled tools to AI agents, hosted persistently on the Railway worker instance.

## 4. IMPORTANT ARCHITECTURAL RULE
Supabase PostgreSQL is the application's:
> SOURCE OF TRUTH

Google Drive is:
> FILE STORAGE

Google Sheets is:
> OPTIONAL REPORTING/EXPORT LAYER

Do NOT use Google Sheets as the primary database. All important recruitment information must be stored in Supabase PostgreSQL.

## 5. JOB VACANCY CONCEPT
The main business entity is a JOB.
Example: AI Engineer
A job has: title, description, requirements, responsibilities, skills, scoring model, job type, status, Drive folder, candidates.

## 6. JOB TYPES
The system supports only job type. There is NO seniority field.
Supported job types: FULL_TIME, PART_TIME, INTERNSHIP, CONTRACT, TEMPORARY.

## 7. JOB CREATION FLOW (implemented)
Admin: Dashboard -> **Jobs** -> **Create Job** -> Enter title, type, description, skills -> Configure scoring (weights = 100%) -> **Save draft** -> Job detail -> **Publish** (Drive folders + `PUBLISHED`).

Pending: AI JD generation, public preview before publish.

## 8. AI JOB DESCRIPTION GENERATOR
The admin can create a Job Description using AI.
The administrator can edit the generated content before publishing. AI-generated content must never automatically become public without admin approval.

## 9. JOB DESCRIPTION STORAGE
Job descriptions are stored in Supabase PostgreSQL. DO NOT use a Google Drive folder as the main storage for JDs.
Database: `jobs` contains the job information. Optional: `job_description_versions` stores historical versions.

## 10. GOOGLE DRIVE FOLDER STRUCTURE
Google Drive is organized by **workflow stage first**, then **job vacancy** as subfolders. The system maintains three top-level folders under `Recruitment/`. When a job is published, the system creates a job-specific subfolder inside each stage folder.

```
Recruitment/
├── Incoming_CVs/
│   ├── AI_Engineer/
│   │   └── john_smith_resume.pdf
│   └── Data_Scientist/
│       └── jane_doe_cv.pdf
├── Manual_Review/
│   ├── AI_Engineer/
│   │   └── blurry_scan.pdf
│   └── Data_Scientist/
└── Archive/
    ├── AI_Engineer/
    │   └── john_smith_resume.pdf
    └── Data_Scientist/
```

This structure is preferred because:
* Recruiters can monitor all new CVs in one `Incoming_CVs/` queue.
* Failed or unreadable CVs are grouped in `Manual_Review/` across jobs.
* Successfully processed CVs are grouped in `Archive/` across jobs.
* Job subfolders (e.g., `AI_Engineer/`) keep each vacancy's files isolated and human-readable.

Example paths:
* New upload: `Recruitment/Incoming_CVs/AI_Engineer/john_smith_resume.pdf`
* Manual review: `Recruitment/Manual_Review/AI_Engineer/blurry_scan.pdf`
* Archived: `Recruitment/Archive/AI_Engineer/john_smith_resume.pdf`

## 11. IMPORTANT DRIVE RULE
**Authentication:** Use **Google OAuth 2.0** with a **personal Gmail** account (free 15GB quota). Do **not** use a service account for file storage — service accounts have no Drive quota unless using Workspace Shared Drives.

**OAuth setup (once):**
1. Google Cloud Console → OAuth Web client → redirect URI: `{APP_URL}/api/google/callback`
2. Set `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET` in `.env`
3. Admin → **Settings** → **Connect Google Drive** (stores refresh token in `platform_settings`)
4. Optional fallback: `GOOGLE_OAUTH_REFRESH_TOKEN` in `.env` overrides DB token

**Folder bootstrap (once, in your Gmail My Drive):** Create `Recruitment/` → `Incoming_CVs/`, `Manual_Review/`, `Archive/`. Store folder IDs in `.env`.

**When admin publishes a job:** Save Job -> Create job subfolder under `Incoming_CVs/` (e.g., `AI_Engineer/`) -> Create job subfolder under `Manual_Review/` -> Create job subfolder under `Archive/` -> Save folder IDs -> Publish Job.

The generated per-job folder IDs are saved in PostgreSQL (`jobs.incoming_folder_id`, `jobs.manual_review_folder_id`, `jobs.archive_folder_id`). `jobs.drive_folder_id` is optional and may be omitted; the three per-stage job subfolder IDs are the source of truth for file operations.

Never depend only on folder names. Use Drive IDs internally.

## 12. WHY MANUAL REVIEW EXISTS
The `Manual_Review/{job_slug}/` folder is used when the AI cannot safely process a CV (Blurry image, Corrupted PDF, Password-protected PDF, etc.).
The database must record: `processing_status: MANUAL_REVIEW`. Manual review is NOT a rejection.

## 13. CV UPLOAD FLOW
Admin or recruiter uploads a CV to a specific vacancy.
Upload CV -> Google Drive -> `Incoming_CVs/{job_slug}/` (e.g., `Incoming_CVs/AI_Engineer/`). The system creates a candidate record in PostgreSQL.

## 14. CANDIDATE PROCESSING FLOW
CV Uploaded -> Create Candidate -> Processing Queue -> **Worker Picks Up** -> Download CV -> Gemini Vision -> Structured Candidate JSON -> Validate JSON -> Load Job -> Load Scoring Model -> Groq Auditor -> Calculate Score -> Store Result -> Rank Candidate -> Move CV to Archive.
If processing fails: CV -> Processing Error -> Manual Review.

## 15. VISION SCREENER AGENT
**Responsibility:** Extract structured information from CVs.
**Model:** Gemini Flash.
**Output:** Strict structured JSON (full_name, email, skills, etc.).
The model must NOT invent missing information. Missing information: `null`.

## 16. CANDIDATE DATA VALIDATION
All AI output must pass schema validation. Use: Zod.
If invalid: Retry -> Still invalid -> Manual Review.

## 17. DYNAMIC AUDITOR AGENT
**Responsibility:** Compare candidate information against the selected job.
The Auditor receives: Candidate Data + Job Description + Scoring Model.
It returns: Score, Matched Skills, Missing Skills, Strengths, Weaknesses, Reasoning, Recommendation.

## 18. SCORING MODEL
The administrator controls how candidates are scored (e.g., Technical Skills 40%, Experience 20%). Total MUST equal 100%.

## 19. ADMIN SCORING INTERFACE
The system must validate: Total Weight = 100. The admin cannot publish the scoring model if Total != 100.

## 20. SCORING CRITERIA
Criteria should be configurable (e.g., Technical Skills Weight: 40, GPA Minimum: 3.0).

## 21. MANDATORY REQUIREMENTS
The admin can define mandatory requirements. If a mandatory requirement is missing: `Mandatory Requirement Failed`. The candidate can still receive a score, but the system must clearly flag the failure. Do NOT silently reject the candidate.

## 22. SCORE CALCULATION
The system should store both: `final_score` and `criterion_scores`.

## 23. SCORE EXPLANATION
Every score must have an explanation. Avoid exposing hidden chain-of-thought. Store concise, auditable reasoning rather than private model reasoning.

## 24. RECOMMENDATION
The AI can provide: STRONG_MATCH, MATCH, BORDERLINE, WEAK_MATCH. This is a recommendation, not an automatic hiring decision.

## 25. HUMAN REVIEW
Admin can manually review candidates. Admin Decision: Shortlist, Interview, Hold, Reject, Manual Review.

## 26. FINAL CANDIDATE STATUS
Supported statuses: APPLIED, PROCESSING, AI_REVIEWED, MANUAL_REVIEW, SHORTLISTED, INTERVIEW, ON_HOLD, REJECTED, HIRED. AI should never automatically set: HIRED.

## 27. DATABASE SOURCE OF TRUTH
All recruitment results are stored in: Supabase PostgreSQL (candidate -> candidate_profile -> candidate_application -> screening_result -> candidate_score -> admin_decision).

## 28. DATABASE STRUCTURE: users
`id`, `email`, `full_name`, `role`, `created_at`, `updated_at`. Roles: ADMIN, RECRUITER, REVIEWER.

## 29. DATABASE STRUCTURE: jobs
`id`, `title`, `slug`, `job_type`, `description`, `responsibilities`, `requirements`, `required_skills`, `preferred_skills`, `status`, `drive_folder_id` (optional), `incoming_folder_id`, `manual_review_folder_id`, `archive_folder_id`, `created_by`, `created_at`, `updated_at`, `published_at`, `closed_at`.

Per-job folder IDs reference the job subfolder inside each system stage root:
* `incoming_folder_id` -> `Recruitment/Incoming_CVs/{job_slug}/`
* `manual_review_folder_id` -> `Recruitment/Manual_Review/{job_slug}/`
* `archive_folder_id` -> `Recruitment/Archive/{job_slug}/`

## 30. DATABASE STRUCTURE: job_description_versions
`id`, `job_id`, `version`, `content`, `generated_by_ai`, `created_by`, `created_at`.

## 31. DATABASE STRUCTURE: scoring_models
`id`, `job_id`, `name`, `description`, `total_weight`, `version`, `is_active`, `created_by`, `created_at`, `updated_at`.

## 32. DATABASE STRUCTURE: scoring_criteria
`id`, `scoring_model_id`, `name`, `description`, `weight`, `criteria_type`, `minimum_value`, `is_mandatory`, `created_at`.

## 33. DATABASE STRUCTURE: candidates
`id`, `full_name`, `email`, `phone`, `location`, `created_at`, `updated_at`.

## 34. DATABASE STRUCTURE: candidate_applications
`id`, `candidate_id`, `job_id`, `cv_file_id`, `drive_file_id`, `drive_file_url`, `status`, `applied_at`, `updated_at`.

## 35. DATABASE STRUCTURE: candidate_profiles
`id`, `candidate_id`, `university`, `degree`, `gpa`, `years_experience`, `skills`, `education`, `experience`, `certifications`, `projects`, `extracted_by_ai`, `extraction_model`, `created_at`, `updated_at`.

## 36. DATABASE STRUCTURE: cv_files
`id`, `candidate_application_id`, `file_name`, `mime_type`, `file_size`, `drive_file_id`, `drive_folder_id`, `storage_status`, `uploaded_at`, `archived_at`.

## 37. DATABASE STRUCTURE: screening_results
`id`, `candidate_application_id`, `model`, `model_version`, `extraction_status`, `confidence`, `raw_structured_data`, `processing_time_ms`, `created_at`, `updated_at`. Keep original document in Drive, don't store raw text.

## 38. DATABASE STRUCTURE: candidate_scores
`id`, `candidate_application_id`, `scoring_model_id`, `final_score`, `recommendation`, `matched_skills`, `missing_skills`, `mandatory_failures`, `reasoning`, `created_at`.

## 39. DATABASE STRUCTURE: criterion_scores
`id`, `candidate_score_id`, `criterion_id`, `score`, `maximum_score`, `reasoning`.

## 40. DATABASE STRUCTURE: admin_decisions
`id`, `candidate_application_id`, `reviewer_id`, `decision`, `notes`, `created_at`, `updated_at`.

## 41. DATABASE STRUCTURE: ai_processing_jobs
`id`, `candidate_application_id`, `job_type`, `status`, `attempts`, `error_message`, `started_at`, `completed_at`, `created_at`.

## 42. DATABASE STRUCTURE: audit_logs
`id`, `user_id`, `action`, `entity_type`, `entity_id`, `metadata`, `created_at`.

## 42b. DATABASE STRUCTURE: platform_settings
`key`, `value`, `updated_at`. Stores platform secrets/config (e.g. `google_oauth_refresh_token`, `google_oauth_connected_email`). Admin-only RLS. Used for automatic Google Drive OAuth refresh token storage.

## 43. DATABASE RELATIONSHIP
USERS -> JOBS, ADMIN_DECISIONS. JOBS -> JOB VERSIONS, SCORING MODEL. SCORING MODEL -> SCORING CRITERIA. CANDIDATES -> APPLICATIONS. APPLICATIONS -> CV FILES, CANDIDATE PROFILE, SCREENING RESULT, CANDIDATE SCORE.

## 44. LANGGRAPH WORKFLOW
START -> Load Application -> Validate File -> Extract CV -> Validate Extraction -> Load Job -> Load Scoring Model -> Audit Candidate -> Calculate Score -> Store Result -> Update Ranking -> Archive CV -> END.

## 45. LANGGRAPH STATE
`RecruitmentState { applicationId, jobId, candidateId, driveFileId, candidateData, jobData, scoringModel, screeningResult, scoreResult, status, error }`

## 46. LEAD ROUTER AGENT
Determine which workflow should process the CV. It must NOT make hiring decisions. The job is already associated with the application.

## 47. VISION SCREENER AGENT
Model: Gemini Flash. Tools: `gdrive_download_file`. Tasks: Download CV -> Read PDF/Image -> Extract information -> Return structured JSON.

## 48. DYNAMIC AUDITOR AGENT
Model: Groq Llama. Inputs: Candidate Profile, Job Description, Mandatory Requirements, Scoring Model, Scoring Criteria. Output: Final score, matched skills, missing skills.

## 49. REPORTING AGENT
The Reporting Agent synchronizes results. Primary destination: Supabase PostgreSQL. Optional: Google Sheets.

## 50. GOOGLE SHEETS REPORT
Optional columns: Date, Candidate, Email, Job, Job Type, Score, Recommendation, Matched Skills, Missing Skills, Status, Reviewed By.

## 51. DRIVE ARCHIVING
After successful processing: move CV from `Incoming_CVs/{job_slug}/` to `Archive/{job_slug}/`. Database: `storage_status: ARCHIVED`.

On processing failure (after retries): move CV from `Incoming_CVs/{job_slug}/` to `Manual_Review/{job_slug}/`. Database: `processing_status: MANUAL_REVIEW`.

## 52. FAILURE HANDLING
Every AI step must have retry logic. Recommended: `MAX_RETRIES = 3`. Do not endlessly retry. Fallback to Manual Review.

## 53. IDEMPOTENCY
The system must prevent duplicate CV processing. Use: `drive_file_id` and `application_id` as identifiers.

## 54. SECURITY
Never expose to the frontend or client bundles:
* `SUPABASE_SERVICE_ROLE_KEY`
* `GEMINI_API_KEY`, `GROQ_API_KEY`
* `GOOGLE_OAUTH_CLIENT_SECRET`
* `GOOGLE_OAUTH_REFRESH_TOKEN` (store in `platform_settings` or server `.env` only)
* `WORKER_API_SECRET`

`NEXT_PUBLIC_*` vars are safe for the browser (Supabase URL/anon key only).

## 55. SUPABASE CONNECTION
Use Supabase connection pooler for application/serverless connections. Never expose the database connection string to the browser.

## 56. SUPABASE ROW LEVEL SECURITY
RLS must be enabled. Users must only access data allowed by their role.

## 57. ROLE-BASED ACCESS CONTROL
Roles: ADMIN (all features), RECRUITER (upload CVs, view candidates), REVIEWER (view assigned candidates).

## 58. ADMIN DASHBOARD
Main dashboard: Active Jobs, Total Candidates, Pending Review, Interviews, Recent Applications with Scores.

## 59. JOB CREATION UI
UI fields for Job Title, Type, AI Generation, Scoring Model adjustments, Save Draft, Publish.

## 60. BEAUTIFUL JOB VACANCY DISPLAY
Published vacancies should look like a professional recruitment website.

## 61. PUBLIC JOB PAGE
The public page must NOT expose: Scoring weights, Internal hiring bar, AI prompts, Internal notes, Candidate rankings, Admin information.

## 62. APPLICATION FLOW
Public Job Page -> Apply -> Candidate Form -> Upload CV -> Create Application -> Google Drive -> AI Processing.

## 63. REAL-TIME PROCESSING STATUS
Use Supabase Realtime where possible for updates (CV Uploaded, AI Extraction, Scoring, Completed). Do not expose sensitive AI prompts.

## 64. CANDIDATE DASHBOARD
Candidate details: Score, Recommendation, Criterion breakdown, Matched Skills, Missing Skills.

## 65. CANDIDATE RANKING
Candidates for each job are ranked by: `Final Score DESC`. Tie-breaking should be deterministic (Score -> Mandatory -> Technical -> Date). *Calculated dynamically via DB views to prevent lock contention.*

## 66. AI FAIRNESS
The AI must NOT score candidates based on protected or irrelevant characteristics (Gender, Race, Religion, etc.).

## 67. AI DECISION LIMITATION
The AI is an assistant. The AI should NOT independently hire, reject permanently, or send rejection emails.

## 68. AUDITABILITY
Every AI decision must be traceable. Store: Model, Prompt Version, Scoring Version, Timestamp, Final Score, Reasoning.

## 69. PROMPT VERSIONING
AI prompts must be versioned. Do not silently change prompts in production.

## 70. AI MODEL CONFIGURATION
Do not hardcode model names. Use configuration (e.g., `VISION_MODEL=gemini-flash`).

## 71. ENVIRONMENT VARIABLES

### App
* `NEXT_PUBLIC_APP_URL` — e.g. `http://localhost:3000`

### Supabase
* `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
* `SUPABASE_SERVICE_ROLE_KEY` (server/worker only)
* `SUPABASE_URL` (worker — same project URL)
* `SUPABASE_DB_URL` (optional direct pooler connection)

### Google Drive — OAuth (personal Gmail)
* `GOOGLE_OAUTH_CLIENT_ID`
* `GOOGLE_OAUTH_CLIENT_SECRET`
* `GOOGLE_OAUTH_REDIRECT_URI` — e.g. `http://localhost:3000/api/google/callback`
* `GOOGLE_OAUTH_REFRESH_TOKEN` (optional — overrides DB if set; otherwise use Settings → Connect)

### Google Drive — folder IDs (manual bootstrap in My Drive)
* `GOOGLE_DRIVE_ROOT_FOLDER_ID` — `Recruitment/`
* `GOOGLE_DRIVE_INCOMING_ROOT_ID` — `Recruitment/Incoming_CVs/`
* `GOOGLE_DRIVE_MANUAL_REVIEW_ROOT_ID` — `Recruitment/Manual_Review/`
* `GOOGLE_DRIVE_ARCHIVE_ROOT_ID` — `Recruitment/Archive/`

### AI (worker)
* `GEMINI_API_KEY`, `GROQ_API_KEY`
* `VISION_MODEL`, `REASONING_MODEL`

### Worker queue
* `RAILWAY_WORKER_URL` — e.g. `http://localhost:3001`
* `WORKER_API_SECRET`

### Processing
* `MAX_AI_RETRIES`, `WORKER_CONCURRENCY`, `LOG_LEVEL`

## 72. MCP TOOLS
MCP servers/tools run persistently on the Railway worker. The AI agents should only receive the tools they actually need.

## 73. MCP SECURITY
Use least privilege. Vision Agent -> download_file only. Auditor -> database/job data only.

## 74. JOB CREATION AUTOMATION
When admin publishes: Save Job -> Create job subfolder under each system stage root (`Incoming_CVs/{job_slug}/`, `Manual_Review/{job_slug}/`, `Archive/{job_slug}/`) -> Save per-job folder IDs -> Publish Job. If Drive fails, keep as DRAFT.

## 75. JOB DELETION
Do not immediately permanently delete jobs. Use `ARCHIVED` for historical jobs.

## 76. JOB CLOSING
When a job is closed: `Job Status: CLOSED`. New applications disabled.

## 77. DATA RETENTION
Implement configurable retention policies (e.g., CV retention: 12 months) based on legal requirements.

## 78. ERROR STATES
Supported application processing states: UPLOADED, QUEUED, PROCESSING, COMPLETED, FAILED, MANUAL_REVIEW. Never leave stuck in PROCESSING.

## 79. OBSERVABILITY
Track: AI processing time, Gemini errors, Groq errors, Failed jobs. Use structured logs. Do not log CV contents.

## 80. PERFORMANCE & TIMEOUT AVOIDANCE
Use asynchronous processing. Do NOT make the Vercel frontend/API wait for Gemini + Groq. Return immediately and queue the job for the Railway worker.

## 81. CONCURRENCY
Apply provider rate limits. Use a controlled worker concurrency limit (e.g., max 5 parallel jobs) on the Railway queue to prevent `429` errors.

## 82. TRANSACTION SAFETY
When storing AI results: `BEGIN` -> Save screening result -> Save score -> Save criterion scores -> Update application status -> `COMMIT`. Rollback on failure.

## 83. GOOGLE DRIVE CONSISTENCY
Database and Drive can become temporarily inconsistent. Use a periodic Cron/reconciliation job on Railway to fix inconsistent states.

## 84. BACKGROUND WORKER (RAILWAY HANDOFF)
LangGraph workflows **MUST NOT** run on Vercel API routes due to 15-60s timeouts. 
Architecture: Next.js / Vercel -> Queue -> **Railway Worker Container** -> Gemini + Groq -> Supabase.

## 85. API DESIGN
APIs require authorization where applicable.

| Route | Purpose | Auth |
|-------|---------|------|
| `GET /api/health` | Health check | Public |
| `POST /api/applications/[id]/process` | Queue CV screening on worker | Server (future: session) |
| `GET /api/google/authorize` | Start Google OAuth | ADMIN session |
| `GET /api/google/callback` | OAuth callback, save refresh token | Google redirect |
| `POST /auth/signout` | Supabase sign out | Session |

Server actions (not REST): `createJobDraft`, `publishJob`, `uploadCvForJob` in `lib/jobs/actions.ts`, `lib/applications/actions.ts`.

## 86. VALIDATION
Use Zod schemas for: Job, Job Type, Job Description, Scoring Model, Scoring Criteria, Candidate, Application, AI Output.

## 87. UI VALIDATION
Client-side validation improves UX. Server-side validation is mandatory.

## 88. ADMIN JOB PREVIEW
Before publishing: The admin should see exactly how the public vacancy will appear.

## 89. AI GENERATION APPROVAL
AI-generated JD status: GENERATED -> ADMIN_REVIEW -> APPROVED -> PUBLISHED. AI cannot directly publish.

## 90. SCORING MODEL APPROVAL
Scoring model lifecycle: DRAFT -> VALIDATED -> APPROVED -> ACTIVE. Only one scoring model active per job.

## 91. VERSIONING
Jobs should support versioning for Job Description, Scoring Model, AI Prompt, AI Model.

## 92. FINAL RESULT STORAGE
PostgreSQL = Truth. Google Drive = Files. Google Sheets = Reporting.

## 93. BACKUP STRATEGY
Important database data should have backups through Supabase. Do not rely on Google Drive as a DB backup.

## 94. TESTING
The application must include: Unit Tests, Integration Tests, End-to-End Tests.

## 95. AI TEST DATA
Use synthetic CVs during testing. Do not use real candidate personal information.

## 96. PRODUCTION CHECKLIST
- [x] Next.js frontend + admin layout
- [x] Supabase schema + RLS migrations
- [x] Supabase Auth login
- [x] Job create / publish / CV upload (admin)
- [x] Google Drive OAuth (personal Gmail)
- [x] Worker LangGraph pipeline + queue handoff
- [x] Gemini + Groq wired in worker
- [x] Worker Drive download/archive (OAuth token)
- [x] AI output validation end-to-end (Zod + manual-review fallback)
- [x] Public apply flow

## 97. IMPORTANT BUSINESS RULES
1. Every CV belongs to a specific job application.
2. Every job has exactly one active scoring model.
3. Scoring weights must equal 100%.
4. AI-generated JDs require admin approval.
5. AI cannot directly hire candidates.
6. AI cannot permanently reject candidates without human review.
7. Original CVs are stored in Google Drive.
8. Recruitment results are stored in Supabase PostgreSQL.
9. Drive IDs are stored in the database (system stage roots in env; per-job subfolder IDs on `jobs`).
10. Do not depend on folder names for system logic.
11. System stage folders (`Incoming_CVs/`, `Manual_Review/`, `Archive/`) are created once; job subfolders are created per published vacancy.

## 98. COMPLETE END-TO-END EXAMPLE
Admin creates Job -> Configures Scoring -> Publishes -> Job subfolders created under `Incoming_CVs/`, `Manual_Review/`, and `Archive/` -> Candidate uploads CV to `Incoming_CVs/{job_slug}/` -> Vercel API queues job -> Railway Worker triggers -> Gemini extracts JSON -> Groq scores JSON -> Supabase stores transaction -> CV moved to `Archive/{job_slug}/` -> Admin reviews score -> Admin makes final decision.

## 99. FINAL ARCHITECTURAL PRINCIPLE
The system should follow this hierarchy:
* **HUMAN:** Admin / Recruiter
* **RECRUITMENT SYSTEM:** Database (Supabase) & UI
* **AI PROCESSING:** LangGraph (Railway) -> Gemini (Vision) & Groq (Reasoning) -> AI Result
* **FINAL DECISION:** Human Review