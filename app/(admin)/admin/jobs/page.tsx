import Link from "next/link";
import { JobsTable } from "@/components/jobs/jobs-table";
import { PageTitle } from "@/components/layout/page-title";
import { buttonVariants } from "@/components/ui/button";
import { requireSessionUser } from "@/lib/auth/session";
import { listAdminJobs } from "@/lib/jobs/queries";
import { cn } from "@/lib/utils";

type JobsPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const [user, jobsResult] = await Promise.all([
    requireSessionUser(),
    listAdminJobs({ page }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageTitle
          title="Jobs"
          description="Create, publish, and manage job vacancies."
        />
        {user.role === "ADMIN" && (
          <Link
            href="/admin/jobs/new"
            className={cn(buttonVariants({ size: "sm" }), "w-full sm:w-auto shrink-0")}
          >
            Create job
          </Link>
        )}
      </div>

      <JobsTable
        jobs={jobsResult.jobs}
        total={jobsResult.total}
        page={jobsResult.page}
        pageSize={jobsResult.pageSize}
        canManage={user.role === "ADMIN"}
      />
    </div>
  );
}
