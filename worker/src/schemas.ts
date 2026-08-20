import { z } from "zod";

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
  certifications: z.array(z.record(z.string(), z.unknown())).default([]),
  projects: z.array(z.record(z.string(), z.unknown())).default([]),
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
