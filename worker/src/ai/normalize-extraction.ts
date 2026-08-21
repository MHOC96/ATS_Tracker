import type { CandidateExtraction } from "../schemas.js";
import { normalizeProfileLinks } from "../schemas.js";

export type ApplyFormHints = {
  fullName?: string | null;
  email?: string | null;
};

export function normalizeSkills(skills: string[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const skill of skills) {
    const trimmed = skill.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push(trimmed);
  }

  return normalized.slice(0, 40);
}

export function mergeApplyFormHints(
  data: CandidateExtraction,
  hints?: ApplyFormHints | null
): CandidateExtraction {
  if (!hints) return data;

  return {
    ...data,
    fullName: data.fullName ?? hints.fullName ?? null,
    email: data.email ?? hints.email ?? null,
    skills: normalizeSkills(data.skills ?? []),
    profileLinks: normalizeProfileLinks(data.profileLinks ?? []),
  };
}

export function formatZodIssues(issues: Array<{ message: string }>): string {
  return issues.map((issue) => issue.message).join("; ");
}
