import { finalizeProcessingFailure } from "../../processing/finalize.js";
import type { RecruitmentState } from "../state.js";

export async function finalizeManualReview(
  state: RecruitmentState
): Promise<Partial<RecruitmentState>> {
  await finalizeProcessingFailure(state, {
    aiJobStatus: "MANUAL_REVIEW",
    extractionStatus:
      state.screeningResult?.extractionStatus === "FAILED" ||
      state.screeningResult?.extractionStatus === "MANUAL_REVIEW"
        ? (state.screeningResult.extractionStatus as "FAILED" | "MANUAL_REVIEW")
        : undefined,
  });

  return { status: "MANUAL_REVIEW" };
}

export async function finalizeFailure(
  state: RecruitmentState
): Promise<Partial<RecruitmentState>> {
  await finalizeProcessingFailure(state, {
    aiJobStatus: "FAILED",
    extractionStatus: "FAILED",
  });

  return { status: "FAILED" };
}
