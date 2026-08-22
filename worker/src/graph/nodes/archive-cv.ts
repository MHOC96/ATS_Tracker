import { moveDriveFile } from "../../google/drive.js";
import { createAdminClient } from "../../supabase.js";
import type { RecruitmentState } from "../state.js";

export async function archiveCv(
  state: RecruitmentState
): Promise<Partial<RecruitmentState>> {
  try {
    if (
      !state.driveFileId ||
      !state.incomingFolderId ||
      !state.archiveFolderId
    ) {
      return {
        status: "COMPLETED",
        error: "Archive skipped: missing Drive folder configuration",
      };
    }

    const fromFolders = [
      state.incomingFolderId,
      state.manualReviewFolderId,
    ].filter(Boolean);

    let moved = false;
    for (const fromFolderId of fromFolders) {
      try {
        await moveDriveFile(
          state.driveFileId,
          fromFolderId,
          state.archiveFolderId
        );
        moved = true;
        break;
      } catch {
        // try next parent folder (e.g. CV already in Manual_Review)
      }
    }

    if (!moved) {
      throw new Error(
        "CV is not in Incoming_CVs or Manual_Review folder — archive skipped"
      );
    }

    const supabase = createAdminClient();
    const now = new Date().toISOString();

    await supabase
      .from("cv_files")
      .update({
        storage_status: "ARCHIVED",
        drive_folder_id: state.archiveFolderId,
        archived_at: now,
      })
      .eq("candidate_application_id", state.applicationId);

    return { status: "COMPLETED" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to archive CV";
    console.error("[graph] archiveCv failed", state.applicationId, message);

    return {
      status: "COMPLETED",
      error: message,
    };
  }
}
