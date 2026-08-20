import { candidateExtractionSchema } from "../../schemas.js";
import { workerConfig } from "../../config.js";
import type { RecruitmentState } from "../state.js";

export async function validateExtraction(
  state: RecruitmentState
): Promise<Partial<RecruitmentState>> {
  const parsed = candidateExtractionSchema.safeParse(state.candidateData);

  if (parsed.success) {
    return {
      status: "EXTRACTION_VALIDATED",
      candidateData: parsed.data as unknown as Record<string, unknown>,
    };
  }

  const nextAttempt = state.extractionAttempt + 1;
  const canRetry = nextAttempt <= workerConfig.maxExtractionRetries;

  if (canRetry) {
    console.warn(
      "[graph] extraction validation failed, retrying",
      state.applicationId,
      parsed.error.issues[0]?.message
    );
    return {
      status: "RETRY_EXTRACTION",
      extractionAttempt: nextAttempt,
      error: parsed.error.issues[0]?.message ?? "Extraction validation failed",
    };
  }

  return {
    status: "MANUAL_REVIEW",
    extractionAttempt: nextAttempt,
    error: parsed.error.issues[0]?.message ?? "Extraction validation failed",
    screeningResult: { extractionStatus: "MANUAL_REVIEW" },
  };
}
