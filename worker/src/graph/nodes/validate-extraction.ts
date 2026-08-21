import { candidateExtractionSchema } from "../../schemas.js";
import { workerConfig } from "../../config.js";
import { formatZodIssues } from "../../ai/normalize-extraction.js";
import type { RecruitmentState } from "../state.js";

const LOW_CONFIDENCE_THRESHOLD = 0.35;

export async function validateExtraction(
  state: RecruitmentState
): Promise<Partial<RecruitmentState>> {
  const parsed = candidateExtractionSchema.safeParse(state.candidateData);

  if (parsed.success) {
    const confidence = parsed.data.extractionConfidence;
    if (
      confidence !== null &&
      confidence !== undefined &&
      confidence < LOW_CONFIDENCE_THRESHOLD
    ) {
      return {
        status: "MANUAL_REVIEW",
        error: `Low extraction confidence (${confidence})`,
        screeningResult: { extractionStatus: "MANUAL_REVIEW" },
      };
    }

    return {
      status: "EXTRACTION_VALIDATED",
      candidateData: parsed.data as unknown as Record<string, unknown>,
      extractionCorrectionHint: null,
    };
  }

  const validationMessage = formatZodIssues(parsed.error.issues);
  const nextAttempt = state.extractionAttempt + 1;
  const canRetry = nextAttempt <= workerConfig.maxExtractionRetries;

  if (canRetry) {
    console.warn(
      "[graph] extraction validation failed, corrective retry",
      state.applicationId,
      validationMessage
    );
    return {
      status: "RETRY_EXTRACTION",
      extractionAttempt: nextAttempt,
      extractionCorrectionHint: validationMessage,
      error: validationMessage,
    };
  }

  return {
    status: "MANUAL_REVIEW",
    extractionAttempt: nextAttempt,
    extractionCorrectionHint: null,
    error: validationMessage,
    screeningResult: { extractionStatus: "MANUAL_REVIEW" },
  };
}
