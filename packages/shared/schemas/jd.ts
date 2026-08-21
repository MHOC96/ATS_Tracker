import { z } from "zod";
import { jobTypeSchema } from "./enums";

export const jdGenerationInputSchema = z.object({
  title: z.string().min(1),
  jobType: jobTypeSchema,
  requiredSkillsText: z.string().optional(),
  preferredSkillsText: z.string().optional(),
  additionalContext: z.string().optional(),
});

export const jdGenerationOutputSchema = z.object({
  description: z.string(),
  responsibilities: z.string(),
  requirements: z.string(),
  requiredSkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
});
