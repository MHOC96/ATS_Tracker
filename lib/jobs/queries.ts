import { createAdminClient } from "@/lib/supabase/admin";

export type PublicJob = {
  id: string;
  title: string;
  slug: string;
  jobType: string;
  description: string | null;
  responsibilities: string | null;
  requirements: string | null;
  requiredSkills: string[];
  preferredSkills: string[];
  publishedAt: string | null;
};

const PUBLIC_JOB_FIELDS =
  "id, title, slug, job_type, description, responsibilities, requirements, required_skills, preferred_skills, published_at";

function mapPublicJob(row: {
  id: string;
  title: string;
  slug: string;
  job_type: string;
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
    jobType: row.job_type,
    description: row.description,
    responsibilities: row.responsibilities,
    requirements: row.requirements,
    requiredSkills: row.required_skills ?? [],
    preferredSkills: row.preferred_skills ?? [],
    publishedAt: row.published_at,
  };
}

export async function listPublishedJobs(): Promise<PublicJob[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("jobs")
    .select(PUBLIC_JOB_FIELDS)
    .eq("status", "PUBLISHED")
    .order("published_at", { ascending: false });

  if (error || !data) return [];

  return data.map(mapPublicJob);
}

export async function getPublishedJobBySlug(
  slug: string
): Promise<PublicJob | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("jobs")
    .select(PUBLIC_JOB_FIELDS)
    .eq("slug", slug)
    .eq("status", "PUBLISHED")
    .maybeSingle();

  if (error || !data) return null;

  return mapPublicJob(data);
}
