import { END, START, StateGraph } from "@langchain/langgraph";
import { loggedGraphNodes } from "./logged-nodes.js";
import type { RecruitmentState } from "./state.js";
import { RecruitmentStateAnnotation } from "./state.js";
import { pipelineJobEnd, pipelineStep } from "../pipeline-log.js";

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
    .addNode("loadApplication", loggedGraphNodes.loadApplication)
    .addNode("validateFile", loggedGraphNodes.validateFile)
    .addNode("extractCv", loggedGraphNodes.extractCv)
    .addNode("validateExtraction", loggedGraphNodes.validateExtraction)
    .addNode("loadJob", loggedGraphNodes.loadJob)
    .addNode("loadScoringModel", loggedGraphNodes.loadScoringModel)
    .addNode("auditCandidate", loggedGraphNodes.auditCandidate)
    .addNode("calculateScore", loggedGraphNodes.calculateScore)
    .addNode("storeResult", loggedGraphNodes.storeResult)
    .addNode("updateRanking", loggedGraphNodes.updateRanking)
    .addNode("archiveCv", loggedGraphNodes.archiveCv)
    .addNode("finalizeManualReview", loggedGraphNodes.finalizeManualReview)
    .addNode("finalizeFailure", loggedGraphNodes.finalizeFailure)
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

  pipelineStep(applicationId, "langgraph", "invoke workflow");

  const result = await graph.invoke({
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

  pipelineJobEnd(applicationId, result.status, result.error);

  return result;
}
