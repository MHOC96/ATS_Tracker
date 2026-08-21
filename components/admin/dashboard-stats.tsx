import type {
  DashboardStats,
} from "@/lib/dashboard/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatCardProps = {
  title: string;
  value: string | number;
  description?: string;
};

function StatCard({ title, value, description }: StatCardProps) {
  return (
    <Card size="sm" className="bg-obsidian shadow-none border border-graphite">
      <CardHeader className="pb-1">
        <CardTitle className="text-[13px] font-normal text-fog">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center font-mono text-[32px] font-[510] leading-none tracking-tight text-paper sm:text-[40px] lg:text-[48px]">
          {value}
        </p>
        {description && (
          <p className="mt-1 text-[12px] text-fog">{description}</p>
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
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
