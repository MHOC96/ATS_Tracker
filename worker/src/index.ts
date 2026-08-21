/**
 * Railway worker entry point.
 * LangGraph workflows, Gemini vision, and Groq reasoning run here — not on Vercel.
 */

import "./load-env.js";

import { createServer } from "http";
import { z } from "zod";
import { workerConfig } from "./config.js";
import { withWorkerConcurrency } from "./concurrency.js";
import { completeCvUploadToDrive } from "./jobs/complete-cv-upload.js";
import { runRecruitmentWorkflow } from "./graph/workflow.js";
import { startCvScreeningWorker } from "./queue/bullmq-worker.js";

const PORT = Number(process.env.PORT ?? 3001);
const WORKER_SECRET = process.env.WORKER_API_SECRET;
const MAX_BODY_BYTES = 4096;

if (process.env.NODE_ENV === "production" && !WORKER_SECRET) {
  console.error("[worker] WORKER_API_SECRET is required in production");
  process.exit(1);
}

const processPayloadSchema = z.object({
  applicationId: z.string().uuid(),
});

function isAuthorized(req: import("http").IncomingMessage): boolean {
  if (!WORKER_SECRET) {
    return process.env.ALLOW_INSECURE_WORKER === "true";
  }
  const auth = req.headers.authorization;
  return auth === `Bearer ${WORKER_SECRET}`;
}

async function processApplication(applicationId: string): Promise<void> {
  await withWorkerConcurrency(async () => {
    await completeCvUploadToDrive(applicationId);

    const result = await runRecruitmentWorkflow(applicationId);

    if (result.status === "FAILED" || result.status === "MANUAL_REVIEW") {
      console.error(
        "[worker] completed",
        applicationId,
        result.status,
        result.error ?? "no error message"
      );
    } else {
      console.log("[worker] completed", applicationId, result.status);
    }
  });
}

const server = createServer(async (req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", service: "ats-worker" }));
    return;
  }

  if (req.url === "/process" && req.method === "POST") {
    if (!isAuthorized(req)) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Unauthorized" }));
      return;
    }

    let body = "";
    let bodyTooLarge = false;

    req.on("data", (chunk: Buffer | string) => {
      body += chunk;
      if (body.length > MAX_BODY_BYTES) {
        bodyTooLarge = true;
        req.destroy();
      }
    });

    req.on("end", async () => {
      if (bodyTooLarge) {
        res.writeHead(413, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Payload too large" }));
        return;
      }

      try {
        const payload = processPayloadSchema.parse(
          body ? JSON.parse(body) : {}
        );

        res.writeHead(202, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            accepted: true,
            applicationId: payload.applicationId,
          })
        );

        processApplication(payload.applicationId).catch((error) => {
          console.error("[worker] failed", payload.applicationId, error);
        });
      } catch (error) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: error instanceof Error ? error.message : "Invalid payload",
          })
        );
      }
    });

    req.on("error", () => {
      if (!res.headersSent) {
        res.writeHead(413, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Payload too large" }));
      }
    });

    return;
  }

  res.writeHead(404);
  res.end("Not Found");
});

startCvScreeningWorker();

server.listen(PORT, () => {
  console.log(`[worker] ATS AI worker listening on port ${PORT}`);
  console.log(
    `[worker] vision=${workerConfig.visionModel} reasoning=${workerConfig.reasoningModel} geminiKeys=${workerConfig.geminiApiKeyCount}`
  );
  console.log("[worker] LangGraph workflow ready (Gemini + Groq)");
});
