"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/auth/session";
import {
  createJobDriveFolders,
  isDriveConfigured,
} from "@/lib/google/drive";
import { createClient } from "@/lib/supabase/server";
import { slugifyJobTitle } from "@/lib/utils/slug";
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

async function uniqueSlug(baseSlug: string, supabase: Awaited<ReturnType<typeof createClient>>) {
  let slug = baseSlug;
  let suffix = 1;

  while (true) {
    const { data } = await supabase
      .from("jobs")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!data) return slug;
    slug = `${baseSlug}_${suffix}`;
    suffix += 1;
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

    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .insert({
        title: data.title,
        slug,
        job_type: data.jobType,
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

    revalidatePath("/admin/jobs");
    revalidatePath(`/admin/jobs/${job.id}`);
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

    const { error: jobError } = await supabase
      .from("jobs")
      .update({
        title: data.title,
        job_type: data.jobType,
        description: data.description ?? null,
        responsibilities: data.responsibilities ?? null,
        requirements: data.requirements ?? null,
        required_skills: parseSkillsText(data.requiredSkillsText),
        preferred_skills: parseSkillsText(data.preferredSkillsText),
      })
      .eq("id", job.id);

    if (jobError) {
      return { success: false, error: jobError.message };
    }

    const { data: scoringModel, error: modelFetchError } = await supabase
      .from("scoring_models")
      .select("id")
      .eq("job_id", job.id)
      .order("version", { ascending: false })
      .limit(1)
      .single();

    if (modelFetchError || !scoringModel) {
      return { success: false, error: "Scoring model not found for this job" };
    }

    const { error: modelUpdateError } = await supabase
      .from("scoring_models")
      .update({
        name: data.scoringName,
        description: data.scoringDescription ?? null,
        total_weight: totalWeight,
      })
      .eq("id", scoringModel.id);

    if (modelUpdateError) {
      return { success: false, error: modelUpdateError.message };
    }

    const { error: deleteCriteriaError } = await supabase
      .from("scoring_criteria")
      .delete()
      .eq("scoring_model_id", scoringModel.id);

    if (deleteCriteriaError) {
      return { success: false, error: deleteCriteriaError.message };
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

    const jdContent = [data.description, data.responsibilities, data.requirements]
      .filter(Boolean)
      .join("\n\n");

    if (jdContent.trim()) {
      const { data: latestVersion } = await supabase
        .from("job_description_versions")
        .select("version")
        .eq("job_id", job.id)
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle();

      await supabase.from("job_description_versions").insert({
        job_id: job.id,
        version: (latestVersion?.version ?? 0) + 1,
        content: jdContent,
        generated_by_ai: data.aiGeneratedJd ?? false,
        created_by: user.id,
      });
    }

    revalidatePath("/admin/jobs");
    revalidatePath(`/admin/jobs/${job.id}`);
    revalidatePath(`/admin/jobs/${job.id}/edit`);
    revalidatePath("/jobs");
    revalidatePath(`/jobs/${job.slug}`);

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

    revalidatePath("/admin/jobs");
    revalidatePath(`/admin/jobs/${job.id}`);
    revalidatePath("/jobs");
    revalidatePath(`/jobs/${job.slug}`);

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

    revalidatePath("/admin/jobs");
    revalidatePath(`/admin/jobs/${job.id}`);
    revalidatePath("/jobs");
    revalidatePath(`/jobs/${job.slug}`);

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

    if (job.status !== "DRAFT") {
      return {
        success: false,
        error: "Only draft jobs can be permanently deleted. Archive published or closed jobs instead.",
      };
    }

    const { count, error: countError } = await supabase
      .from("candidate_applications")
      .select("id", { count: "exact", head: true })
      .eq("job_id", job.id);

    if (countError) {
      return { success: false, error: countError.message };
    }

    if (count && count > 0) {
      return {
        success: false,
        error: "Cannot delete a job that has applications. Archive it instead.",
      };
    }

    const { error: deleteError } = await supabase.from("jobs").delete().eq("id", job.id);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    revalidatePath("/admin/jobs");
    revalidatePath("/jobs");

    return { success: true, data: { jobId: job.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete job",
    };
  }
}
