import type { ComponentType, ReactNode } from "react";
import {
  Briefcase,
  CalendarDays,
  Sparkles,
  Star,
  Target,
} from "lucide-react";
import type { PublicJob } from "@/lib/jobs/queries";
import {
  parseJobContentLines,
  parseJobParagraphs,
} from "@/lib/jobs/job-content";
import { formatHiringPeriod, getHiringPeriodLabel } from "@/lib/jobs/hiring-period";
import { JobPublicHeader } from "@/components/jobs/job-public-header";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type JobPublicViewProps = {
  job: PublicJob;
  className?: string;
  /** Hide title/header — use when the page renders a separate desktop hero. */
  omitHeader?: boolean;
};

function SectionBlock({
  icon: Icon,
  title,
  children,
  className,
}: {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "min-w-0 rounded-xl border border-graphite bg-carbon p-4",
        "shadow-[rgb(35,37,42)_0px_0px_0px_1px_inset]",
        "lg:p-5",
        className
      )}
    >
      <div className="mb-2.5 flex items-start gap-2 sm:mb-3 sm:items-center">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] ring-1 ring-inset ring-white/[0.06]">
          <Icon className="size-4 text-acid-lime" strokeWidth={1.75} />
        </span>
        <h2 className="min-w-0 flex-1 text-balance text-[15px] font-[510] leading-snug tracking-[-0.012em] text-paper sm:text-[17px]">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5 sm:space-y-3">
      {items.map((item, index) => (
        <li
          key={`${index}-${item}`}
          className="flex gap-2.5 text-[14px] leading-relaxed text-mist sm:gap-3 sm:text-[15px] sm:leading-[1.65]"
        >
          <span
            className="mt-2 size-1.5 shrink-0 rounded-full bg-acid-lime"
            aria-hidden
          />
          <span className="min-w-0 flex-1 break-words [overflow-wrap:anywhere]">
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function JobPublicView({
  job,
  className,
  omitHeader = false,
}: JobPublicViewProps) {
  const hiringPeriod = formatHiringPeriod(
    job.hiringPeriodStart,
    job.hiringPeriodEnd
  );
  const aboutParagraphs = parseJobParagraphs(job.description);
  const responsibilities = parseJobContentLines(job.responsibilities);
  const requirements = parseJobContentLines(job.requirements);
  const twoColumnSections =
    responsibilities.length > 0 && requirements.length > 0;

  return (
    <article
      className={cn(
        "min-w-0 w-full space-y-4",
        "lg:space-y-5",
        className
      )}
    >
      {!omitHeader && <JobPublicHeader job={job} />}

      <SectionBlock icon={Briefcase} title="About the role">
        {hiringPeriod && (
          <div
            className={cn(
              "mb-3 space-y-1 border-b border-graphite/60 pb-3 sm:mb-3.5 sm:pb-3.5",
              "lg:mb-4 lg:flex lg:items-center lg:justify-between lg:gap-4 lg:space-y-0 lg:rounded-lg lg:border lg:border-graphite/80 lg:bg-white/[0.02] lg:px-3.5 lg:py-2.5 lg:pb-2.5"
            )}
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-fog sm:text-[12px] lg:shrink-0">
              {getHiringPeriodLabel(job.jobType)}
            </p>
            <p className="flex items-start gap-2 text-[14px] leading-relaxed text-mist sm:items-center sm:text-[15px] lg:justify-end lg:text-right">
              <CalendarDays
                className="mt-0.5 size-4 shrink-0 text-fog sm:mt-0 lg:order-last"
                strokeWidth={1.75}
                aria-hidden
              />
              <span className="min-w-0 [overflow-wrap:anywhere]">{hiringPeriod}</span>
            </p>
          </div>
        )}
        {aboutParagraphs.length > 0 ? (
          <div className="space-y-2.5 sm:space-y-3 lg:max-w-3xl">
            {aboutParagraphs.map((paragraph, index) => (
              <p
                key={`${index}-${paragraph.slice(0, 24)}`}
                className="text-pretty text-[14px] leading-[1.65] text-mist sm:text-[15px] md:text-[16px] md:leading-[1.7] [overflow-wrap:anywhere]"
              >
                {paragraph}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-[14px] text-fog">No description provided.</p>
        )}
      </SectionBlock>

      {(responsibilities.length > 0 || requirements.length > 0) && (
        <div
          className={cn(
            "grid min-w-0 gap-4",
            twoColumnSections && "md:grid-cols-2 md:items-start lg:gap-5"
          )}
        >
          {responsibilities.length > 0 && (
            <SectionBlock icon={Target} title="What you'll do">
              <BulletList items={responsibilities} />
            </SectionBlock>
          )}
          {requirements.length > 0 && (
            <SectionBlock icon={Sparkles} title="What we're looking for">
              <BulletList items={requirements} />
            </SectionBlock>
          )}
        </div>
      )}

      {(job.requiredSkills.length > 0 || job.preferredSkills.length > 0) && (
        <SectionBlock icon={Star} title="Skills">
          <div className="space-y-3 sm:space-y-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-5 lg:space-y-0">
            {job.requiredSkills.length > 0 && (
              <div className="space-y-2.5 sm:space-y-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-fog sm:text-[12px]">
                  Required
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {job.requiredSkills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="tag"
                      className="h-auto max-w-full px-2 py-1 text-[11px] whitespace-normal sm:px-2.5 sm:text-[12px]"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {job.preferredSkills.length > 0 && (
              <div className="space-y-2.5 sm:space-y-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-fog sm:text-[12px]">
                  Nice to have
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {job.preferredSkills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="h-auto max-w-full px-2 py-1 text-[11px] whitespace-normal sm:px-2.5 sm:text-[12px]"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SectionBlock>
      )}
    </article>
  );
}
