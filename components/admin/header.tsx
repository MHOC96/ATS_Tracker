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
    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-graphite bg-void/95 px-3 backdrop-blur-sm sm:px-4 lg:px-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <AdminMobileNav userRole={user.role} />
        <div className="min-w-0 lg:hidden">
          <span className="linear-mono text-[13px] text-paper">ATS Admin</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {user.role === "ADMIN" && (
          <Link
            href="/admin/jobs/new"
            className={cn(buttonVariants({ size: "sm" }), "min-h-10 sm:min-h-8")}
            title="Create job"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Create job</span>
          </Link>
        )}
        <UserMenu user={user} />
      </div>
    </header>
  );
}
