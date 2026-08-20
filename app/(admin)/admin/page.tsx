import { DashboardStats } from "@/components/admin/dashboard-stats";
import { RecentApplications } from "@/components/admin/recent-applications";
import { Separator } from "@/components/ui/separator";
import { getDashboardPageData } from "@/lib/dashboard/queries";

export default async function AdminDashboardPage() {
  const { stats, recentApplications } = await getDashboardPageData();

  return (
    <div className="space-y-8">
      <div>
          <h1 className="font-mono text-xl tracking-tight sm:text-2xl lg:text-3xl">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Overview of active jobs, candidates, and recruitment pipeline.
        </p>
      </div>

      <Separator />

      <DashboardStats stats={stats} />

      <RecentApplications applications={recentApplications} />
    </div>
  );
}
