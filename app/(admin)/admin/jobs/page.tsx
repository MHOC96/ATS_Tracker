import Link from "next/link";
import { JobsTable } from "@/components/jobs/jobs-table";
import { buttonVariants } from "@/components/ui/button";
import { requireSessionUser } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

export default async function JobsPage() {
  const user = await requireSessionUser();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-mono text-xl tracking-tight sm:text-2xl">Jobs</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create, publish, and manage job vacancies.
          </p>
        </div>
        {user.role === "ADMIN" && (
          <Link href="/admin/jobs/new" className={cn(buttonVariants({ size: "sm" }), "w-full sm:w-auto")}>
            Create job
          </Link>
        )}
      </div>

      <JobsTable />
    </div>
  );
}
