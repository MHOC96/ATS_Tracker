import { extractCandidateFromCv } from "../../ai/gemini.js";
import { prepareCvForExtraction } from "../../ai/cv-preprocess.js";
import { downloadDriveFile } from "../../google/drive.js";
import { assertGeminiConfigured } from "../../config.js";
import { pipelineStep } from "../../pipeline-log.js";
import type { RecruitmentState } from "../state.js";

function formatExtractionError(error: unknown): string {
  if (error instanceof Error) {
    const raw = error.message.trim();
    if (raw.startsWith("{")) {
      try {
        const parsed = JSON.parse(raw) as {
          error?: { message?: string };
        };
        if (parsed.error?.message) return parsed.error.message;
      } catch {
        // ignore
      }
    }
    return raw || "Gemini extraction failed";
  }
  return String(error ?? "Gemini extraction failed");
}

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

    pipelineStep(
      state.applicationId,
      "extractCv",
      prepared.usedTextPath
        ? `path=pdf_text (${prepared.extractedText?.length ?? 0} chars)`
        : `path=vision (pages=${prepared.visionPageCount ?? "?"})`
    );

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
    const message = formatExtractionError(error);
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
