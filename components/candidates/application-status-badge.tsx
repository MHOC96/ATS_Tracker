import {
  formatApplicationStatus,
  resolveApplicationStatusView,
  type RecruiterOutcomeStatus,
} from "@/packages/shared/schemas/application-status";
import { cn } from "@/lib/utils";

type ApplicationPipelineBadgesProps = {
  status: string;
  hasAiScore?: boolean;
  className?: string;
  variant?: "card" | "compact";
};

type FieldTone = "neutral" | "accent" | "success" | "danger";

const toneStyles: Record<FieldTone, string> = {
  neutral: "bg-white/[0.06] text-mist ring-1 ring-inset ring-white/[0.06]",
  accent: "bg-iris-violet/15 text-mist ring-1 ring-inset ring-iris-violet/20",
  success: "bg-pulse-green/15 text-pulse-green ring-1 ring-inset ring-pulse-green/25",
  danger: "bg-coral-red/15 text-coral-red ring-1 ring-inset ring-coral-red/25",
};

function outcomeTone(outcome: RecruiterOutcomeStatus): FieldTone {
  if (outcome === "HIRED" || outcome === "SHORTLISTED") return "success";
  if (outcome === "REJECTED") return "danger";
  return "neutral";
}

function StatusPill({
  value,
  tone,
  className,
}: {
  value: string;
  tone: FieldTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-[7.5rem] shrink-0 items-center justify-center rounded-md px-2 py-1",
        "text-[11px] font-medium leading-none",
        toneStyles[tone],
        className
      )}
      title={value}
    >
      <span className="truncate">{value}</span>
    </span>
  );
}

function PipelineField({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: FieldTone;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1.5 text-center">
      <span className="w-full truncate text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-fog">
        {label}
      </span>
      <StatusPill value={value} tone={tone} className="h-7 w-full max-w-none text-[12px]" />
    </div>
  );
}

export function ApplicationPipelineBadges({
  status,
  hasAiScore = false,
  className,
  variant = "card",
}: ApplicationPipelineBadgesProps) {
  const { screening, outcome } = resolveApplicationStatusView(status, hasAiScore);
  const screeningLabel = formatApplicationStatus(screening);
  const screeningTone = screening === "MANUAL_REVIEW" ? "accent" : "neutral";

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex shrink-0 flex-wrap items-center gap-1.5",
          className
        )}
      >
        <StatusPill value={screeningLabel} tone={screeningTone} />
        {outcome ? (
          <StatusPill
            value={formatApplicationStatus(outcome)}
            tone={outcomeTone(outcome)}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mx-auto w-full rounded-lg border border-graphite bg-obsidian/50 p-2.5",
        outcome ? "max-w-[18rem]" : "max-w-[9.5rem]",
        className
      )}
    >
      <div
        className={cn(
          "grid min-w-0 gap-2.5",
          outcome ? "grid-cols-2" : "grid-cols-1"
        )}
      >
        <PipelineField label="Screening" value={screeningLabel} tone={screeningTone} />
        {outcome ? (
          <PipelineField
            label="Outcome"
            value={formatApplicationStatus(outcome)}
            tone={outcomeTone(outcome)}
          />
        ) : null}
      </div>
    </div>
  );
}

/** @deprecated Use ApplicationPipelineBadges. */
export function ApplicationStatusBadge(props: ApplicationPipelineBadgesProps) {
  return <ApplicationPipelineBadges {...props} />;
}
