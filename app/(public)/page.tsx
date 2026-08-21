import Link from "next/link";
import { ArrowRight, Briefcase } from "lucide-react";
import { CareersHero } from "@/components/public/careers-hero";
import { JobOpeningCard } from "@/components/public/job-opening-card";
import { buttonVariants } from "@/components/ui/button";
import { listPublishedJobs } from "@/lib/jobs/queries";
import { cn } from "@/lib/utils";

export default async function CareersHomePage() {
  const jobs = await listPublishedJobs();
  const featuredJobs = jobs.slice(0, 6);
  const hasMoreJobs = jobs.length > featuredJobs.length;

  return (
    <div className="min-w-0 space-y-8 sm:space-y-10 lg:space-y-12">
      <CareersHero openRolesCount={jobs.length} />

      {jobs.length === 0 ? (
        <section
          className="rounded-xl border border-dashed border-graphite bg-carbon/50 px-5 py-10 text-center sm:py-14"
          aria-label="No open roles"
        >
          <div className="mx-auto flex max-w-md flex-col items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-xl border border-graphite bg-obsidian text-fog">
              <Briefcase className="size-5" strokeWidth={1.75} aria-hidden />
            </span>
            <h2 className="text-[18px] font-[510] text-paper sm:text-[20px]">
              No open roles right now
            </h2>
            <p className="text-[14px] leading-relaxed text-fog">
              New positions appear here as soon as they&apos;re published. Check
              back soon or bookmark this page.
            </p>
          </div>
        </section>
      ) : (
        <section className="space-y-5 sm:space-y-6" aria-labelledby="openings-heading">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div className="min-w-0 space-y-1">
              <h2
                id="openings-heading"
                className="text-[20px] font-[510] tracking-[-0.012em] text-paper sm:text-[22px]"
              >
                Current openings
              </h2>
              <p className="text-[13px] text-fog sm:text-[14px]">
                {jobs.length} {jobs.length === 1 ? "role" : "roles"} available — tap a card to
                read more and apply.
              </p>
            </div>

            {hasMoreJobs && (
              <Link
                href="/jobs"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "w-full shrink-0 justify-center sm:w-auto"
                )}
              >
                View all {jobs.length} roles
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            )}
          </div>

          <ul className="grid min-w-0 grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
            {featuredJobs.map((job) => (
              <li key={job.id} className="min-w-0">
                <JobOpeningCard job={job} />
              </li>
            ))}
          </ul>

          {hasMoreJobs && (
            <div className="flex justify-center pt-1 sm:pt-2">
              <Link
                href="/jobs"
                className="inline-flex items-center gap-1.5 text-[13px] font-[510] text-mist transition-colors hover:text-paper sm:text-[14px]"
              >
                See all open roles
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
