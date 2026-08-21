import { END, START, StateGraph } from "@langchain/langgraph";
import { graphNodes } from "./nodes.js";
import type { RecruitmentState } from "./state.js";
import { RecruitmentStateAnnotation } from "./state.js";

function routeAfterLoad(state: RecruitmentState) {
  return state.status === "FAILED" ? "finalizeFailure" : "validateFile";
}

function routeAfterValidateFile(state: RecruitmentState) {
  return state.status === "MANUAL_REVIEW" ? "finalizeManualReview" : "extractCv";
}

function routeAfterExtractCv(state: RecruitmentState) {
  return state.status === "MANUAL_REVIEW" ? "finalizeManualReview" : "validateExtraction";
}

function routeAfterValidateExtraction(state: RecruitmentState) {
  if (state.status === "EXTRACTION_VALIDATED") return "loadJob";
  if (state.status === "RETRY_EXTRACTION") return "extractCv";
  return "finalizeManualReview";
}

function routeAfterAudit(state: RecruitmentState) {
  return state.status === "MANUAL_REVIEW" ? "finalizeManualReview" : "calculateScore";
}

function routeAfterCalculate(state: RecruitmentState) {
  return state.status === "MANUAL_REVIEW" ? "finalizeManualReview" : "storeResult";
}

function routeAfterStore(state: RecruitmentState) {
  return state.status === "MANUAL_REVIEW" ? "finalizeManualReview" : "updateRanking";
}

function routeAfterLoadJob(state: RecruitmentState) {
  return state.status === "MANUAL_REVIEW" ? "finalizeManualReview" : "loadScoringModel";
}

function routeAfterLoadScoring(state: RecruitmentState) {
  return state.status === "MANUAL_REVIEW" ? "finalizeManualReview" : "auditCandidate";
}

export function buildRecruitmentGraph() {
  return new StateGraph(RecruitmentStateAnnotation)
    .addNode("loadApplication", graphNodes.loadApplication)
    .addNode("validateFile", graphNodes.validateFile)
    .addNode("extractCv", graphNodes.extractCv)
    .addNode("validateExtraction", graphNodes.validateExtraction)
    .addNode("loadJob", graphNodes.loadJob)
    .addNode("loadScoringModel", graphNodes.loadScoringModel)
    .addNode("auditCandidate", graphNodes.auditCandidate)
    .addNode("calculateScore", graphNodes.calculateScore)
    .addNode("storeResult", graphNodes.storeResult)
    .addNode("updateRanking", graphNodes.updateRanking)
    .addNode("archiveCv", graphNodes.archiveCv)
    .addNode("finalizeManualReview", graphNodes.finalizeManualReview)
    .addNode("finalizeFailure", graphNodes.finalizeFailure)
    .addEdge(START, "loadApplication")
    .addConditionalEdges("loadApplication", routeAfterLoad)
    .addConditionalEdges("validateFile", routeAfterValidateFile)
    .addConditionalEdges("extractCv", routeAfterExtractCv)
    .addConditionalEdges("validateExtraction", routeAfterValidateExtraction)
    .addConditionalEdges("loadJob", routeAfterLoadJob)
    .addConditionalEdges("loadScoringModel", routeAfterLoadScoring)
    .addConditionalEdges("auditCandidate", routeAfterAudit)
    .addConditionalEdges("calculateScore", routeAfterCalculate)
    .addConditionalEdges("storeResult", routeAfterStore)
    .addEdge("updateRanking", "archiveCv")
    .addEdge("archiveCv", END)
    .addEdge("finalizeManualReview", END)
    .addEdge("finalizeFailure", END)
    .compile();
}

export async function runRecruitmentWorkflow(applicationId: string) {
  const graph = buildRecruitmentGraph();

  return graph.invoke({
    applicationId,
    jobId: "",
    candidateId: "",
    driveFileId: "",
    cvFileId: "",
    cvMimeType: "",
    incomingFolderId: "",
    archiveFolderId: "",
    manualReviewFolderId: "",
    processingStartedAt: 0,
    extractionAttempt: 0,
    candidateData: null,
    jobData: null,
    scoringModel: null,
    screeningResult: null,
    scoreResult: null,
    status: "QUEUED",
    error: null,
    applyFormHints: null,
    extractionCorrectionHint: null,
  });
}
