import { extractCandidateFromCv } from "../../ai/gemini.js";
import { prepareCvForExtraction } from "../../ai/cv-preprocess.js";
import { downloadDriveFile } from "../../google/drive.js";
import { assertGeminiConfigured } from "../../config.js";
import type { RecruitmentState } from "../state.js";

export async function extractCv(
  state: RecruitmentState
): Promise<Partial<RecruitmentState>> {
  try {
    assertGeminiConfigured();

    const hints = state.applyFormHints ?? undefined;

    if (state.extractionCorrectionHint && state.candidateData) {
      const corrected = await extractCandidateFromCv(
        Buffer.alloc(0),
        state.cvMimeType,
        {
          hints,
          correctionHint: state.extractionCorrectionHint,
          previousJson: state.candidateData,
        }
      );

      return {
        status: "EXTRACTED",
        extractionCorrectionHint: null,
        candidateData: corrected.data as unknown as Record<string, unknown>,
        screeningResult: {
          extractionStatus: "COMPLETED",
          rawStructuredData: corrected.raw,
          extractionMethod: corrected.method,
          promptVersion: corrected.promptVersion,
        },
      };
    }

    const { buffer, mimeType } = await downloadDriveFile(state.driveFileId);
    const prepared = await prepareCvForExtraction(buffer, mimeType);

    const result = await extractCandidateFromCv(
      prepared.buffer,
      prepared.mimeType,
      {
        hints,
        preparedText: prepared.usedTextPath ? prepared.extractedText : null,
        useVision: !prepared.usedTextPath,
      }
    );

    return {
      status: "EXTRACTED",
      cvMimeType: prepared.mimeType,
      candidateData: result.data as unknown as Record<string, unknown>,
      screeningResult: {
        extractionStatus: "COMPLETED",
        rawStructuredData: result.raw,
        extractionMethod: result.method,
        promptVersion: result.promptVersion,
        visionPageCount: prepared.visionPageCount,
      },
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gemini extraction failed";
    console.error("[graph] extractCv failed", state.applicationId, message);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }

    return {
      status: "MANUAL_REVIEW",
      error: message,
      extractionCorrectionHint: null,
      screeningResult: { extractionStatus: "FAILED" },
    };
  }
}
