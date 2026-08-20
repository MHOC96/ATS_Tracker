import { requireAdminUser } from "@/lib/auth/session";

export default async function AdminOnlyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminUser();
  return children;
}
