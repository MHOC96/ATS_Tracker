/**
 * Unified enqueue: BullMQ when Redis is configured, HTTP handoff as fallback.
 */

import { after } from "next/server";
import { enqueueCvScreeningJob, isRedisQueueEnabled } from "@/lib/queue/bullmq";
import { queueApplicationProcessing } from "@/lib/queue/handoff";

const REDIS_ENQUEUE_TIMEOUT_MS = 4000;

function isRedisEnqueueTimeout(error: unknown): boolean {
  return error instanceof Error && error.message === "REDIS_ENQUEUE_TIMEOUT";
}

function isRedisConnectionError(error: unknown): boolean {
  if (error instanceof Error && error.name === "AggregateError") return true;
  const code = (error as NodeJS.ErrnoException)?.code;
  if (code === "ECONNREFUSED" || code === "ENOTFOUND" || code === "ETIMEDOUT") {
    return true;
  }
  if (error instanceof Error) {
    if (error.message.includes("ECONNREFUSED")) return true;
    if (error.message.includes("ENOTFOUND")) return true;
    if (error.message === "REDIS_ENQUEUE_TIMEOUT") return true;
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "errors" in error &&
    Array.isArray((error as AggregateError).errors)
  ) {
    return (error as AggregateError).errors.some((e) =>
      isRedisConnectionError(e)
    );
  }
  return false;
}

function shouldFallbackToHttpInDev(error: unknown): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    (isRedisEnqueueTimeout(error) || isRedisConnectionError(error))
  );
}

async function enqueueViaHttp(applicationId: string): Promise<void> {
  const result = await queueApplicationProcessing(applicationId);
  if (process.env.NODE_ENV !== "production") {
    console.log(
      `[queue] HTTP handoff for application ${applicationId}: queued=${result.queued} — ${result.message}`
    );
  }
  if (!result.queued) {
    throw new Error(result.message);
  }
}

async function enqueueViaRedis(applicationId: string): Promise<void> {
  await Promise.race([
    enqueueCvScreeningJob(applicationId),
    new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error("REDIS_ENQUEUE_TIMEOUT")),
        REDIS_ENQUEUE_TIMEOUT_MS
      );
    }),
  ]);
  if (process.env.NODE_ENV !== "production") {
    console.log(`[queue] BullMQ job added for application ${applicationId}`);
  }
}

function isLocalWorkerUrl(url: string): boolean {
  return /localhost|127\.0\.0\.1/i.test(url);
}

/** Local Next.js should call the local worker directly, not shared cloud Redis. */
function shouldPreferLocalHttpWorker(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  const url = process.env.RAILWAY_WORKER_URL?.trim() ?? "";
  return url.length > 0 && isLocalWorkerUrl(url);
}

export async function enqueueApplicationProcessing(
  applicationId: string
): Promise<void> {
  if (process.env.NODE_ENV === "production" && !isRedisQueueEnabled()) {
    throw new Error(
      "REDIS_URL is required in production on Vercel (Next.js app), not only on the Railway worker. " +
        "Add the same Redis connection URL to Vercel → Settings → Environment Variables, then redeploy."
    );
  }

  if (shouldPreferLocalHttpWorker()) {
    try {
      await enqueueViaHttp(applicationId);
      return;
    } catch (error) {
      console.warn(
        `[queue] Local HTTP worker failed for ${applicationId} — trying Redis`,
        error instanceof Error ? error.message : error
      );
    }
  }

  if (isRedisQueueEnabled()) {
    try {
      await enqueueViaRedis(applicationId);
      return;
    } catch (error) {
      if (process.env.NODE_ENV === "production" || !shouldFallbackToHttpInDev(error)) {
        const message =
          isRedisConnectionError(error)
            ? "Cannot connect to Redis (check REDIS_URL format: redis://host:port, not redis:redis://...)"
            : error instanceof Error
              ? error.message
              : String(error);
        throw error instanceof Error && !isRedisConnectionError(error)
          ? error
          : new Error(message);
      }
      console.warn(
        `[queue] Redis unreachable — falling back to HTTP worker for ${applicationId}`
      );
    }
  }

  await enqueueViaHttp(applicationId);
}

export function scheduleApplicationProcessing(applicationId: string): void {
  after(() => {
    enqueueApplicationProcessing(applicationId).catch((error) => {
      console.error(
        `[queue] enqueue failed for application ${applicationId}:`,
        error instanceof Error ? error.message : error
      );
    });
  });
}
