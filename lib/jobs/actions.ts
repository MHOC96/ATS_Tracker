"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdminUser } from "@/lib/auth/session";
import {
  createJobDriveFolders,
  isDriveConfigured,
} from "@/lib/google/drive";
import { createClient } from "@/lib/supabase/server";
import { slugifyJobTitle } from "@/lib/utils/slug";
import { hiringPeriodDbValues } from "@/lib/jobs/hiring-period";
import {
  archiveJobSchema,
  closeJobSchema,
  createJobFormSchema,
  deleteJobSchema,
  parseSkillsText,
  publishJobSchema,
  updateJobSchema,
} from "@/lib/validation/job-form";
import type { z } from "zod";

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

async function uniqueSlug(
  baseSlug: string,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const { data: rows } = await supabase
    .from("jobs")
    .select("slug")
    .like("slug", `${baseSlug}%`);

  const taken = new Set((rows ?? []).map((row) => row.slug));
  if (!taken.has(baseSlug)) return baseSlug;

  let suffix = 1;
  while (taken.has(`${baseSlug}_${suffix}`)) {
    suffix += 1;
  }
  return `${baseSlug}_${suffix}`;
}

function revalidateAdminJobPaths(jobId: string, slug?: string) {
  revalidatePath("/admin/jobs");
  revalidatePath(`/admin/jobs/${jobId}`);
  if (slug) {
    revalidateTag("jobs", "max");
    revalidateTag(`job:${slug}`, "max");
  }
}

