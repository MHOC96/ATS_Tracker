import { NextResponse } from "next/server";
import { getSessionUser, type AppUser } from "@/lib/auth/session";

type ApiAuthSuccess = { user: AppUser };
type ApiAuthFailure = { error: NextResponse };

export type ApiAuthResult = ApiAuthSuccess | ApiAuthFailure;

function unauthorized(): ApiAuthFailure {
  return {
    error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
  };
}

function forbidden(): ApiAuthFailure {
  return {
    error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
  };
}

export async function requireApiSession(): Promise<ApiAuthResult> {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  return { user };
}

export async function requireApiAdmin(): Promise<ApiAuthResult> {
  const result = await requireApiSession();
  if ("error" in result) return result;
  if (result.user.role !== "ADMIN") return forbidden();
  return result;
}

export async function requireApiRecruiterOrAdmin(): Promise<ApiAuthResult> {
  const result = await requireApiSession();
  if ("error" in result) return result;
  if (result.user.role === "REVIEWER") return forbidden();
  return result;
}
