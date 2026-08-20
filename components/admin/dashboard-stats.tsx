import type {
  DashboardStats,
  RecentApplicationRow,
} from "@/lib/dashboard/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatCardProps = {
  title: string;
  value: string | number;
  description?: string;
};

function StatCard({ title, value, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-normal text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-mono text-3xl tracking-tight">{value}</p>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

type DashboardStatsProps = {
  stats: DashboardStats;
};

export function DashboardStats({ stats }: DashboardStatsProps) {
  const items = [
    {
      title: "Active Jobs",
      value: stats.activeJobs,
      description: "Published vacancies",
    },
    {
      title: "Total Candidates",
      value: stats.totalCandidates,
      description: "All applications",
    },
    {
      title: "Pending Review",
      value: stats.pendingReview,
      description: "AI reviewed or manual review",
    },
    {
      title: "Interviews",
      value: stats.interviews,
      description: "Scheduled or in progress",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          description={stat.description}
        />
      ))}
    </div>
  );
}
