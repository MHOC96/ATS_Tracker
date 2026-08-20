import type { RecruitmentState } from "../state.js";

export async function updateRanking(
  state: RecruitmentState
): Promise<Partial<RecruitmentState>> {
  return { status: "RANKED" };
}
