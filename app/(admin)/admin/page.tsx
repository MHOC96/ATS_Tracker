import { DashboardStats } from "@/components/admin/dashboard-stats";
import { RecentApplications } from "@/components/admin/recent-applications";
import { Separator } from "@/components/ui/separator";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-mono text-2xl tracking-tight lg:text-3xl">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Overview of active jobs, candidates, and recruitment pipeline.
        </p>
      </div>

      <Separator />

      <DashboardStats />

      <RecentApplications />
    </div>
  );
}
