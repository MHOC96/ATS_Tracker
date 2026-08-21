/**
 * Unified enqueue: BullMQ when Redis is configured, HTTP handoff as fallback.
 */

import { after } from "next/server";
import { enqueueCvScreeningJob, isRedisQueueEnabled } from "@/lib/queue/bullmq";
import { queueApplicationProcessing } from "@/lib/queue/handoff";

export async function enqueueApplicationProcessing(
  applicationId: string
): Promise<void> {
  if (process.env.NODE_ENV === "production" && !isRedisQueueEnabled()) {
    throw new Error(
      "REDIS_URL is required in production for durable job enqueue"
    );
  }

  if (isRedisQueueEnabled()) {
    await enqueueCvScreeningJob(applicationId);
    return;
  }

  // Local dev: fire-and-forget HTTP handoff — do not block after() callbacks.
  void queueApplicationProcessing(applicationId).catch((error) => {
    console.error(
      `[queue] HTTP handoff failed for application ${applicationId}:`,
      error instanceof Error ? error.message : error
    );
  });
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
