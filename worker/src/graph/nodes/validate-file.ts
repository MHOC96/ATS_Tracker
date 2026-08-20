import type { RecruitmentState } from "../state.js";

export async function validateFile(
  state: RecruitmentState
): Promise<Partial<RecruitmentState>> {
  if (!state.driveFileId) {
    return { status: "MANUAL_REVIEW", error: "Missing drive file id" };
  }

  if (!state.incomingFolderId) {
    return {
      status: "MANUAL_REVIEW",
      error: "Job incoming folder is not configured",
    };
  }

  return { status: "FILE_VALIDATED" };
}
