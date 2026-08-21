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

export type ProfileLink = {
  label: string;
  url: string;
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
    profileLinks: ProfileLink[];
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
      jobs(id, title)
    `
    )
    .order("applied_at", { ascending: false })
    .limit(limit);

  if (options.status) {
    query = query.eq("status", options.status);
  }

  const { data, error } = await query;

  if (error || !data) return [];

  const applicationIds = data.map((row) => row.id);
  const { data: scoreRows } = await supabase
    .from("latest_candidate_scores")
    .select("candidate_application_id, final_score, recommendation")
    .in("candidate_application_id", applicationIds);

  const scoreByApplication = new Map(
    (scoreRows ?? []).map((score) => [score.candidate_application_id, score])
  );

  return data.map((row) => {
    const candidate = row.candidates as unknown as {
      full_name: string | null;
      email: string | null;
    } | null;
    const job = row.jobs as unknown as { id: string; title: string } | null;
    const latest = scoreByApplication.get(row.id);

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
          skills,
          profile_links
        )
      ),
      jobs(id, title, slug)
    `
    )
    .eq("id", applicationId)
    .single();

  if (error || !application) return null;

  const [{ data: latestScore }, { data: latestDecision }] = await Promise.all([
    supabase
      .from("latest_candidate_scores")
      .select(
        "id, final_score, recommendation, matched_skills, missing_skills, mandatory_failures, reasoning"
      )
      .eq("candidate_application_id", applicationId)
      .maybeSingle(),
    supabase
      .from("admin_decisions")
      .select("decision, notes, created_at")
      .eq("candidate_application_id", applicationId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  let criterionScores: CriterionScoreRow[] = [];
  if (latestScore?.id) {
    const { data: criterionRows } = await supabase
      .from("criterion_scores")
      .select(
        "id, score, maximum_score, reasoning, scoring_criteria(name, weight)"
      )
      .eq("candidate_score_id", latestScore.id);

    criterionScores = (criterionRows ?? []).map((row) => {
      const criteria = row.scoring_criteria as unknown as {
        name: string;
        weight: number;
      } | null;

      return {
        id: row.id,
        score: Number(row.score),
        maximumScore: Number(row.maximum_score),
        reasoning: row.reasoning,
        criterionName: criteria?.name ?? "Criterion",
        criterionWeight: Number(criteria?.weight ?? 0),
      };
    });
  }

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
          profile_links: ProfileLink[] | null;
        }>
      | {
          university: string | null;
          degree: string | null;
          gpa: number | null;
          years_experience: number | null;
          skills: string[] | null;
          profile_links: ProfileLink[] | null;
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
          profileLinks: Array.isArray(profileRow.profile_links)
            ? profileRow.profile_links.filter(
                (link): link is ProfileLink =>
                  Boolean(link?.label?.trim() && link?.url?.trim())
              )
            : [],
        }
      : null,
    score: latestScore
      ? {
          id: latestScore.id,
          finalScore: Number(latestScore.final_score),
          recommendation: latestScore.recommendation,
          matchedSkills: latestScore.matched_skills ?? [],
          missingSkills: latestScore.missing_skills ?? [],
          mandatoryFailures: latestScore.mandatory_failures ?? [],
          reasoning: latestScore.reasoning,
          criterionScores,
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
