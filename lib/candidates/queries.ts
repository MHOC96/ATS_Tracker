import { createClient } from "@/lib/supabase/server";

export type CandidateApplicationListItem = {
  id: string;
  status: string;
  appliedAt: string;
  candidateName: string;
  candidateEmail: string | null;
  jobTitle: string;
  jobId: string;
  finalScore: number | null;
  recommendation: string | null;
};

export type CriterionScoreRow = {
  id: string;
  score: number;
  maximumScore: number;
  reasoning: string | null;
  criterionName: string;
  criterionWeight: number;
};

export type CandidateApplicationDetail = {
  id: string;
  status: string;
  appliedAt: string;
  driveFileUrl: string | null;
  candidate: {
    id: string;
    fullName: string | null;
    email: string | null;
    phone: string | null;
    location: string | null;
  };
  job: {
    id: string;
    title: string;
    slug: string;
  };
  profile: {
    university: string | null;
    degree: string | null;
    gpa: number | null;
    yearsExperience: number | null;
    skills: string[];
  } | null;
  score: {
    id: string;
    finalScore: number;
    recommendation: string;
    matchedSkills: string[];
    missingSkills: string[];
    mandatoryFailures: string[];
    reasoning: string | null;
    criterionScores: CriterionScoreRow[];
  } | null;
  latestDecision: {
    decision: string;
    notes: string | null;
    createdAt: string;
  } | null;
};

type ListOptions = {
  status?: string;
  limit?: number;
};

export async function listCandidateApplications(
  options: ListOptions = {}
): Promise<CandidateApplicationListItem[]> {
  const supabase = await createClient();
  const limit = options.limit ?? 50;

  let query = supabase
    .from("candidate_applications")
    .select(
      `
      id,
      status,
      applied_at,
      job_id,
      candidates(id, full_name, email),
      jobs(id, title),
      candidate_scores(final_score, recommendation)
    `
    )
    .order("applied_at", { ascending: false })
    .limit(limit);

  if (options.status) {
    query = query.eq("status", options.status);
  }

  const { data, error } = await query;

  if (error || !data) return [];

  return data.map((row) => {
    const candidate = row.candidates as unknown as {
      full_name: string | null;
      email: string | null;
    } | null;
    const job = row.jobs as unknown as { id: string; title: string } | null;
    const scores = row.candidate_scores as unknown as
      | Array<{ final_score: number; recommendation: string }>
      | { final_score: number; recommendation: string }
      | null;

    const scoreList = Array.isArray(scores) ? scores : scores ? [scores] : [];
    const latest = scoreList[0];

    return {
      id: row.id,
      status: row.status,
      appliedAt: row.applied_at,
      candidateName: candidate?.full_name ?? "Unknown candidate",
      candidateEmail: candidate?.email ?? null,
      jobTitle: job?.title ?? "Unknown job",
      jobId: row.job_id,
      finalScore: latest ? Number(latest.final_score) : null,
      recommendation: latest?.recommendation ?? null,
    };
  });
}

export async function getCandidateApplicationDetail(
  applicationId: string
): Promise<CandidateApplicationDetail | null> {
  const supabase = await createClient();

  const { data: application, error } = await supabase
    .from("candidate_applications")
    .select(
      `
      id,
      status,
      applied_at,
      drive_file_url,
      candidates(
        id,
        full_name,
        email,
        phone,
        location,
        candidate_profiles(
          university,
          degree,
          gpa,
          years_experience,
          skills
        )
      ),
      jobs(id, title, slug),
      candidate_scores(
        id,
        final_score,
        recommendation,
        matched_skills,
        missing_skills,
        mandatory_failures,
        reasoning,
        criterion_scores(
          id,
          score,
          maximum_score,
          reasoning,
          scoring_criteria(name, weight)
        )
      ),
      admin_decisions(decision, notes, created_at)
    `
    )
    .eq("id", applicationId)
    .single();

  if (error || !application) return null;

  const candidate = application.candidates as unknown as {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    location: string | null;
    candidate_profiles:
      | Array<{
          university: string | null;
          degree: string | null;
          gpa: number | null;
          years_experience: number | null;
          skills: string[] | null;
        }>
      | {
          university: string | null;
          degree: string | null;
          gpa: number | null;
          years_experience: number | null;
          skills: string[] | null;
        }
      | null;
  };

  const job = application.jobs as unknown as {
    id: string;
    title: string;
    slug: string;
  };

  const profileSource = candidate.candidate_profiles;
  const profileRow = Array.isArray(profileSource)
    ? profileSource[0]
    : profileSource;

  const scores = application.candidate_scores as unknown as
    | Array<{
        id: string;
        final_score: number;
        recommendation: string;
        matched_skills: string[] | null;
        missing_skills: string[] | null;
        mandatory_failures: string[] | null;
        reasoning: string | null;
        criterion_scores: Array<{
          id: string;
          score: number;
          maximum_score: number;
          reasoning: string | null;
          scoring_criteria: { name: string; weight: number } | null;
        }> | null;
      }>
    | null;

  const scoreRow = scores?.[0] ?? null;

  const decisions = application.admin_decisions as unknown as
    | Array<{ decision: string; notes: string | null; created_at: string }>
    | { decision: string; notes: string | null; created_at: string }
    | null;

  const decisionList = Array.isArray(decisions)
    ? decisions
    : decisions
      ? [decisions]
      : [];

  const latestDecision = decisionList.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0];

  return {
    id: application.id,
    status: application.status,
    appliedAt: application.applied_at,
    driveFileUrl: application.drive_file_url,
    candidate: {
      id: candidate.id,
      fullName: candidate.full_name,
      email: candidate.email,
      phone: candidate.phone,
      location: candidate.location,
    },
    job: {
      id: job.id,
      title: job.title,
      slug: job.slug,
    },
    profile: profileRow
      ? {
          university: profileRow.university,
          degree: profileRow.degree,
          gpa: profileRow.gpa !== null ? Number(profileRow.gpa) : null,
          yearsExperience:
            profileRow.years_experience !== null
              ? Number(profileRow.years_experience)
              : null,
          skills: profileRow.skills ?? [],
        }
      : null,
    score: scoreRow
      ? {
          id: scoreRow.id,
          finalScore: Number(scoreRow.final_score),
          recommendation: scoreRow.recommendation,
          matchedSkills: scoreRow.matched_skills ?? [],
          missingSkills: scoreRow.missing_skills ?? [],
          mandatoryFailures: scoreRow.mandatory_failures ?? [],
          reasoning: scoreRow.reasoning,
          criterionScores: (scoreRow.criterion_scores ?? []).map((row) => ({
            id: row.id,
            score: Number(row.score),
            maximumScore: Number(row.maximum_score),
            reasoning: row.reasoning,
            criterionName: row.scoring_criteria?.name ?? "Criterion",
            criterionWeight: Number(row.scoring_criteria?.weight ?? 0),
          })),
        }
      : null,
    latestDecision: latestDecision
      ? {
          decision: latestDecision.decision,
          notes: latestDecision.notes,
          createdAt: latestDecision.created_at,
        }
      : null,
  };
}
