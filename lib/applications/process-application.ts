import type { SupabaseClient } from "@supabase/supabase-js";
import { uploadFileToDriveFolder } from "@/lib/google/drive";
import { scheduleApplicationProcessing } from "@/lib/queue/handoff";

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

  const { driveFileId, driveFileUrl } = await uploadFileToDriveFolder(
    typedJob.incoming_folder_id,
    file.name,
    file.type || "application/octet-stream",
    file.buffer
  );

  const { data: candidate, error: candidateError } = await supabase
    .from("candidates")
    .insert({
      full_name: fullName,
      email,
    })
    .select("id")
    .single();

  if (candidateError || !candidate) {
    return {
      success: false,
      error: candidateError?.message ?? "Failed to create candidate",
    };
  }

  const { data: application, error: applicationError } = await supabase
    .from("candidate_applications")
    .insert({
      candidate_id: candidate.id,
      job_id: typedJob.id,
      drive_file_id: driveFileId,
      drive_file_url: driveFileUrl,
      status: "APPLIED",
    })
    .select("id")
    .single();

  if (applicationError || !application) {
    return {
      success: false,
      error: applicationError?.message ?? "Failed to create application",
    };
  }

  const { data: cvFile, error: cvError } = await supabase
    .from("cv_files")
    .insert({
      candidate_application_id: application.id,
      file_name: file.name,
      mime_type: file.type || null,
      file_size: file.size,
      drive_file_id: driveFileId,
      drive_folder_id: typedJob.incoming_folder_id,
      storage_status: "UPLOADED",
    })
    .select("id")
    .single();

  if (cvError || !cvFile) {
    return {
      success: false,
      error: cvError?.message ?? "Failed to record CV file",
    };
  }

  await supabase
    .from("candidate_applications")
    .update({ cv_file_id: cvFile.id })
    .eq("id", application.id);

  await supabase.from("ai_processing_jobs").insert({
    candidate_application_id: application.id,
    job_type: "CV_SCREENING",
    status: "QUEUED",
  });

  scheduleApplicationProcessing(application.id);

  return {
    success: true,
    applicationId: application.id,
    jobTitle: typedJob.title,
  };
}
