import Link from "next/link";
import { JobRowActions } from "@/components/jobs/job-row-actions";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

type JobsTableProps = {
  canManage?: boolean;
};

export async function JobsTable({ canManage = false }: JobsTableProps) {
  const supabase = await createClient();
  const { data: jobs, error } = await supabase
    .from("jobs")
    .select(
      "id, title, slug, job_type, status, published_at, created_at, candidate_applications(count)"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <p className="text-sm text-destructive">Failed to load jobs: {error.message}</p>
    );
  }

  if (!jobs?.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          No jobs yet. Create your first vacancy to get started.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-mono text-lg font-normal">All jobs</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border">
          {jobs.map((job) => {
            const apps = job.candidate_applications as unknown as
              | Array<{ count: number }>
              | { count: number }
              | null;
            const applicationCount = Array.isArray(apps)
              ? apps[0]?.count ?? 0
              : apps?.count ?? 0;

            return (
              <li
                key={job.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <div className="min-w-0 flex-1">
                  {canManage ? (
                    <>
                      <p className="break-words text-sm font-medium">
                        {job.title}
                      </p>
                      <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
                        {job.slug} · {job.job_type.replace(/_/g, " ")}
                        {applicationCount > 0
                          ? ` · ${applicationCount} application(s)`
                          : ""}
                      </p>
                    </>
                  ) : (
                    <Link
                      href={`/admin/jobs/${job.id}`}
                      className="block hover:opacity-80"
                    >
                      <p className="break-words text-sm font-medium">{job.title}</p>
                      <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
                        {job.slug} · {job.job_type.replace(/_/g, " ")}
                      </p>
                    </Link>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end">
                  <Badge variant="outline" className="w-fit shrink-0">
                    {job.status}
                  </Badge>
                  {canManage && (
                    <JobRowActions
                      jobId={job.id}
                      status={job.status}
                      applicationCount={applicationCount}
                      canManage={canManage}
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
