import { unstable_cache } from "next/cache";
import type { z } from "zod";
import { jobTypeSchema } from "@/packages/shared/schemas/job-types";
import { createAdminClient } from "@/lib/supabase/admin";

export type JobType = z.infer<typeof jobTypeSchema>;

export type PublicJob = {
  id: string;
  title: string;
  slug: string;
  jobType: JobType;
  hiringPeriodStart: string | null;
  hiringPeriodEnd: string | null;
  description: string | null;
  responsibilities: string | null;
  requirements: string | null;
  requiredSkills: string[];
  preferredSkills: string[];
  publishedAt: string | null;
};

const PUBLIC_JOB_FIELDS =
  "id, title, slug, job_type, hiring_period_start, hiring_period_end, description, responsibilities, requirements, required_skills, preferred_skills, published_at";

function mapPublicJob(row: {
  id: string;
  title: string;
  slug: string;
  job_type: string;
  hiring_period_start: string | null;
  hiring_period_end: string | null;
  description: string | null;
  responsibilities: string | null;
  requirements: string | null;
  required_skills: string[] | null;
  preferred_skills: string[] | null;
  published_at: string | null;
}): PublicJob {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    jobType: row.job_type as JobType,
    hiringPeriodStart: row.hiring_period_start,
    hiringPeriodEnd: row.hiring_period_end,
    description: row.description,
    responsibilities: row.responsibilities,
    requirements: row.requirements,
    requiredSkills: row.required_skills ?? [],
    preferredSkills: row.preferred_skills ?? [],
    publishedAt: row.published_at,
  };
}

async function fetchPublishedJobs(): Promise<PublicJob[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("jobs")
    .select(PUBLIC_JOB_FIELDS)
    .eq("status", "PUBLISHED")
    .order("published_at", { ascending: false });

  if (error || !data) return [];

  return data.map(mapPublicJob);
}

export async function listPublishedJobs(): Promise<PublicJob[]> {
  return unstable_cache(fetchPublishedJobs, ["published-jobs-list"], {
    tags: ["jobs"],
    revalidate: 120,
  })();
}

export async function getPublishedJobBySlug(slug: string): Promise<PublicJob | null> {
  return unstable_cache(
    async () => {
      const supabase = createAdminClient();

      const { data, error } = await supabase
        .from("jobs")
        .select(PUBLIC_JOB_FIELDS)
        .eq("slug", slug)
        .eq("status", "PUBLISHED")
        .maybeSingle();

      if (error || !data) return null;

      return mapPublicJob(data);
    },
    ["published-job-by-slug", slug],
    { tags: ["jobs", `job:${slug}`], revalidate: 120 }
  )();
}

/** Cached job row for apply/upload — includes folder id, avoids duplicate fetch. */
export async function getPublishedJobForApply(slug: string) {
  return unstable_cache(
    async () => {
      const supabase = createAdminClient();

      const { data, error } = await supabase
        .from("jobs")
        .select("id, title, status, incoming_folder_id")
        .eq("slug", slug)
        .eq("status", "PUBLISHED")
        .maybeSingle();

      if (error || !data) return null;
      return data;
    },
    ["published-job-apply", slug],
    { tags: ["jobs", `job:${slug}`], revalidate: 120 }
  )();
}

export type JobEditData = {
  id: string;
  title: string;
  slug: string;
  status: string;
  jobType: string;
  hiringPeriodStart: string;
  hiringPeriodEnd: string;
  description: string;
  responsibilities: string;
  requirements: string;
  requiredSkillsText: string;
  preferredSkillsText: string;
  scoringName: string;
  scoringDescription: string;
  criteria: Array<{
    name: string;
    description?: string;
    weight: number;
    criteriaType: "WEIGHT" | "MINIMUM" | "MANDATORY";
    minimumValue?: number;
    isMandatory: boolean;
  }>;
};

export async function getJobForEdit(jobId: string): Promise<JobEditData | null> {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data: job, error } = await supabase
    .from("jobs")
    .select(
      `
      id,
      title,
      slug,
      status,
      job_type,
      hiring_period_start,
      hiring_period_end,
      description,
      responsibilities,
      requirements,
      required_skills,
      preferred_skills,
      scoring_models(
        id,
        name,
        description,
        version,
        scoring_criteria(
          name,
          description,
          weight,
          criteria_type,
          minimum_value,
          is_mandatory
        )
      )
    `
    )
    .eq("id", jobId)
    .single();

  if (error || !job) return null;

  const models = job.scoring_models as unknown as Array<{
    id: string;
    name: string;
    description: string | null;
    version: number;
    scoring_criteria: Array<{
      name: string;
      description: string | null;
      weight: number;
      criteria_type: "WEIGHT" | "MINIMUM" | "MANDATORY";
      minimum_value: number | null;
      is_mandatory: boolean;
    }>;
  }>;

  const scoringModel =
    models?.sort((a, b) => b.version - a.version)[0] ?? null;

  if (!scoringModel) return null;

  return {
    id: job.id,
    title: job.title,
    slug: job.slug,
    status: job.status,
    jobType: job.job_type,
    hiringPeriodStart: job.hiring_period_start ?? "",
    hiringPeriodEnd: job.hiring_period_end ?? "",
    description: job.description ?? "",
    responsibilities: job.responsibilities ?? "",
    requirements: job.requirements ?? "",
    requiredSkillsText: (job.required_skills ?? []).join(", "),
    preferredSkillsText: (job.preferred_skills ?? []).join(", "),
    scoringName: scoringModel.name,
    scoringDescription: scoringModel.description ?? "",
    criteria: (scoringModel.scoring_criteria ?? []).map((criterion) => ({
      name: criterion.name,
      description: criterion.description ?? undefined,
      weight: Number(criterion.weight),
      criteriaType: criterion.criteria_type,
      minimumValue:
        criterion.minimum_value !== null ? Number(criterion.minimum_value) : undefined,
      isMandatory: criterion.is_mandatory,
    })),
  };
}
