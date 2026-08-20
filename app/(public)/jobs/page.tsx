import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listPublishedJobs } from "@/lib/jobs/queries";
import { cn } from "@/lib/utils";

function formatJobType(jobType: string) {
  return jobType.replace(/_/g, " ");
}

export default async function JobsIndexPage() {
  const jobs = await listPublishedJobs();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-mono text-2xl tracking-tight lg:text-3xl">
          Open roles
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {jobs.length} published {jobs.length === 1 ? "vacancy" : "vacancies"}
        </p>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No open roles right now.
          </CardContent>
        </Card>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {jobs.map((job) => (
            <li key={job.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="min-w-0 flex-1">
                <p className="break-words font-medium">{job.title}</p>
                <p className="break-words text-xs text-muted-foreground">
                  {formatJobType(job.jobType)}
                  {job.requiredSkills.length > 0 &&
                    ` · ${job.requiredSkills.slice(0, 3).join(", ")}`}
                </p>
              </div>
              <Link
                href={`/jobs/${job.slug}`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "w-full sm:w-auto"
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
