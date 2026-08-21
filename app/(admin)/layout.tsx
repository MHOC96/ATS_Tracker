import { AdminHeader } from "@/components/admin/header";
import { AdminSidebar } from "@/components/admin/sidebar";
import { requireSessionUser } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireSessionUser();

  return (
    <div className="flex min-h-screen bg-void">
      <AdminSidebar userRole={user.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader user={user} />
        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          <div className="linear-page min-w-0 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
