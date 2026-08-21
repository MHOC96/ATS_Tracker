import { createClient } from "@/lib/supabase/server";

export type DashboardStats = {
  activeJobs: number;
  totalCandidates: number;
  pendingReview: number;
  interviews: number;
};

export type RecentApplicationRow = {
  id: string;
  candidateName: string;
  jobTitle: string;
  score: number | null;
  status: string;
  appliedAt: string;
};

export type DashboardPageData = {
  stats: DashboardStats;
  recentApplications: RecentApplicationRow[];
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  const [jobsRes, applicationsRes, pendingRes, interviewRes] = await Promise.all([
    supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("status", "PUBLISHED"),
    supabase
      .from("candidate_applications")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("candidate_applications")
      .select("id", { count: "exact", head: true })
      .in("status", ["AI_REVIEWED", "MANUAL_REVIEW"]),
    supabase
      .from("candidate_applications")
      .select("id", { count: "exact", head: true })
      .eq("status", "INTERVIEW"),
  ]);

  return {
    activeJobs: jobsRes.count ?? 0,
    totalCandidates: applicationsRes.count ?? 0,
    pendingReview: pendingRes.count ?? 0,
    interviews: interviewRes.count ?? 0,
  };
}

export async function getDashboardPageData(
  recentLimit = 8
): Promise<DashboardPageData> {
  const [stats, recentApplications] = await Promise.all([
    getDashboardStats(),
    getRecentApplications(recentLimit),
  ]);

  return { stats, recentApplications };
}

export async function getRecentApplications(
  limit = 8
): Promise<RecentApplicationRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("candidate_applications")
    .select(
      `
      id,
      status,
      applied_at,
      candidates(full_name),
      jobs(title)
    `
    )
    .order("applied_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  const applicationIds = data.map((row) => row.id);
  const { data: scoreRows } = await supabase
    .from("latest_candidate_scores")
    .select("candidate_application_id, final_score")
    .in("candidate_application_id", applicationIds);

  const scoreByApplication = new Map(
    (scoreRows ?? []).map((score) => [score.candidate_application_id, score])
  );

  return data.map((row) => {
    const candidate = row.candidates as unknown as {
      full_name: string | null;
    } | null;
    const job = row.jobs as unknown as { title: string } | null;
    const latest = scoreByApplication.get(row.id);
    const latestScore = latest?.final_score ?? null;

    return {
      id: row.id,
      candidateName: candidate?.full_name ?? "Unknown candidate",
      jobTitle: job?.title ?? "Unknown job",
      score: latestScore !== null ? Number(latestScore) : null,
      status: row.status,
      appliedAt: row.applied_at,
    };
  });
}