export async function createJobDraft(
  input: z.infer<typeof createJobFormSchema>
): Promise<ActionResult<{ jobId: string }>> {
  try {
    const user = await requireAdminUser();
    const parsed = createJobFormSchema.safeParse(input);

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
    }

    const data = parsed.data;
    const supabase = await createClient();
    const baseSlug = slugifyJobTitle(data.title);

    if (!baseSlug) {
      return { success: false, error: "Could not generate a valid job slug from title" };
    }

    const slug = await uniqueSlug(baseSlug, supabase);
    const totalWeight = data.criteria
      .filter((c) => c.criteriaType === "WEIGHT")
      .reduce((sum, c) => sum + c.weight, 0);
    const hiringPeriod = hiringPeriodDbValues(
      data.jobType,
      data.hiringPeriodStart,
      data.hiringPeriodEnd
    );

    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .insert({
        title: data.title,
        slug,
        job_type: data.jobType,
        hiring_period_start: hiringPeriod.hiring_period_start,
        hiring_period_end: hiringPeriod.hiring_period_end,
        description: data.description ?? null,
        responsibilities: data.responsibilities ?? null,
        requirements: data.requirements ?? null,
        required_skills: parseSkillsText(data.requiredSkillsText),
        preferred_skills: parseSkillsText(data.preferredSkillsText),
        status: "DRAFT",
        created_by: user.id,
      })
      .select("id")
      .single();

    if (jobError || !job) {
      return { success: false, error: jobError?.message ?? "Failed to create job" };
    }

    const { data: scoringModel, error: modelError } = await supabase
      .from("scoring_models")
      .insert({
        job_id: job.id,
        name: data.scoringName,
        description: data.scoringDescription ?? null,
        total_weight: totalWeight,
        version: 1,
        is_active: false,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (modelError || !scoringModel) {
      return { success: false, error: modelError?.message ?? "Failed to create scoring model" };
    }

    const criteriaRows = data.criteria.map((criterion) => ({
      scoring_model_id: scoringModel.id,
      name: criterion.name,
      description: criterion.description ?? null,
      weight: criterion.weight,
      criteria_type: criterion.criteriaType,
      minimum_value: criterion.minimumValue ?? null,
      is_mandatory: criterion.isMandatory,
    }));

    const { error: criteriaError } = await supabase
      .from("scoring_criteria")
      .insert(criteriaRows);

    if (criteriaError) {
      return { success: false, error: criteriaError.message };
    }

    const jdContent = [
      data.description,
      data.responsibilities,
      data.requirements,
    ]
      .filter(Boolean)
      .join("\n\n");

    if (jdContent.trim()) {
      await supabase.from("job_description_versions").insert({
        job_id: job.id,
        version: 1,
        content: jdContent,
        generated_by_ai: data.aiGeneratedJd ?? false,
        created_by: user.id,
      });
    }

    revalidatePath("/admin/jobs");
    return { success: true, data: { jobId: job.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create job",
    };
  }
}

export async function publishJob(
  input: z.infer<typeof publishJobSchema>
): Promise<ActionResult<{ jobId: string }>> {
  try {
    await requireAdminUser();
    const parsed = publishJobSchema.safeParse(input);

    if (!parsed.success) {
      return { success: false, error: "Invalid job id" };
    }

    if (!(await isDriveConfigured())) {
      return {
        success: false,
        error:
          "Google Drive is not ready. Connect Google in Admin → Settings and set stage folder IDs in .env",
      };
    }

    const supabase = await createClient();
    const { data: job, error: fetchError } = await supabase
      .from("jobs")
      .select(
        "id, slug, status, incoming_folder_id, manual_review_folder_id, archive_folder_id"
      )
      .eq("id", parsed.data.jobId)
      .single();

    if (fetchError || !job) {
      return { success: false, error: "Job not found" };
    }

    if (job.status === "PUBLISHED") {
      return { success: true, data: { jobId: job.id } };
    }

    if (job.status !== "DRAFT") {
      return { success: false, error: "Only draft jobs can be published" };
    }

    let incomingFolderId = job.incoming_folder_id;
    let manualReviewFolderId = job.manual_review_folder_id;
    let archiveFolderId = job.archive_folder_id;

    if (!incomingFolderId || !manualReviewFolderId || !archiveFolderId) {
      const folders = await createJobDriveFolders(job.slug);
      incomingFolderId = folders.incomingFolderId;
      manualReviewFolderId = folders.manualReviewFolderId;
      archiveFolderId = folders.archiveFolderId;
    }

    const { error: updateError } = await supabase
      .from("jobs")
      .update({
        status: "PUBLISHED",
        incoming_folder_id: incomingFolderId,
        manual_review_folder_id: manualReviewFolderId,
        archive_folder_id: archiveFolderId,
        published_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    await supabase
      .from("scoring_models")
      .update({ is_active: true })
      .eq("job_id", job.id)
      .eq("version", 1);

    revalidateAdminJobPaths(job.id, job.slug);
    return { success: true, data: { jobId: job.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to publish job",
    };
  }
}

export async function updateJob(
  input: z.infer<typeof updateJobSchema>
): Promise<ActionResult<{ jobId: string }>> {
  try {
    const user = await requireAdminUser();
    const parsed = updateJobSchema.safeParse(input);

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
    }

    const data = parsed.data;
    const supabase = await createClient();

    const { data: job, error: fetchError } = await supabase
      .from("jobs")
      .select("id, status, slug")
      .eq("id", data.jobId)
      .single();

    if (fetchError || !job) {
      return { success: false, error: "Job not found" };
    }

    if (job.status === "ARCHIVED") {
      return { success: false, error: "Archived jobs cannot be edited" };
    }

    const totalWeight = data.criteria
      .filter((c) => c.criteriaType === "WEIGHT")
      .reduce((sum, c) => sum + c.weight, 0);
    const hiringPeriod = hiringPeriodDbValues(
      data.jobType,
      data.hiringPeriodStart,
      data.hiringPeriodEnd
    );

    const jdContent = [data.description, data.responsibilities, data.requirements]
      .filter(Boolean)
      .join("\n\n");

    const criteriaPayload = data.criteria.map((criterion) => ({
      name: criterion.name,
      description: criterion.description ?? "",
      weight: criterion.weight,
      criteria_type: criterion.criteriaType,
      minimum_value: criterion.minimumValue ?? null,
      is_mandatory: criterion.isMandatory,
    }));

    const { error: rpcError } = await supabase.rpc("update_job_with_scoring", {
      p_job_id: job.id,
      p_title: data.title,
      p_job_type: data.jobType,
      p_hiring_period_start: hiringPeriod.hiring_period_start,
      p_hiring_period_end: hiringPeriod.hiring_period_end,
      p_description: data.description ?? null,
      p_responsibilities: data.responsibilities ?? null,
      p_requirements: data.requirements ?? null,
      p_required_skills: parseSkillsText(data.requiredSkillsText),
      p_preferred_skills: parseSkillsText(data.preferredSkillsText),
      p_scoring_name: data.scoringName,
      p_scoring_description: data.scoringDescription ?? null,
      p_total_weight: totalWeight,
      p_criteria: criteriaPayload,
      p_jd_content: jdContent.trim() ? jdContent : null,
      p_ai_generated_jd: data.aiGeneratedJd ?? false,
      p_user_id: user.id,
    });

    if (rpcError) {
      return { success: false, error: rpcError.message };
    }

    revalidateAdminJobPaths(job.id, job.slug);
    revalidatePath(`/admin/jobs/${job.id}/edit`);

    return { success: true, data: { jobId: job.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update job",
    };
  }
}

export async function closeJob(
  input: z.infer<typeof closeJobSchema>
): Promise<ActionResult<{ jobId: string }>> {
  try {
    await requireAdminUser();
    const parsed = closeJobSchema.safeParse(input);

    if (!parsed.success) {
      return { success: false, error: "Invalid job id" };
    }

    const supabase = await createClient();
    const { data: job, error: fetchError } = await supabase
      .from("jobs")
      .select("id, slug, status")
      .eq("id", parsed.data.jobId)
      .single();

    if (fetchError || !job) {
      return { success: false, error: "Job not found" };
    }

    if (job.status !== "PUBLISHED") {
      return { success: false, error: "Only published jobs can be closed" };
    }

    const { error: updateError } = await supabase
      .from("jobs")
      .update({
        status: "CLOSED",
        closed_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    revalidateAdminJobPaths(job.id, job.slug);
    return { success: true, data: { jobId: job.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to close job",
    };
  }
}

export async function archiveJob(
  input: z.infer<typeof archiveJobSchema>
): Promise<ActionResult<{ jobId: string }>> {
  try {
    await requireAdminUser();
    const parsed = archiveJobSchema.safeParse(input);

    if (!parsed.success) {
      return { success: false, error: "Invalid job id" };
    }

    const supabase = await createClient();
    const { data: job, error: fetchError } = await supabase
      .from("jobs")
      .select("id, slug, status")
      .eq("id", parsed.data.jobId)
      .single();

    if (fetchError || !job) {
      return { success: false, error: "Job not found" };
    }

    if (job.status === "ARCHIVED") {
      return { success: true, data: { jobId: job.id } };
    }

    const { error: updateError } = await supabase
      .from("jobs")
      .update({
        status: "ARCHIVED",
        closed_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    revalidateAdminJobPaths(job.id, job.slug);
    return { success: true, data: { jobId: job.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to archive job",
    };
  }
}

export async function deleteJob(
  input: z.infer<typeof deleteJobSchema>
): Promise<ActionResult<{ jobId: string }>> {
  try {
    await requireAdminUser();
    const parsed = deleteJobSchema.safeParse(input);

    if (!parsed.success) {
      return { success: false, error: "Invalid job id" };
    }

    const supabase = await createClient();
    const { data: job, error: fetchError } = await supabase
      .from("jobs")
      .select("id, slug, status")
      .eq("id", parsed.data.jobId)
      .single();

    if (fetchError || !job) {
      return { success: false, error: "Job not found" };
    }

    if (job.status === "PUBLISHED" || job.status === "CLOSED") {
      return {
        success: false,
        error: "Archive the job before permanently deleting it.",
      };
    }

    const { count, error: countError } = await supabase
      .from("candidate_applications")
      .select("id", { count: "exact", head: true })
      .eq("job_id", job.id);

    if (countError) {
      return { success: false, error: countError.message };
    }

    if (job.status === "DRAFT") {
      if (count && count > 0) {
        return {
          success: false,
          error: "Cannot delete a draft job that has applications. Archive it instead.",
        };
      }
    } else if (job.status !== "ARCHIVED") {
      return {
        success: false,
        error: "Only draft or archived jobs can be permanently deleted.",
      };
    }

    // Remove applications first so candidate_scores are gone before scoring_models CASCADE.
    if (count && count > 0) {
      const { error: applicationsDeleteError } = await supabase
        .from("candidate_applications")
        .delete()
        .eq("job_id", job.id);

      if (applicationsDeleteError) {
        return { success: false, error: applicationsDeleteError.message };
      }
    }

    const { error: deleteError } = await supabase.from("jobs").delete().eq("id", job.id);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    revalidateAdminJobPaths(job.id, job.slug);
    return { success: true, data: { jobId: job.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete job",
    };
  }
}
