import { workerConfig } from "../../config.js";
import type { AuditOutput, CandidateExtraction } from "../../schemas.js";
import { createAdminClient } from "../../supabase.js";
import type { RecruitmentState } from "../state.js";

export async function storeResult(
  state: RecruitmentState
): Promise<Partial<RecruitmentState>> {
  try {
    const supabase = createAdminClient();
    const candidate = state.candidateData as unknown as CandidateExtraction;
    const audit = state.scoreResult as unknown as AuditOutput;
    const scoringModel = state.scoringModel as {
      id: string;
      criteria: Array<{ id: string; name: string }>;
    };

    await supabase
      .from("candidates")
      .update({
        full_name: candidate.fullName,
        email: candidate.email,
        phone: candidate.phone,
        location: candidate.location,
      })
      .eq("id", state.candidateId);

    await supabase.from("candidate_profiles").upsert(
      {
        candidate_id: state.candidateId,
        university: candidate.university,
        degree: candidate.degree,
        gpa: candidate.gpa,
        years_experience: candidate.yearsExperience,
        skills: candidate.skills,
        education: candidate.education,
        experience: candidate.experience,
        certifications: candidate.certifications,
        projects: candidate.projects,
        profile_links: candidate.profileLinks,
        extracted_by_ai: true,
        extraction_model: workerConfig.visionModel,
      },
      { onConflict: "candidate_id" }
    );

    await supabase.from("screening_results").insert({
      candidate_application_id: state.applicationId,
      model: workerConfig.visionModel,
      extraction_status: "COMPLETED",
      raw_structured_data: candidate,
      processing_time_ms: state.processingStartedAt
        ? Date.now() - state.processingStartedAt
        : null,
    });

    const { data: scoreRow, error: scoreError } = await supabase
      .from("candidate_scores")
      .insert({
        candidate_application_id: state.applicationId,
        scoring_model_id: scoringModel.id,
        final_score: audit.finalScore,
        recommendation: audit.recommendation,
        matched_skills: audit.matchedSkills,
        missing_skills: audit.missingSkills,
        mandatory_failures: audit.mandatoryFailures,
        reasoning: audit.reasoning,
      })
      .select("id")
      .single();

    if (scoreError || !scoreRow) {
      throw new Error(scoreError?.message ?? "Failed to store candidate score");
    }

    const criterionByName = new Map(
      scoringModel.criteria.map((criterion) => [criterion.name, criterion.id])
    );

    const criterionRows = audit.criterionScores
      .map((criterionScore) => {
        const criterionId = criterionByName.get(criterionScore.criterionName);
        if (!criterionId) return null;

        return {
          candidate_score_id: scoreRow.id,
          criterion_id: criterionId,
          score: criterionScore.score,
          maximum_score: criterionScore.maximumScore,
          reasoning: criterionScore.reasoning ?? null,
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null);

    if (criterionRows.length > 0) {
      const { error: criterionError } = await supabase
        .from("criterion_scores")
        .insert(criterionRows);

      if (criterionError) {
        throw new Error(criterionError.message);
      }
    }

    await supabase
      .from("candidate_applications")
      .update({ status: "AI_REVIEWED" })
      .eq("id", state.applicationId);

    await supabase
      .from("ai_processing_jobs")
      .update({
        status: "COMPLETED",
        completed_at: new Date().toISOString(),
        error_message: null,
      })
      .eq("candidate_application_id", state.applicationId)
      .eq("job_type", "CV_SCREENING");

    return { status: "STORED" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to store results";
    console.error("[graph] storeResult failed", state.applicationId, message);

    return {
      status: "MANUAL_REVIEW",
      error: message,
    };
  }
}
