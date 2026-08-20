import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listPublishedJobs } from "@/lib/jobs/queries";
import { cn } from "@/lib/utils";

function formatJobType(jobType: string) {
  return jobType.replace(/_/g, " ");
}

export default async function CareersHomePage() {
  const jobs = await listPublishedJobs();

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Join our team
        </p>
        <h1 className="font-mono text-3xl tracking-tight lg:text-4xl">
          Open opportunities
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Browse published roles and apply with your CV. Applications are screened
          by AI to help recruiters review matches faster — every hiring decision
          is reviewed by a person.
        </p>
        {jobs.length > 0 && (
          <Link href="/jobs" className={cn(buttonVariants())}>
            View all roles
          </Link>
        )}
      </section>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No open roles at the moment. Check back soon.
          </CardContent>
        </Card>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2">
          {jobs.slice(0, 4).map((job) => (
            <Card key={job.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="font-mono text-lg font-normal">
                    {job.title}
                  </CardTitle>
                  <Badge variant="outline">{formatJobType(job.jobType)}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {job.description && (
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {job.description}
                  </p>
                )}
                <Link
                  href={`/jobs/${job.slug}`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  View & apply
                </Link>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}
