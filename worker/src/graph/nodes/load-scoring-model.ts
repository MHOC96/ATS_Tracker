import { createAdminClient } from "../../supabase.js";
import type { RecruitmentState } from "../state.js";

export async function loadScoringModel(
  state: RecruitmentState
): Promise<Partial<RecruitmentState>> {
  const supabase = createAdminClient();

  const { data: model, error } = await supabase
    .from("scoring_models")
    .select(
      `
      id,
      name,
      description,
      version,
      scoring_criteria(
        id,
        name,
        description,
        weight,
        criteria_type,
        minimum_value,
        is_mandatory
      )
    `
    )
    .eq("job_id", state.jobId)
    .eq("is_active", true)
    .single();

  if (error || !model) {
    return {
      status: "MANUAL_REVIEW",
      error: error?.message ?? "Active scoring model not found for job",
    };
  }

  const criteria = (model.scoring_criteria ?? []) as Array<{
    id: string;
    name: string;
    description: string | null;
    weight: number;
    criteria_type: string;
    minimum_value: number | null;
    is_mandatory: boolean;
  }>;

  return {
    status: "SCORING_MODEL_LOADED",
    scoringModel: {
      id: model.id,
      name: model.name,
      description: model.description,
      version: model.version,
      criteria: criteria.map((criterion) => ({
        id: criterion.id,
        name: criterion.name,
        description: criterion.description,
        weight: Number(criterion.weight),
        criteriaType: criterion.criteria_type,
        minimumValue:
          criterion.minimum_value !== null
            ? Number(criterion.minimum_value)
            : null,
        isMandatory: criterion.is_mandatory,
      })),
    },
  };
}
