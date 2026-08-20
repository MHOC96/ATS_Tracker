import type { AuditOutput } from "../../schemas.js";
import type { RecruitmentState } from "../state.js";

export async function calculateScore(
  state: RecruitmentState
): Promise<Partial<RecruitmentState>> {
  const audit = state.scoreResult as unknown as AuditOutput | null;
  const scoringModel = state.scoringModel as {
    criteria: Array<{ id: string; name: string; weight: number }>;
  } | null;

  if (!audit) {
    return {
      status: "MANUAL_REVIEW",
      error: "Missing audit result",
    };
  }

  let finalScore = audit.finalScore;

  if (
    scoringModel?.criteria.length &&
    audit.criterionScores.length > 0
  ) {
    const weightByName = new Map(
      scoringModel.criteria.map((criterion) => [criterion.name, criterion.weight])
    );

    let weightedTotal = 0;
    let weightSum = 0;

    for (const criterionScore of audit.criterionScores) {
      const weight = weightByName.get(criterionScore.criterionName) ?? 0;
      if (weight <= 0 || criterionScore.maximumScore <= 0) continue;

      const normalized =
        (criterionScore.score / criterionScore.maximumScore) * weight;
      weightedTotal += normalized;
      weightSum += weight;
    }

    if (weightSum > 0) {
      finalScore = Math.round((weightedTotal / weightSum) * 100 * 100) / 100;
    }
  }

  return {
    status: "SCORED",
    scoreResult: {
      ...audit,
      finalScore,
    },
  };
}
