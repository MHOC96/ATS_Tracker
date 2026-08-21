import { Worker, type Job } from "bullmq";
import { completeCvUploadToDrive } from "../jobs/complete-cv-upload.js";
import { runRecruitmentWorkflow } from "../graph/workflow.js";

export const CV_SCREENING_QUEUE = "cv-screening";

export type CvScreeningJobData = {
  applicationId: string;
};

type RedisConnectionOptions = {
  host: string;
  port: number;
  password?: string;
  maxRetriesPerRequest: null;
};

let worker: Worker<CvScreeningJobData> | null = null;

function parseRedisConnection(url: string): RedisConnectionOptions {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: Number(parsed.port || 6379),
    password: parsed.password || undefined,
    maxRetriesPerRequest: null,
  };
}

export function isRedisQueueEnabled(): boolean {
  return Boolean(process.env.REDIS_URL?.trim());
}

export function startCvScreeningWorker(): Worker<CvScreeningJobData> | null {
  const redisUrl = process.env.REDIS_URL?.trim();
  if (!redisUrl) {
    console.warn(
      "[worker] REDIS_URL not set — BullMQ consumer disabled (HTTP /process only)"
    );
    return null;
  }

  if (worker) return worker;

  worker = new Worker<CvScreeningJobData>(
    CV_SCREENING_QUEUE,
    async (job: Job<CvScreeningJobData>) => {
      const { applicationId } = job.data;
      console.log("[worker] BullMQ job started", applicationId);

      await completeCvUploadToDrive(applicationId);

      const result = await runRecruitmentWorkflow(applicationId);

      if (result.status === "FAILED" || result.status === "MANUAL_REVIEW") {
        console.error(
          "[worker] BullMQ job completed with issues",
          applicationId,
          result.status,
          result.error ?? ""
        );
      } else {
        console.log("[worker] BullMQ job completed", applicationId, result.status);
      }

      return result;
    },
    {
      connection: parseRedisConnection(redisUrl),
      concurrency: Number(process.env.WORKER_CONCURRENCY ?? 5),
    }
  );

  worker.on("failed", (job: Job<CvScreeningJobData> | undefined, error: Error) => {
    console.error("[worker] BullMQ job failed", job?.id, error.message);
  });

  console.log("[worker] BullMQ consumer listening on queue", CV_SCREENING_QUEUE);
  return worker;
}
