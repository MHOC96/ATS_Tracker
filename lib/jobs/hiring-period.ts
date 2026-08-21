import { jobTypeRequiresHiringPeriod } from "@/packages/shared/schemas/job-types";
import type { z } from "zod";
import { jobTypeSchema } from "@/packages/shared/schemas/job-types";

type JobType = z.infer<typeof jobTypeSchema>;

export function hiringPeriodDbValues(
  jobType: JobType,
  hiringPeriodStart?: string,
  hiringPeriodEnd?: string
): { hiring_period_start: string | null; hiring_period_end: string | null } {
  if (!jobTypeRequiresHiringPeriod(jobType)) {
    return { hiring_period_start: null, hiring_period_end: null };
  }

  return {
    hiring_period_start: hiringPeriodStart?.trim() || null,
    hiring_period_end: hiringPeriodEnd?.trim() || null,
  };
}

export function formatHiringPeriod(
  start: string | null | undefined,
  end: string | null | undefined
): string | null {
  if (!start && !end) return null;

  const format = (value: string) =>
    new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  if (start && end) return `${format(start)} – ${format(end)}`;
  if (start) return `From ${format(start)}`;
  return `Until ${format(end!)}`;
}

export function getHiringPeriodLabel(jobType: JobType): string {
  switch (jobType) {
    case "INTERNSHIP":
      return "Internship period";
    case "CONTRACT":
      return "Contract period";
    default:
      return "Duration";
  }
}
