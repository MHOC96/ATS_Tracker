import { extractCandidateFromCv } from "../../ai/gemini.js";
import { downloadDriveFile } from "../../google/drive.js";
import type { RecruitmentState } from "../state.js";

export async function extractCv(
  state: RecruitmentState
): Promise<Partial<RecruitmentState>> {
  try {
    const { buffer, mimeType } = await downloadDriveFile(state.driveFileId);
    const effectiveMime = state.cvMimeType || mimeType;
    const { data, raw } = await extractCandidateFromCv(buffer, effectiveMime);

    return {
      status: "EXTRACTED",
      cvMimeType: effectiveMime,
      candidateData: data as unknown as Record<string, unknown>,
      screeningResult: {
        extractionStatus: "COMPLETED",
        rawStructuredData: raw,
      },
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gemini extraction failed";
    console.error("[graph] extractCv failed", state.applicationId, message);

    return {
      status: "MANUAL_REVIEW",
      error: message,
      screeningResult: { extractionStatus: "FAILED" },
    };
  }
}
