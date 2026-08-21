import { NextResponse } from "next/server";
import { getSessionUser, type AppUser } from "@/lib/auth/session";

export function verifyWorkerApiSecret(request: Request): boolean {
  const secret = process.env.WORKER_API_SECRET;
  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function requireApiSessionUser(): Promise<AppUser | NextResponse> {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return user;
}

export async function requireApiRecruiterOrAdmin(): Promise<AppUser | NextResponse> {
  const result = await requireApiSessionUser();
  if (result instanceof NextResponse) return result;

  if (result.role === "REVIEWER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return result;
}

export async function requireApiAdmin(): Promise<AppUser | NextResponse> {
  const result = await requireApiSessionUser();
  if (result instanceof NextResponse) return result;

  if (result.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return result;
}
