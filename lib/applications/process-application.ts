import type { SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import {
  buildCvStagingPath,
  uploadCvToStaging,
} from "@/lib/storage/cv-staging";
import { enqueueApplicationProcessing } from "@/lib/queue/enqueue";

export type ApplicationJobRow = {
  id: string;
  title: string;
  status: string;
  incoming_folder_id: string | null;
};

type CvFileInput = {
  name: string;
  type: string;
  size: number;
  buffer: Buffer;
};

export type CreateApplicationResult =
  | { success: true; applicationId: string; jobTitle: string }
  | { success: false; error: string };

function formatPipelineError(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as Error).name === "AggregateError"
  ) {
    return "Cannot connect to Redis — check REDIS_URL (use redis://..., not redis:redis://...) or unset REDIS_URL for local HTTP worker";
  }
  if (error instanceof Error) {
    if (error.message.trim()) return error.message;
    if (error.name && error.name !== "Error") return error.name;
    if (error.cause instanceof Error && error.cause.message.trim()) {
      return error.cause.message;
    }
  }
  if (typeof error === "string" && error.trim()) return error;
  try {
    const serialized = JSON.stringify(error);
    if (serialized && serialized !== "{}" && serialized !== "null") {
      return serialized;
    }
  } catch {
    // ignore
  }
  return "Pipeline start failed (check REDIS_URL, cv-staging bucket, migrations)";
}

async function markUploadFailed(
  supabase: SupabaseClient,
  applicationId: string,
  message: string
): Promise<void> {
  await supabase
    .from("candidate_applications")
    .update({ status: "MANUAL_REVIEW" })
    .eq("id", applicationId);

  await supabase
    .from("ai_processing_jobs")
    .update({
      status: "FAILED",
      error_message: message,
      completed_at: new Date().toISOString(),
    })
    .eq("candidate_application_id", applicationId)
    .eq("status", "QUEUED");
}

export async function createApplicationWithCv(
  supabase: SupabaseClient,
  jobId: string,
  fullName: string | null,
  email: string | null,
  file: CvFileInput,
  preloadedJob?: ApplicationJobRow
): Promise<CreateApplicationResult> {
  let typedJob: ApplicationJobRow;

  if (preloadedJob && preloadedJob.id === jobId) {
    typedJob = preloadedJob;
  } else {
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("id, title, status, incoming_folder_id")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      return { success: false, error: "Job not found" };
    }

    typedJob = job as ApplicationJobRow;
  }

  if (typedJob.status !== "PUBLISHED") {
    return { success: false, error: "This job is not accepting applications" };
  }

  if (!typedJob.incoming_folder_id) {
    return { success: false, error: "Job incoming folder is not configured" };
  }

  const pendingId = randomUUID();
  const stagingPath = buildCvStagingPath(`pending-${pendingId}`, file.name);

  const { data: rows, error: rpcError } = await supabase.rpc(
    "create_application_with_pending_cv",
    {
      p_job_id: jobId,
      p_full_name: fullName,
      p_email: email,
      p_file_name: file.name,
      p_mime_type: file.type || "application/pdf",
      p_file_size: file.size,
      p_storage_path: stagingPath,
      p_drive_folder_id: typedJob.incoming_folder_id,
    }
  );

  if (rpcError || !rows?.length) {
    return {
      success: false,
      error: rpcError?.message ?? "Failed to create application",
    };
  }

  const row = rows[0] as { application_id: string; job_title: string };
  const applicationId = row.application_id;
  const jobTitle = row.job_title;

  try {
    console.log(`[apply] staging CV for application ${applicationId}`);
    await uploadCvToStaging(
      stagingPath,
      file.buffer,
      file.type || "application/pdf"
    );
    console.log(`[apply] enqueue screening for application ${applicationId}`);
    await enqueueApplicationProcessing(applicationId);
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[apply] staged CV and queued screening for application ${applicationId}`
      );
    }
  } catch (error) {
    const message = formatPipelineError(error);
    console.error(
      `[apply] pipeline start failed ${applicationId}: ${message}`,
      error instanceof Error && error.stack ? `\n${error.stack}` : ""
    );
    await markUploadFailed(supabase, applicationId, message);
    return { success: false, error: message };
  }

  return {
    success: true,
    applicationId,
    jobTitle,
  };
}
