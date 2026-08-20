import Link from "next/link";
import { JobsTable } from "@/components/jobs/jobs-table";
import { buttonVariants } from "@/components/ui/button";
import { requireSessionUser } from "@/lib/auth/session";

export default async function JobsPage() {
  const user = await requireSessionUser();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-mono text-2xl tracking-tight">Jobs</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create, publish, and manage job vacancies.
          </p>
        </div>
        {user.role === "ADMIN" && (
          <Link href="/admin/jobs/new" className={buttonVariants({ size: "sm" })}>
            Create job
          </Link>
        )}
      </div>

      <JobsTable />
    </div>
  );
}
