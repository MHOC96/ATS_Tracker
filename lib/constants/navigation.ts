import {
  Briefcase,
  ClipboardList,
  LayoutDashboard,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

export const adminNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    description: "Overview and metrics",
  },
  {
    title: "Jobs",
    href: "/admin/jobs",
    icon: Briefcase,
    description: "Manage vacancies",
  },
  {
    title: "Candidates",
    href: "/admin/candidates",
    icon: Users,
    description: "Review applications",
  },
  {
    title: "Manual Review",
    href: "/admin/manual-review",
    icon: ClipboardList,
    description: "CVs needing human review",
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    description: "Google Drive and platform config",
  },
];
