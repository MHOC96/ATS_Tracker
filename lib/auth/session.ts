import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AppUser = {
  id: string;
  email: string;
  fullName: string | null;
  role: "ADMIN" | "RECRUITER" | "REVIEWER";
};

export const getSessionUser = cache(async (): Promise<AppUser | null> => {
  const supabase = await createClient();

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  const user = session?.user;
  if (sessionError || !user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return {
      id: user.id,
      email: user.email ?? "",
      fullName: (user.user_metadata?.full_name as string | undefined) ?? null,
      role: "RECRUITER",
    };
  }

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role,
  };
});

export async function requireSessionUser(): Promise<AppUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdminUser(): Promise<AppUser> {
  const user = await requireSessionUser();
  if (user.role !== "ADMIN") redirect("/admin");
  return user;
}
