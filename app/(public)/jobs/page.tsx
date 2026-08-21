import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listPublishedJobs } from "@/lib/jobs/queries";
import { cn } from "@/lib/utils";

function formatJobType(jobType: string) {
  return jobType.replace(/_/g, " ");
}

export default async function JobsIndexPage() {
  const jobs = await listPublishedJobs();

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="linear-heading text-[28px] sm:text-[40px] lg:text-[48px]">Open roles</h1>
        <p className="linear-caption">
          {jobs.length} published {jobs.length === 1 ? "vacancy" : "vacancies"}
        </p>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center linear-caption">
            No open roles right now.
          </CardContent>
        </Card>
      ) : (
        <ul className="divide-y divide-graphite rounded-xl border border-graphite bg-carbon shadow-[rgb(35,37,42)_0px_0px_0px_1px_inset]">
          {jobs.map((job) => (
            <li
              key={job.id}
              className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[15px] font-[510] text-paper">{job.title}</p>
                  <Badge variant="outline">{formatJobType(job.jobType)}</Badge>
                </div>
                <p className="text-[13px] text-fog">
                  {job.requiredSkills.length > 0 &&
                    job.requiredSkills.slice(0, 4).join(" · ")}
                </p>
              </div>
              <Link
                href={`/jobs/${job.slug}`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "w-full sm:w-auto shrink-0"
                )}
              >
                Apply
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
