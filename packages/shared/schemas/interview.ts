import { z } from "zod";

export const interviewTypeOptions = [
  {
    value: "technical-30",
    label: "Technical Interview – 30 mins",
    durationMinutes: 30,
  },
  {
    value: "coding-45",
    label: "Coding Assessment – 45 mins",
    durationMinutes: 45,
  },
  {
    value: "hr-20",
    label: "HR Screening – 20 mins",
    durationMinutes: 20,
  },
  {
    value: "final-60",
    label: "Final Interview – 60 mins",
    durationMinutes: 60,
  },
  {
    value: "culture-30",
    label: "Culture Fit – 30 mins",
    durationMinutes: 30,
  },
] as const;

export type InterviewTypeValue = (typeof interviewTypeOptions)[number]["value"];

export const interviewTypeValueSchema = z.enum([
  "technical-30",
  "coding-45",
  "hr-20",
  "final-60",
  "culture-30",
]);

export function getInterviewTypeLabel(value: InterviewTypeValue): string {
  return (
    interviewTypeOptions.find((option) => option.value === value)?.label ??
    value
  );
}
