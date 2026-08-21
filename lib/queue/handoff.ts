/**
 * HTTP fallback handoff from Vercel API gateway to Railway worker.
 * Prefer BullMQ via lib/queue/enqueue.ts when REDIS_URL is set.
 */

const HANDOFF_TIMEOUT_MS = 5000;

type QueueResult = {
  queued: boolean;
  applicationId: string;
  message: string;
};

export async function queueApplicationProcessing(
  applicationId: string
): Promise<QueueResult> {
  const workerUrl = process.env.RAILWAY_WORKER_URL?.replace(/\/$/, "");
  const workerSecret = process.env.WORKER_API_SECRET;

  if (process.env.NODE_ENV === "production" && !workerSecret) {
    throw new Error(
      "WORKER_API_SECRET is required in production for worker handoff"
    );
  }

  if (!workerUrl) {
    return {
      queued: false,
      applicationId,
      message:
        "RAILWAY_WORKER_URL not configured. Processing queue handoff skipped.",
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), HANDOFF_TIMEOUT_MS);

  try {
    const response = await fetch(`${workerUrl}/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(workerSecret ? { Authorization: `Bearer ${workerSecret}` } : {}),
      },
      body: JSON.stringify({ applicationId }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Worker rejected job: ${response.status}`);
    }

    return {
      queued: true,
      applicationId,
      message: "Application queued for AI processing on Railway worker.",
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        `Worker handoff timed out after ${HANDOFF_TIMEOUT_MS}ms`
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
