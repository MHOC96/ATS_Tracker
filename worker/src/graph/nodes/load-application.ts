import { createAdminClient } from "../../supabase.js";
import type { RecruitmentState } from "../state.js";

export async function loadApplication(
  state: RecruitmentState
): Promise<Partial<RecruitmentState>> {
  const supabase = createAdminClient();

  const { data: application, error } = await supabase
    .from("candidate_applications")
    .select(
      `
      id,
      job_id,
      candidate_id,
      drive_file_id,
      cv_file_id,
      status,
      candidates(id, full_name, email),
      jobs(
        id,
        incoming_folder_id,
        manual_review_folder_id,
        archive_folder_id
      ),
      cv_files(id, mime_type, drive_folder_id)
    `
    )
    .eq("id", state.applicationId)
    .single();

  if (error || !application) {
    return {
      status: "FAILED",
      error: error?.message ?? "Application not found",
    };
  }

  await supabase
    .from("ai_processing_jobs")
    .update({
      status: "PROCESSING",
      started_at: new Date().toISOString(),
      attempts: 1,
    })
    .eq("candidate_application_id", state.applicationId)
    .eq("status", "QUEUED");

  await supabase
    .from("candidate_applications")
    .update({ status: "PROCESSING" })
    .eq("id", application.id);

  const candidate = application.candidates as unknown as {
    full_name: string | null;
    email: string | null;
  } | null;

  const job = application.jobs as unknown as {
    incoming_folder_id: string | null;
    manual_review_folder_id: string | null;
    archive_folder_id: string | null;
  } | null;

  const cvFile = application.cv_files as unknown as {
    id: string;
    mime_type: string | null;
    drive_folder_id: string | null;
  } | null;

  return {
    applicationId: application.id,
    jobId: application.job_id,
    candidateId: application.candidate_id,
    driveFileId: application.drive_file_id ?? "",
    cvFileId: application.cv_file_id ?? cvFile?.id ?? "",
    cvMimeType: cvFile?.mime_type ?? "application/pdf",
    incomingFolderId: job?.incoming_folder_id ?? cvFile?.drive_folder_id ?? "",
    manualReviewFolderId: job?.manual_review_folder_id ?? "",
    archiveFolderId: job?.archive_folder_id ?? "",
    processingStartedAt: Date.now(),
    status: "LOADED",
    candidateData: {
      fullName: candidate?.full_name,
      email: candidate?.email,
    },
  };
}
