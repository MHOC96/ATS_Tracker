import { createAdminClient } from "../../supabase.js";
import type { RecruitmentState } from "../state.js";

export async function loadJob(
  state: RecruitmentState
): Promise<Partial<RecruitmentState>> {
  const supabase = createAdminClient();

  const { data: job, error } = await supabase
    .from("jobs")
    .select(
      "id, title, slug, description, responsibilities, requirements, required_skills, preferred_skills, incoming_folder_id, manual_review_folder_id, archive_folder_id"
    )
    .eq("id", state.jobId)
    .single();

  if (error || !job) {
    return {
      status: "MANUAL_REVIEW",
      error: error?.message ?? "Job not found",
    };
  }

  return {
    status: "JOB_LOADED",
    incomingFolderId: job.incoming_folder_id ?? state.incomingFolderId,
    manualReviewFolderId:
      job.manual_review_folder_id ?? state.manualReviewFolderId,
    archiveFolderId: job.archive_folder_id ?? state.archiveFolderId,
    jobData: {
      id: job.id,
      title: job.title,
      slug: job.slug,
      description: job.description,
      responsibilities: job.responsibilities,
      requirements: job.requirements,
      requiredSkills: job.required_skills ?? [],
      preferredSkills: job.preferred_skills ?? [],
    },
  };
}
