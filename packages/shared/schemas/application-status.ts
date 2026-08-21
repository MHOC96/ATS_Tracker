import { z } from "zod";

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

export type ApplicationStatus = z.infer<typeof applicationStatusSchema>;

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  APPLIED: "Applied",
  PROCESSING: "Processing",
  AI_REVIEWED: "AI reviewed",
  MANUAL_REVIEW: "Manual review",
  SHORTLISTED: "Shortlisted",
  INTERVIEW: "Interview",
  ON_HOLD: "On hold",
  REJECTED: "Rejected",
  HIRED: "Hired",
};

export const applicationStatusDescriptions: Record<ApplicationStatus, string> = {
  APPLIED: "CV received; waiting for AI screening to start.",
  PROCESSING: "AI screening is running.",
  AI_REVIEWED: "Screening complete; awaiting a recruiter decision.",
  MANUAL_REVIEW: "AI could not safely process this CV; needs human review.",
  SHORTLISTED: "Marked as a strong fit for the role.",
  INTERVIEW: "Scheduled or actively interviewing.",
  ON_HOLD: "Paused; not rejected and not moving forward yet.",
  REJECTED: "Not proceeding with this candidate.",
  HIRED: "Offer accepted; hire complete.",
};

/** System / AI pipeline — not set via Edit candidate. */
export const screeningApplicationStatuses = [
  "APPLIED",
  "PROCESSING",
  "AI_REVIEWED",
  "MANUAL_REVIEW",
] as const satisfies readonly ApplicationStatus[];

export type ScreeningApplicationStatus =
  (typeof screeningApplicationStatuses)[number];

/** Recruiter hiring outcomes — set only via Recruiter decision. */
export const recruiterOutcomeStatuses = [
  "SHORTLISTED",
  "INTERVIEW",
  "ON_HOLD",
  "REJECTED",
  "HIRED",
] as const satisfies readonly ApplicationStatus[];

export type RecruiterOutcomeStatus = (typeof recruiterOutcomeStatuses)[number];

export const recruiterOutcomeStatusSchema = z.enum(recruiterOutcomeStatuses);

/** @deprecated Use screeningApplicationStatuses. */
export const systemManagedApplicationStatuses = ["APPLIED", "PROCESSING"] as const;

/** @deprecated Use recruiterOutcomeStatusSchema. */
export const recruiterEditableApplicationStatuses = recruiterOutcomeStatuses;

/** @deprecated Use recruiterOutcomeStatusSchema. */
export const recruiterApplicationStatusSchema = recruiterOutcomeStatusSchema;

/** Stored on admin_decisions; mapped from recruiter outcome for audit history. */
export const adminDecisionSchema = z.enum([
  "SHORTLIST",
  "INTERVIEW",
  "HOLD",
  "REJECT",
  "HIRED",
]);

export type AdminDecision = z.infer<typeof adminDecisionSchema>;

export const applicationStatusToAdminDecision: Record<
  RecruiterOutcomeStatus,
  AdminDecision
> = {
  SHORTLISTED: "SHORTLIST",
  INTERVIEW: "INTERVIEW",
  ON_HOLD: "HOLD",
  REJECTED: "REJECT",
  HIRED: "HIRED",
};

export const recruiterOutcomeOptions = recruiterOutcomeStatuses.map((status) => ({
  value: status,
  label: applicationStatusLabels[status],
  description: applicationStatusDescriptions[status],
}));

/** @deprecated Use recruiterOutcomeOptions. */
export const adminDecisionOptions = recruiterOutcomeOptions.map((option) => ({
  value: applicationStatusToAdminDecision[option.value],
  label: option.label,
  description: option.description,
}));

export type ApplicationStatusView = {
  screening: ScreeningApplicationStatus;
  outcome: RecruiterOutcomeStatus | null;
};

export function isScreeningApplicationStatus(
  status: string
): status is ScreeningApplicationStatus {
  return (screeningApplicationStatuses as readonly string[]).includes(status);
}

export function isRecruiterOutcomeStatus(
  status: string
): status is RecruiterOutcomeStatus {
  return (recruiterOutcomeStatuses as readonly string[]).includes(status);
}

/** @deprecated Use isScreeningApplicationStatus for APPLIED/PROCESSING checks. */
export function isSystemManagedApplicationStatus(
  status: string
): status is "APPLIED" | "PROCESSING" {
  return status === "APPLIED" || status === "PROCESSING";
}

/** Split one DB status into screening vs recruiter outcome for display (Option B). */
export function resolveApplicationStatusView(
  status: string,
  hasAiScore = false
): ApplicationStatusView {
  if (isRecruiterOutcomeStatus(status)) {
    return {
      screening: hasAiScore ? "AI_REVIEWED" : "MANUAL_REVIEW",
      outcome: status,
    };
  }

  if (isScreeningApplicationStatus(status)) {
    return { screening: status, outcome: null };
  }

  return { screening: "APPLIED", outcome: null };
}

export function formatApplicationStatus(status: string): string {
  if (status in applicationStatusLabels) {
    return applicationStatusLabels[status as ApplicationStatus];
  }

  return status.replace(/_/g, " ");
}

export function getApplicationStatusDescription(status: string): string | undefined {
  if (status in applicationStatusDescriptions) {
    return applicationStatusDescriptions[status as ApplicationStatus];
  }

  return undefined;
}

export function formatAdminDecision(decision: string): string {
  const mapped: Record<string, ApplicationStatus> = {
    SHORTLIST: "SHORTLISTED",
    INTERVIEW: "INTERVIEW",
    HOLD: "ON_HOLD",
    REJECT: "REJECTED",
    HIRED: "HIRED",
    MANUAL_REVIEW: "MANUAL_REVIEW",
  };

  const status = mapped[decision];
  if (status) {
    return applicationStatusLabels[status];
  }

  return decision.replace(/_/g, " ");
}
