import { z } from "zod";

export const profileLinkSchema = z.object({
  label: z.string().min(1),
  url: z.string().min(1),
});

export type ProfileLink = z.infer<typeof profileLinkSchema>;

export function normalizeProfileUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed.replace(/^\/+/, "")}`;
}

export function normalizeProfileLinks(links: ProfileLink[]): ProfileLink[] {
  const seen = new Set<string>();
  const normalized: ProfileLink[] = [];

  for (const link of links) {
    const label = link.label.trim();
    const url = normalizeProfileUrl(link.url);
    if (!label || !url) continue;

    const key = url.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push({ label, url });
  }

  return normalized.slice(0, 20);
}

export const candidateExtractionSchema = z.object({
  fullName: z.string().nullable(),
  email: z
    .union([z.string().email(), z.literal(""), z.null()])
    .transform((value) => (value === "" ? null : value)),
  phone: z.string().nullable(),
  location: z.string().nullable(),
  university: z.string().nullable(),
  degree: z.string().nullable(),
  gpa: z.number().nullable(),
  yearsExperience: z.number().nullable(),
  skills: z.array(z.string()).default([]),
  education: z.array(z.record(z.string(), z.unknown())).default([]),
  experience: z.array(z.record(z.string(), z.unknown())).default([]),
  certifications: z
    .array(z.union([z.string(), z.record(z.string(), z.unknown())]))
    .default([])
    .transform((items) =>
      items.map((item) =>
        typeof item === "string" ? item.trim() : JSON.stringify(item)
      ).filter(Boolean)
    ),
  projects: z.array(z.record(z.string(), z.unknown())).default([]),
  profileLinks: z
    .array(profileLinkSchema)
    .default([])
    .transform(normalizeProfileLinks),
  extractionConfidence: z.number().min(0).max(1).nullable().optional(),
});

export type CandidateExtraction = z.infer<typeof candidateExtractionSchema>;

export const auditOutputSchema = z.object({
  finalScore: z.number().min(0).max(100),
  recommendation: z.enum(["STRONG_MATCH", "MATCH", "BORDERLINE", "WEAK_MATCH"]),
  matchedSkills: z.array(z.string()).default([]),
  missingSkills: z.array(z.string()).default([]),
  mandatoryFailures: z.array(z.string()).default([]),
  reasoning: z.string(),
  criterionScores: z
    .array(
      z.object({
        criterionName: z.string(),
        score: z.number(),
        maximumScore: z.number(),
        reasoning: z.string().optional(),
      })
    )
    .default([]),
});

export type AuditOutput = z.infer<typeof auditOutputSchema>;
