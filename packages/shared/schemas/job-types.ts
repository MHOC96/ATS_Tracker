import { z } from "zod";

/** Job types available when creating or editing vacancies. */
export const jobTypeSchema = z.enum(["FULL_TIME", "INTERNSHIP", "CONTRACT"]);

export const jobStatusSchema = z.enum([
  "DRAFT",
  "PUBLISHED",
  "CLOSED",
  "ARCHIVED",
]);

export function jobTypeRequiresHiringPeriod(
  jobType: z.infer<typeof jobTypeSchema>
): boolean {
  return jobType === "INTERNSHIP" || jobType === "CONTRACT";
}
