import Link from "next/link";
import { JobRowActions } from "@/components/jobs/job-row-actions";
import { JobsPagination } from "@/components/jobs/jobs-pagination";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AdminJobListItem } from "@/lib/jobs/queries";

type JobsTableProps = {
  jobs: AdminJobListItem[];
  total: number;
  page: number;
  pageSize: number;
  canManage?: boolean;
};

export function JobsTable({
  jobs,
  total,
  page,
  pageSize,
  canManage = false,
}: JobsTableProps) {
  if (!jobs.length) {
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
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
        <CardTitle>All jobs</CardTitle>
        <p className="text-sm text-muted-foreground">
          {total} job{total === 1 ? "" : "s"}
        </p>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-graphite">
          {jobs.map((job) => (
            <li
              key={job.id}
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <div className="min-w-0 flex-1">
                {canManage ? (
                  <>
                    <p className="break-words text-sm font-medium">{job.title}</p>
                    <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
                      {job.slug} · {job.jobType.replace(/_/g, " ")}
                      {job.applicationCount > 0
                        ? ` · ${job.applicationCount} application(s)`
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
                      {job.slug} · {job.jobType.replace(/_/g, " ")}
                    </p>
                  </Link>
                )}
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                <Badge variant="outline" className="w-fit shrink-0">
                  {job.status}
                </Badge>
                {canManage && (
                  <JobRowActions
                    jobId={job.id}
                    status={job.status}
                    applicationCount={job.applicationCount}
                    canManage={canManage}
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
        <JobsPagination total={total} page={page} pageSize={pageSize} />
      </CardContent>
    </Card>
  );
}
