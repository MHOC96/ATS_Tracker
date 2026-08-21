import { moveDriveFile } from "../google/drive.js";
import { workerConfig } from "../config.js";
import { createAdminClient } from "../supabase.js";
import type { RecruitmentState } from "../graph/state.js";

type FinalizeOptions = {
  aiJobStatus: "FAILED" | "MANUAL_REVIEW";
  extractionStatus?: "FAILED" | "MANUAL_REVIEW";
  moveToManualReview?: boolean;
};

export async function finalizeProcessingFailure(
  state: RecruitmentState,
  options: FinalizeOptions
): Promise<void> {
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  if (
    options.moveToManualReview !== false &&
    state.driveFileId &&
    state.incomingFolderId &&
    state.manualReviewFolderId
  ) {
    try {
      await moveDriveFile(
        state.driveFileId,
        state.incomingFolderId,
        state.manualReviewFolderId
      );

      await supabase
        .from("cv_files")
        .update({
          drive_folder_id: state.manualReviewFolderId,
        })
        .eq("candidate_application_id", state.applicationId);
    } catch (error) {
      console.error(
        "[worker] failed to move CV to manual review",
        state.applicationId,
        error
      );
    }
  }

  await supabase
    .from("candidate_applications")
    .update({ status: "MANUAL_REVIEW" })
    .eq("id", state.applicationId);

  await supabase
    .from("ai_processing_jobs")
    .update({
      status: options.aiJobStatus,
      error_message: state.error,
      completed_at: now,
    })
    .eq("candidate_application_id", state.applicationId)
    .eq("job_type", "CV_SCREENING");

  if (options.extractionStatus) {
    await supabase.from("screening_results").insert({
      candidate_application_id: state.applicationId,
      model: workerConfig.visionModel,
      extraction_status: options.extractionStatus,
      raw_structured_data: state.candidateData,
      processing_time_ms: state.processingStartedAt
        ? Date.now() - state.processingStartedAt
        : null,
    });
  }
}
