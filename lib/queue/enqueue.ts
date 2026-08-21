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

export async function enqueueApplicationProcessing(
  applicationId: string
): Promise<void> {
  if (process.env.NODE_ENV === "production" && !isRedisQueueEnabled()) {
    throw new Error(
      "REDIS_URL is required in production for durable job enqueue"
    );
  }

  if (isRedisQueueEnabled()) {
    try {
      await enqueueViaRedis(applicationId);
      return;
    } catch (error) {
      if (process.env.NODE_ENV === "production" || !isRedisEnqueueTimeout(error)) {
        throw error instanceof Error ? error : new Error(String(error));
      }
      console.warn(
        `[queue] Redis enqueue timed out — falling back to HTTP for ${applicationId}`
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
