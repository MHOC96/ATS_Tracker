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
    <aside className="hidden w-56 shrink-0 flex-col border-r border-graphite bg-carbon lg:flex">
      <div className="flex h-14 items-center border-b border-graphite px-5">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="linear-mono text-[13px] text-acid-lime">ATS</span>
          <span className="rounded border border-graphite px-1.5 py-0.5 linear-mono text-[10px] uppercase tracking-wider text-fog">
            Admin
          </span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-10 items-center gap-2.5 rounded-md px-3 py-2.5 text-[13px] transition-colors",
                isActive
                  ? "bg-white/5 font-[510] text-paper"
                  : "text-fog hover:bg-white/[0.03] hover:text-mist"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <span className="size-1.5 shrink-0 rounded-full bg-acid-lime" />
              )}
              <item.icon className="size-4 shrink-0 text-fog" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-graphite p-4">
        <p className="linear-caption">AI Recruitment Platform</p>
        <p className="mt-2 linear-mono text-[10px] text-fog/80">
          © {new Date().getFullYear()} mhoc
        </p>
      </div>
    </aside>
  );
}
