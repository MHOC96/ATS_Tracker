import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import type { PublicJob } from "@/lib/jobs/queries";
import { formatJobType } from "@/lib/jobs/format-job";
import { formatHiringPeriod } from "@/lib/jobs/hiring-period";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type JobOpeningCardProps = {
  job: PublicJob;
  className?: string;
};

export function JobOpeningCard({ job, className }: JobOpeningCardProps) {
  const hiringPeriod = formatHiringPeriod(
    job.hiringPeriodStart,
    job.hiringPeriodEnd
  );
  const skillPreview =
    !hiringPeriod && job.requiredSkills.length > 0
      ? job.requiredSkills.slice(0, 3).join(" · ")
      : null;

  return (
    <Link
      href={`/jobs/${job.slug}`}
      className={cn(
        "group flex min-h-full min-w-0 flex-col rounded-xl border border-graphite bg-carbon p-4 transition-colors",
        "shadow-[rgb(35,37,42)_0px_0px_0px_1px_inset]",
        "hover:border-white/12 hover:bg-white/[0.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid-lime/40",
        "sm:p-5",
        className
      )}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="h-auto capitalize whitespace-normal">
          {formatJobType(job.jobType)}
        </Badge>
      </div>

      <h3 className="text-balance text-[16px] font-[510] leading-snug tracking-[-0.012em] text-paper transition-colors group-hover:text-white sm:text-[17px]">
        {job.title}
      </h3>

      {job.description && (
        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-fog sm:line-clamp-3 sm:text-[14px]">
          {job.description}
        </p>
      )}

      {(hiringPeriod || skillPreview) && (
        <p className="mt-3 flex min-w-0 items-start gap-1.5 text-[12px] leading-snug text-fog sm:text-[13px]">
          {hiringPeriod && (
            <CalendarDays
              className="mt-0.5 size-3.5 shrink-0 text-fog/80"
              strokeWidth={1.75}
              aria-hidden
            />
          )}
          <span className="min-w-0 break-words">{hiringPeriod ?? skillPreview}</span>
        </p>
      )}

      <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-[510] text-acid-lime sm:mt-5">
        View & apply
        <ArrowRight
          className="size-3.5 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </span>
    </Link>
  );
}
