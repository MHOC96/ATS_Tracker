"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavItems } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";

type AdminSidebarProps = {
  userRole?: "ADMIN" | "RECRUITER" | "REVIEWER";
};

export function AdminSidebar({ userRole }: AdminSidebarProps) {
  const pathname = usePathname();

  const items =
    userRole === "ADMIN"
      ? adminNavItems
      : adminNavItems.filter((item) => item.href !== "/admin/settings");

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:flex lg:flex-col">
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium tracking-tight text-foreground">
            ATS
          </span>
          <span className="rounded border border-foreground px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider">
            Admin
          </span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-4">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className="size-4 shrink-0" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <p className="text-xs text-muted-foreground">
          AI Recruitment Platform
        </p>
      </div>
    </aside>
  );
}
