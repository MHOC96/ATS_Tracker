# Worker (Railway)

LangGraph AI workflows run here — **not** on Vercel.

## Architecture

```text
Apply (Next.js) → Supabase staging bucket → BullMQ (Redis) or HTTP /process
                                              ↓
                                    Worker: Drive upload → LangGraph → scores
```

## Local development (required for public apply)

You need **three** processes running:

1. **Next.js** — `npm run dev` (repo root)
2. **Redis** — e.g. `docker run -p 6379:6379 redis` (matches `REDIS_URL` in `.env`)
3. **Worker** — `cd worker && npm run dev` (loads root `.env`)

### `.env` (repo root)

```env
RAILWAY_WORKER_URL=http://localhost:3001
REDIS_URL=redis://localhost:6379
WORKER_API_SECRET=your-local-secret   # optional if using Redis only
```

If **Redis is not running**, apply will fail with a queue error (CV is not copied to Google Drive).

If **Redis is unset**, set `ALLOW_INSECURE_WORKER=true` and ensure `RAILWAY_WORKER_URL=http://localhost:3001` so the app can POST to the worker HTTP endpoint.

### Supabase

Run migration `20260820500000_async_cv_pipeline.sql` (creates `cv-staging` bucket + `create_application_with_pending_cv` RPC).

### What you should see

**Next.js terminal** after a successful apply:

```text
[apply] staged CV and queued screening for application <uuid>
[queue] BullMQ job added for application <uuid>
```

**Worker terminal:**

```text
[worker] BullMQ job started <uuid>
[worker] BullMQ job completed <uuid> COMPLETED
```

The CV lands in Google Drive under `Incoming_CVs/{job_slug}/` first, then moves to `Archive/` after successful AI screening.

## Deployment

Deploy this directory as a separate Railway service with environment variables from root `.env.example`.
