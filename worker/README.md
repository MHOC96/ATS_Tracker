# Worker (Railway)

LangGraph AI workflows run here — **not** on Vercel.

## Architecture

```
Next.js / Vercel API → Queue handoff → Railway Worker → Gemini + Groq → Supabase
```

## Development

```bash
cd worker
npm install
npm run dev
```

## Deployment

Deploy this directory as a separate Railway service with environment variables from `.env.example`.
