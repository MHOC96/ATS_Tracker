import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminMobileNav } from "@/components/admin/mobile-nav";
import { UserMenu } from "@/components/admin/user-menu";
import { buttonVariants } from "@/components/ui/button";
import { requireSessionUser } from "@/lib/auth/session";

export async function AdminHeader() {
  const user = await requireSessionUser();

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-background px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <AdminMobileNav userRole={user.role} />
        <div className="lg:hidden">
          <span className="font-mono text-sm font-medium">ATS Admin</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {user.role === "ADMIN" && (
          <Link
            href="/admin/jobs/new"
            className={buttonVariants({ size: "sm" })}
          >
            <Plus className="size-4" />
            Create Job
          </Link>
        )}
        <UserMenu user={user} />
      </div>
    </header>
  );
}
