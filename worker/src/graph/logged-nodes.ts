import { graphNodes } from "./nodes.js";
import type { RecruitmentState } from "./state.js";
import { pipelineStep } from "../pipeline-log.js";

type NodeFn = (state: RecruitmentState) => Promise<Partial<RecruitmentState>>;

function wrapStep(stepName: string, fn: NodeFn): NodeFn {
  return async (state: RecruitmentState) => {
    pipelineStep(state.applicationId, stepName);
    const result = await fn(state);
    if (result.status && result.status !== state.status) {
      pipelineStep(state.applicationId, stepName, `status → ${result.status}`);
    }
    return result;
  };
}

export const loggedGraphNodes = {
  loadApplication: wrapStep("loadApplication", graphNodes.loadApplication),
  validateFile: wrapStep("validateFile", graphNodes.validateFile),
  extractCv: wrapStep("extractCv", graphNodes.extractCv),
  validateExtraction: wrapStep(
    "validateExtraction",
    graphNodes.validateExtraction
  ),
  loadJob: wrapStep("loadJob", graphNodes.loadJob),
  loadScoringModel: wrapStep("loadScoringModel", graphNodes.loadScoringModel),
  auditCandidate: wrapStep("auditCandidate", graphNodes.auditCandidate),
  calculateScore: wrapStep("calculateScore", graphNodes.calculateScore),
  storeResult: wrapStep("storeResult", graphNodes.storeResult),
  updateRanking: wrapStep("updateRanking", graphNodes.updateRanking),
  archiveCv: wrapStep("archiveCv", graphNodes.archiveCv),
  finalizeManualReview: wrapStep(
    "finalizeManualReview",
    graphNodes.finalizeManualReview
  ),
  finalizeFailure: wrapStep("finalizeFailure", graphNodes.finalizeFailure),
};
