import Link from "next/link";
import { JobsTable } from "@/components/jobs/jobs-table";
import { PageTitle } from "@/components/layout/page-title";
import { buttonVariants } from "@/components/ui/button";
import { requireSessionUser } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

export default async function JobsPage() {
  const user = await requireSessionUser();

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

      <JobsTable canManage={user.role === "ADMIN"} />
    </div>
  );
}
