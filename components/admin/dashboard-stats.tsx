import Link from "next/link";
import {
  Briefcase,
  CalendarDays,
  ClipboardCheck,
  Users,
} from "lucide-react";
import type { DashboardStats } from "@/lib/dashboard/queries";
import { cn } from "@/lib/utils";

type StatItem = {
  title: string;
  value: number;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  iconClassName: string;
};

function StatCard({ title, value, description, href, icon: Icon, iconClassName }: StatItem) {
  return (
    <Link
      href={href}
      className={cn(
        "block rounded-xl bg-carbon p-5",
        "shadow-[rgb(35,37,42)_0px_0px_0px_1px_inset]",
        "transition-colors hover:bg-obsidian",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className={cn("size-4 shrink-0", iconClassName)} strokeWidth={1.75} />
        <span className="text-[13px] text-fog">{title}</span>
      </div>

      <p className="mt-4 font-mono text-[32px] font-[510] leading-none tracking-tight text-paper sm:text-[36px]">
        {value.toLocaleString()}
      </p>

      <p className="mt-2 text-[12px] leading-snug text-fog">{description}</p>
    </Link>
  );
}

type DashboardStatsProps = {
  stats: DashboardStats;
};

export function DashboardStats({ stats }: DashboardStatsProps) {
  const items: StatItem[] = [
    {
      title: "Active jobs",
      value: stats.activeJobs,
      description: "Open published roles",
      href: "/admin/jobs",
      icon: Briefcase,
      iconClassName: "text-acid-lime",
    },
    {
      title: "Total candidates",
      value: stats.totalCandidates,
      description: "All applications",
      href: "/admin/candidates",
      icon: Users,
      iconClassName: "text-iris-violet",
    },
    {
      title: "Pending review",
      value: stats.pendingReview,
      description: "Need a recruiter decision",
      href: "/admin/candidates",
      icon: ClipboardCheck,
      iconClassName: "text-signal-teal",
    },
    {
      title: "Interviews",
      value: stats.interviews,
      description: "In interview stage",
      href: "/admin/candidates",
      icon: CalendarDays,
      iconClassName: "text-pulse-green",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <StatCard key={item.title} {...item} />
      ))}
    </div>
  );
}
