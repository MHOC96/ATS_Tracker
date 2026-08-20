import { archiveCv } from "./nodes/archive-cv.js";
import { auditCandidate } from "./nodes/audit-candidate.js";
import { calculateScore } from "./nodes/calculate-score.js";
import { extractCv } from "./nodes/extract-cv.js";
import {
  finalizeFailure,
  finalizeManualReview,
} from "./nodes/finalize-processing.js";
import { loadApplication } from "./nodes/load-application.js";
import { loadJob } from "./nodes/load-job.js";
import { loadScoringModel } from "./nodes/load-scoring-model.js";
import { storeResult } from "./nodes/store-result.js";
import { updateRanking } from "./nodes/update-ranking.js";
import { validateExtraction } from "./nodes/validate-extraction.js";
import { validateFile } from "./nodes/validate-file.js";

export const graphNodes = {
  loadApplication,
  validateFile,
  extractCv,
  validateExtraction,
  loadJob,
  loadScoringModel,
  auditCandidate,
  calculateScore,
  storeResult,
  updateRanking,
  archiveCv,
  finalizeManualReview,
  finalizeFailure,
};
