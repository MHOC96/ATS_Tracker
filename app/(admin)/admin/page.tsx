import { DashboardStats } from "@/components/admin/dashboard-stats";
import { RecentApplications } from "@/components/admin/recent-applications";
import { PageTitle } from "@/components/layout/page-title";
import { getDashboardPageData } from "@/lib/dashboard/queries";

export default async function AdminDashboardPage() {
  const { stats, recentApplications } = await getDashboardPageData();

  return (
    <div className="space-y-8 sm:space-y-10">
      <PageTitle
        mono="Overview"
        title="Dashboard"
        description="Active jobs, candidates, and recruitment pipeline."
      />

      <DashboardStats stats={stats} />

      <RecentApplications applications={recentApplications} />
    </div>
  );
}
