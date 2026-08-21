import { Badge } from "@/components/ui/badge";
import { formatJobType } from "@/lib/jobs/format-job";
import type { PublicJob } from "@/lib/jobs/queries";
import { cn } from "@/lib/utils";

type JobPublicHeaderProps = {
  job: PublicJob;
  variant?: "default" | "hero";
  className?: string;
};

export function JobPublicHeader({
  job,
  variant = "default",
  className,
}: JobPublicHeaderProps) {
  const isHero = variant === "hero";
  const postedLabel = job.publishedAt
    ? `Posted ${new Date(job.publishedAt).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })}`
    : null;

  return (
    <header
      className={cn(
        "space-y-2 sm:space-y-2.5",
        !isHero && "border-b border-graphite pb-4 sm:pb-5",
        isHero && "lg:space-y-3",
        className
      )}
    >
      <div
        className={cn(
          "flex flex-wrap items-center gap-2",
          isHero && "lg:items-center lg:justify-between lg:gap-6"
        )}
      >
        <Badge
          variant="secondary"
          className="max-w-full capitalize whitespace-normal lg:text-[13px]"
        >
          {formatJobType(job.jobType)}
        </Badge>
        {postedLabel && isHero && (
          <p className="text-[12px] text-fog sm:text-[13px]">{postedLabel}</p>
        )}
      </div>

      <h1
        className={cn(
          "text-balance font-[510] leading-[1.12] tracking-[-0.022em] text-paper",
          "[font-size:clamp(1.625rem,4.5vw+0.5rem,2.75rem)]",
          isHero &&
            "lg:text-[2.25rem] lg:leading-[1.1] lg:tracking-[-0.024em] xl:text-[2.5rem]"
        )}
      >
        {job.title}
      </h1>

      {postedLabel && !isHero && (
        <p className="text-[12px] text-fog sm:text-[13px]">{postedLabel}</p>
      )}
    </header>
  );
}
