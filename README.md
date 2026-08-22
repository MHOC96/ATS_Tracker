# ATS Tracker

AI-powered recruitment management platform for hiring teams. Publish roles, accept applications, screen CVs with vision + reasoning models, and review candidates in an admin dashboard—with human oversight for every hiring decision.

**Live demo:** [ats-galvan.vercel.app](https://ats-galvan.vercel.app)

---

## Features

- **Public careers site** — Browse published jobs and self-apply with CV upload
- **Admin dashboard** — Live metrics, recent applications, job and candidate management
- **AI job descriptions** — Groq-assisted JD generation with admin review before publish
- **Configurable scoring** — Per-job criteria with weights totaling 100%
- **Automated CV screening** — Gemini extraction + Groq audit against job requirements
- **Google Drive storage** — Stage-first folder layout (`Incoming_CVs`, `Manual_Review`, `Archive`)
- **Manual review queue** — Unreadable or failed CVs routed for human handling
- **RBAC** — Admin, Recruiter, and Reviewer roles with Supabase RLS

---

## Architecture

```text
┌─────────────────┐     queue      ┌──────────────────┐
│  Next.js (Vercel) │ ─────────────► │ Worker (Railway) │
│  Admin + Public   │   POST /process│ LangGraph pipeline│
└────────┬────────┘                └────────┬─────────┘
         │                                  │
         │         ┌────────────────────────┼────────────────┐
         └────────►│      Supabase PostgreSQL (source of truth)│
                   └──────────────────────────────────────────┘
         │
         └────────► Google Drive (CV files)
```

| Layer | Technology |
|-------|------------|
| Frontend / API gateway | Next.js 16, React 19, Tailwind CSS, shadcn/ui |
| Auth & database | Supabase (PostgreSQL, Auth, RLS) |
| AI vision | Google Gemini (CV extraction) |
| AI reasoning | Groq (scoring, JD generation) |
| Worker runtime | LangGraph on Railway |
| File storage | Google Drive (personal Gmail OAuth) |

---

## Prerequisites

- Node.js 20+
- npm
- [Supabase](https://supabase.com) project
- [Google Cloud](https://console.cloud.google.com) OAuth client (Drive API)
- [Gemini](https://aistudio.google.com/apikey) and [Groq](https://console.groq.com) API keys
- Google Drive folders bootstrapped under `Recruitment/`

---

## Quick start

### 1. Clone and install

```bash
git clone https://github.com/MHOC96/ATS_Tracker.git
cd ATS_Tracker
npm install
cd worker && npm install && cd ..
```

### 2. Environment

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

See [Environment variables](#environment-variables) below. Never commit `.env`.

### 3. Database

Run Supabase migrations in order (SQL Editor or CLI). Apply every file in `supabase/migrations/` chronologically. Key additions:

- `20260821200000_admin_performance.sql` — job list indexes, `update_job_with_scoring`, `save_admin_decision`, batch application counts

Legacy numbered list (partial):

1. `supabase/migrations/20260820000000_initial_schema.sql`
2. `supabase/migrations/20260820100000_auth_rls.sql`
3. `supabase/migrations/20260820200000_platform_settings.sql`

Create a user in Supabase Auth, then promote to admin:

```sql
UPDATE public.users SET role = 'ADMIN' WHERE email = 'your@email.com';
```

### 4. Google Drive bootstrap

Create in your Gmail My Drive:

```text
Recruitment/
├── Incoming_CVs/
├── Manual_Review/
└── Archive/
```

Copy each folder ID into `.env` (`GOOGLE_DRIVE_INCOMING_ROOT_ID`, etc.).

### 5. Run locally

**App (port 3000):**

```bash
npm run dev
```

**Worker (port 3001):**

```bash
cd worker
npm run dev
```

| URL | Purpose |
|-----|---------|
| http://localhost:3000 | Careers home + admin |
| http://localhost:3000/login | Admin login |
| http://localhost:3000/admin | Dashboard |
| http://localhost:3001/health | Worker health check |

### 6. First-time setup

1. Log in as admin → **Settings** → Connect Google Drive
2. **Jobs** → Create job → Publish
3. Apply via `/jobs/{slug}` or upload a CV from the job detail page
4. Confirm worker logs show processing completion

---

## Environment variables

Copy from `.env.example`. Split between Vercel and Railway in production.

### Vercel (Next.js)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | Public app URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Supabase key |
| `GROQ_API_KEY` | JD generation |
| `REASONING_MODEL` | e.g. `openai/gpt-oss-120b` |
| `GOOGLE_OAUTH_*` | Drive OAuth client + redirect URI |
| `GOOGLE_DRIVE_INCOMING_ROOT_ID` | Stage folder IDs (3) |
| `GOOGLE_DRIVE_MANUAL_REVIEW_ROOT_ID` | |
| `GOOGLE_DRIVE_ARCHIVE_ROOT_ID` | |
| `RAILWAY_WORKER_URL` | Worker public URL (no trailing slash) |
| `WORKER_API_SECRET` | Shared secret with Railway |
| `REDIS_URL` | **Required** — same public Redis URL as Railway worker (apply enqueues from Vercel) |

### Railway (worker)

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Same Supabase project |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key |
| `GEMINI_API_KEY` | CV extraction |
| `GROQ_API_KEY` | Candidate scoring |
| `VISION_MODEL` | e.g. `gemini-3.6-flash` |
| `REASONING_MODEL` | e.g. `openai/gpt-oss-120b` |
| `GOOGLE_OAUTH_*` | Drive download/move |
| `GOOGLE_DRIVE_*_ROOT_ID` | Same folder IDs as Vercel |
| `WORKER_API_SECRET` | Must match Vercel |
| `REDIS_URL` | Same public Redis URL as Vercel (BullMQ consumer) |

`WORKER_API_SECRET` is a random string you generate—not issued by a provider. Use the same value on both platforms.

---

## Deployment

### Vercel (app)

- **Root directory:** repository root (not `worker/`)
- **Build:** `npm run build`
- Add all Vercel env vars from `.env.example`
- Google OAuth redirect: `https://your-domain.vercel.app/api/google/callback`
- Supabase auth callback: `https://your-domain.vercel.app/auth/callback`

### Railway (worker)

- **Root directory:** `worker`
- **Build:** `npm install && npm run build`
- **Start:** `npm start` (runs `tsc` → `node dist/index.js`)
- Generate a public domain and set `RAILWAY_WORKER_URL` on Vercel

Deploy Railway first, then set `RAILWAY_WORKER_URL` on Vercel and redeploy.

---

## Project structure

```text
app/                    # Next.js App Router
  (admin)/admin/        # Protected admin UI
  (public)/             # Careers site + apply flow
  api/                  # Health, OAuth, queue handoff
lib/                    # Server actions, queries, Google, AI
worker/                 # LangGraph AI worker (Railway)
packages/shared/        # Shared Zod schemas
supabase/migrations/    # PostgreSQL schema + RLS
```

---

## Admin routes

| Route | Access |
|-------|--------|
| `/admin` | Dashboard |
| `/admin/jobs` | Job list |
| `/admin/jobs/new` | Create job |
| `/admin/jobs/[id]` | Job detail, publish, CV upload |
| `/admin/jobs/[id]/edit` | Edit job (admin) |
| `/admin/candidates` | Application list |
| `/admin/candidates/[id]` | Scores + recruiter decision |
| `/admin/manual-review` | Failed / manual-review queue |
| `/admin/settings` | Google Drive connection |

---

## Security

- Never expose `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `GROQ_API_KEY`, or OAuth secrets to the client
- AI provides recommendations only—humans make hiring decisions
- RLS enforced on all recruitment tables
- Public pages never expose scoring weights or internal criteria

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `cd worker && npm run dev` | Start worker with hot reload |
| `cd worker && npm run build` | Compile worker TypeScript |
| `cd worker && npm run typecheck` | Worker type check |

---

## Documentation

- [`AGENTS.md`](AGENTS.md) — Architecture, data model, and implementation status
- [`DESIGN.md`](DESIGN.md) — UI design tokens
- [`worker/README.md`](worker/README.md) — Worker overview

---

## License

[MIT License](LICENSE) — Copyright (c) 2026 mhoc
