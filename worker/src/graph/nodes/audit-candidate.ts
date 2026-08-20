import { auditCandidateProfile } from "../../ai/groq.js";
import type { CandidateExtraction } from "../../schemas.js";
import type { RecruitmentState } from "../state.js";

export async function auditCandidate(
  state: RecruitmentState
): Promise<Partial<RecruitmentState>> {
  try {
    const candidate = state.candidateData as unknown as CandidateExtraction;
    const job = state.jobData as {
      title: string;
      description: string | null;
      responsibilities: string | null;
      requirements: string | null;
      requiredSkills: string[];
      preferredSkills: string[];
    };
    const scoringModel = state.scoringModel as {
      id: string;
      name: string;
      description: string | null;
      criteria: Array<{
        id: string;
        name: string;
        description: string | null;
        weight: number;
        criteriaType: string;
        minimumValue: number | null;
        isMandatory: boolean;
      }>;
    };

    const audit = await auditCandidateProfile(candidate, job, scoringModel);

    return {
      status: "AUDITED",
      scoreResult: audit as unknown as Record<string, unknown>,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Groq audit failed";
    console.error("[graph] auditCandidate failed", state.applicationId, message);

    return {
      status: "MANUAL_REVIEW",
      error: message,
    };
  }
}
