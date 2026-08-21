"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { adminNavItems } from "@/lib/constants/navigation";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type AdminMobileNavProps = {
  userRole?: "ADMIN" | "RECRUITER" | "REVIEWER";
};

export function AdminMobileNav({ userRole }: AdminMobileNavProps) {
  const pathname = usePathname();

  const items =
    userRole === "ADMIN"
      ? adminNavItems
      : adminNavItems.filter((item) => item.href !== "/admin/settings");

  return (
    <Sheet>
      <SheetTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "min-h-11 min-w-11 lg:hidden"
        )}
      >
        <Menu className="size-5" />
        <span className="sr-only">Open navigation</span>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[min(18rem,85vw)] border-graphite bg-carbon p-0"
      >
        <SheetHeader className="border-b border-graphite px-5 py-4">
          <SheetTitle className="linear-mono text-[13px] text-paper">ATS Admin</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-0.5 p-3">
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
                <item.icon className="size-4 shrink-0" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
