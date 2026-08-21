import { z } from "zod";
import { applicationStatusSchema } from "@/packages/shared/schemas";

export const updateCandidateSchema = z.object({
  applicationId: z.string().uuid(),
  fullName: z.string().min(1, "Full name is required"),
  email: z
    .string()
    .email("A valid email is required")
    .or(z.literal(""))
    .optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  status: applicationStatusSchema.optional(),
});

export const deleteApplicationSchema = z.object({
  applicationId: z.string().uuid(),
});
