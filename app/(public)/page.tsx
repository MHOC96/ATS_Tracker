import Link from "next/link";
import { CareersHero } from "@/components/public/careers-hero";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listPublishedJobs } from "@/lib/jobs/queries";
import { cn } from "@/lib/utils";

function formatJobType(jobType: string) {
  return jobType.replace(/_/g, " ");
}

export default async function CareersHomePage() {
  const jobs = await listPublishedJobs();

  return (
    <div className="space-y-10 sm:space-y-14 lg:space-y-16">
      <CareersHero openRolesCount={jobs.length} />

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 sm:py-16 text-center linear-caption">
            No open roles at the moment. Check back soon.
          </CardContent>
        </Card>
      ) : (
        <section className="space-y-4 sm:space-y-6" aria-labelledby="openings-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2
              id="openings-heading"
              className="text-[20px] font-[510] tracking-[-0.012em] text-paper sm:text-[24px]"
            >
              Current openings
            </h2>
            {jobs.length > 4 && (
              <Link
                href="/jobs"
                className="text-[13px] text-mist hover:text-paper hover:underline"
              >
                View all {jobs.length} roles
              </Link>
            )}
          </div>

          <ul className="divide-y divide-graphite rounded-xl border border-graphite bg-carbon shadow-[rgb(35,37,42)_0px_0px_0px_1px_inset]">
            {jobs.slice(0, 4).map((job) => (
              <li
                key={job.id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6"
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[15px] font-[510] leading-snug text-paper sm:text-[16px]">
                      {job.title}
                    </p>
                    <Badge variant="outline" className="shrink-0">
                      {formatJobType(job.jobType)}
                    </Badge>
                  </div>
                  {job.description && (
                    <p className="line-clamp-2 text-[13px] leading-relaxed text-fog sm:line-clamp-3">
                      {job.description}
                    </p>
                  )}
                </div>
                <Link
                  href={`/jobs/${job.slug}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "w-full shrink-0 justify-center sm:w-auto"
                  )}
                >
                  View & apply
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
