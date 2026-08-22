/** Human-readable labels for LangGraph pipeline steps (console). */
const STEP_LABELS: Record<string, string> = {
  loadApplication: "Load application (DB)",
  validateFile: "Validate CV file",
  extractCv: "Extract CV (Gemini)",
  validateExtraction: "Validate extraction (Zod)",
  loadJob: "Load job + requirements",
  loadScoringModel: "Load scoring model",
  auditCandidate: "Score candidate (Groq auditor)",
  calculateScore: "Calculate final score",
  storeResult: "Store results (Supabase)",
  updateRanking: "Update ranking",
  archiveCv: "Move CV to Archive (Drive)",
  finalizeManualReview: "Finalize → Manual review",
  finalizeFailure: "Finalize → Failed",
  "drive-upload": "Upload CV staging → Incoming_CVs (Drive)",
};

function shortId(applicationId: string): string {
  return applicationId.length > 12
    ? `${applicationId.slice(0, 8)}…`
    : applicationId;
}

export function pipelineJobStart(
  applicationId: string,
  source: "bullmq" | "http"
): void {
  console.log(
    `[pipeline] ▶ START ${applicationId} | source=${source} | LangGraph CV screening`
  );
}

export function pipelineJobEnd(
  applicationId: string,
  status: string,
  error?: string | null
): void {
  const err = error?.trim();
  console.log(
    `[pipeline] ■ END ${applicationId} | status=${status}${err ? ` | error=${err}` : ""}`
  );
}

export function pipelineStep(
  applicationId: string,
  step: string,
  detail?: string
): void {
  const label = STEP_LABELS[step] ?? step;
  const suffix = detail ? ` — ${detail}` : "";
  console.log(`[pipeline] ${shortId(applicationId)} | ${label}${suffix}`);
}
