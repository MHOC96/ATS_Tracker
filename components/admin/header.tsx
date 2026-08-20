import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminMobileNav } from "@/components/admin/mobile-nav";
import { UserMenu } from "@/components/admin/user-menu";
import { buttonVariants } from "@/components/ui/button";
import type { AppUser } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

type AdminHeaderProps = {
  user: AppUser;
};

export function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-background px-3 sm:h-16 sm:gap-3 sm:px-4 lg:px-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <AdminMobileNav userRole={user.role} />
        <div className="min-w-0 lg:hidden">
          <span className="truncate font-mono text-sm font-medium">ATS Admin</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        {user.role === "ADMIN" && (
          <Link
            href="/admin/jobs/new"
            className={cn(buttonVariants({ size: "sm" }), "h-8 px-2.5 sm:h-9 sm:px-3")}
            title="Create job"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Create Job</span>
          </Link>
        )}
        <UserMenu user={user} />
      </div>
    </header>
  );
}
