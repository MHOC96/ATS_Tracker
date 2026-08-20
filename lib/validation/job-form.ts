import { z } from "zod";
import { jobTypeSchema } from "@/packages/shared/schemas";

export const jobFormCriterionSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  weight: z.coerce.number().min(0).max(100),
  criteriaType: z.enum(["WEIGHT", "MINIMUM", "MANDATORY"]),
  minimumValue: z.coerce.number().optional(),
  isMandatory: z.boolean(),
});

const jobFormBaseSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  jobType: jobTypeSchema,
  description: z.string().optional(),
  responsibilities: z.string().optional(),
  requirements: z.string().optional(),
  requiredSkillsText: z.string().optional(),
  preferredSkillsText: z.string().optional(),
  scoringName: z.string().min(1, "Scoring model name is required"),
  scoringDescription: z.string().optional(),
  criteria: z.array(jobFormCriterionSchema).min(1),
  aiGeneratedJd: z.boolean().optional(),
});

function validateScoringWeights(
  data: z.infer<typeof jobFormBaseSchema>,
  ctx: z.RefinementCtx
) {
  const weightCriteria = data.criteria.filter((c) => c.criteriaType === "WEIGHT");
  const totalWeight = weightCriteria.reduce((sum, c) => sum + c.weight, 0);

  if (weightCriteria.length > 0 && totalWeight !== 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Weight criteria must total 100% (currently ${totalWeight}%)`,
      path: ["criteria"],
    });
  }
}

export const createJobFormSchema = jobFormBaseSchema.superRefine(validateScoringWeights);

export const publishJobSchema = z.object({
  jobId: z.string().uuid(),
});

export const updateJobSchema = jobFormBaseSchema
  .extend({
    jobId: z.string().uuid(),
  })
  .superRefine(validateScoringWeights);

export const archiveJobSchema = z.object({
  jobId: z.string().uuid(),
});

export const closeJobSchema = z.object({
  jobId: z.string().uuid(),
});

export function parseSkillsText(text?: string): string[] {
  if (!text?.trim()) return [];
  return text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export const JOB_TYPE_OPTIONS = jobTypeSchema.options.map((value) => ({
  value,
  label: value.replace(/_/g, " "),
}));
