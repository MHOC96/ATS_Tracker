/**
 * Queue handoff from Vercel API gateway to Railway worker.
 * Next.js / Vercel -> Queue -> Railway Worker -> Gemini + Groq -> Supabase
 */

type QueueResult = {
  queued: boolean;
  applicationId: string;
  message: string;
};

export async function queueApplicationProcessing(
  applicationId: string
): Promise<QueueResult> {
  const workerUrl = process.env.RAILWAY_WORKER_URL;
  const workerSecret = process.env.WORKER_API_SECRET;

  if (!workerUrl) {
    // Development fallback — worker not configured yet
    return {
      queued: false,
      applicationId,
      message:
        "RAILWAY_WORKER_URL not configured. Processing queue handoff skipped.",
    };
  }

  const response = await fetch(`${workerUrl}/process`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(workerSecret ? { Authorization: `Bearer ${workerSecret}` } : {}),
    },
    body: JSON.stringify({ applicationId }),
  });

  if (!response.ok) {
    throw new Error(`Worker rejected job: ${response.status}`);
  }

  return {
    queued: true,
    applicationId,
    message: "Application queued for AI processing on Railway worker.",
  };
}
