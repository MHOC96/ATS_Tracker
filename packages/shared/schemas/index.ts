import { z } from "zod";

export const jobTypeSchema = z.enum([
  "FULL_TIME",
  "PART_TIME",
  "INTERNSHIP",
  "CONTRACT",
  "TEMPORARY",
]);

export const jobStatusSchema = z.enum([
  "DRAFT",
  "PUBLISHED",
  "CLOSED",
  "ARCHIVED",
]);

export const applicationStatusSchema = z.enum([
  "APPLIED",
  "PROCESSING",
  "AI_REVIEWED",
  "MANUAL_REVIEW",
  "SHORTLISTED",
  "INTERVIEW",
  "ON_HOLD",
  "REJECTED",
  "HIRED",
]);

export const userRoleSchema = z.enum(["ADMIN", "RECRUITER", "REVIEWER"]);

export const recommendationSchema = z.enum([
  "STRONG_MATCH",
  "MATCH",
  "BORDERLINE",
  "WEAK_MATCH",
]);

export const createJobSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  jobType: jobTypeSchema,
  description: z.string().optional(),
  responsibilities: z.string().optional(),
  requirements: z.string().optional(),
  requiredSkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
});

export const scoringCriterionSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  weight: z.number().min(0).max(100),
  criteriaType: z.enum(["WEIGHT", "MINIMUM", "MANDATORY"]).default("WEIGHT"),
  minimumValue: z.number().optional(),
  isMandatory: z.boolean().default(false),
});

export const scoringModelSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  criteria: z.array(scoringCriterionSchema).min(1),
}).refine(
  (data) => {
    const totalWeight = data.criteria.reduce((sum, c) => sum + c.weight, 0);
    return totalWeight === 100;
  },
  { message: "Scoring criteria weights must total 100%" }
);

export const candidateExtractionSchema = z.object({
  fullName: z.string().nullable(),
  email: z.string().email().nullable(),
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

export const queueProcessingSchema = z.object({
  applicationId: z.string().uuid(),
});
