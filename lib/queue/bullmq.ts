import { Queue } from "bullmq";

export const CV_SCREENING_QUEUE = "cv-screening";

export type CvScreeningJobData = {
  applicationId: string;
};

type RedisConnectionOptions = {
  host: string;
  port: number;
  password?: string;
  maxRetriesPerRequest: null;
  connectTimeout: number;
  retryStrategy: (times: number) => number | null;
};

let queue: Queue<CvScreeningJobData> | null = null;

function getRedisUrl(): string | null {
  const raw = process.env.REDIS_URL?.trim();
  if (!raw) return null;

  // Railway copy-paste mistake: "redis:redis://..." instead of "redis://..."
  if (raw.startsWith("redis:redis://")) {
    const normalized = raw.slice("redis:".length);
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[queue] REDIS_URL had an extra redis: prefix — normalized automatically"
      );
    }
    return normalized;
  }

  return raw;
}

function parseRedisConnection(url: string): RedisConnectionOptions {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: Number(parsed.port || 6379),
    password: parsed.password || undefined,
    maxRetriesPerRequest: null,
    connectTimeout: 5000,
    retryStrategy(times: number) {
      if (times > 2) return null;
      return Math.min(times * 400, 1200);
    },
  };
}

export function isRedisQueueEnabled(): boolean {
  return Boolean(getRedisUrl());
}

export function getCvScreeningQueue(): Queue<CvScreeningJobData> {
  const redisUrl = getRedisUrl();
  if (!redisUrl) {
    throw new Error("REDIS_URL is not configured");
  }

  if (!queue) {
    queue = new Queue<CvScreeningJobData>(CV_SCREENING_QUEUE, {
      connection: parseRedisConnection(redisUrl),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: 1000,
        removeOnFail: 5000,
      },
    });
  }

  return queue;
}

export async function enqueueCvScreeningJob(
  applicationId: string
): Promise<void> {
  const screeningQueue = getCvScreeningQueue();
  await screeningQueue.add(
    "screen",
    { applicationId },
    {
      jobId: applicationId,
    }
  );
}
