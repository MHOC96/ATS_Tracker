import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getSessionUser } from "@/lib/auth/session";
import { buildGoogleAuthorizeUrl, isOAuthCredentialsConfigured } from "@/lib/google/oauth";

const OAUTH_STATE_COOKIE = "google_oauth_state";
const OAUTH_STATE_MAX_AGE = 600;

export async function GET(request: Request) {
  const user = await getSessionUser();
  const loginUrl = new URL("/login", request.url);
  const adminUrl = new URL("/admin", request.url);

  if (!user) {
    return NextResponse.redirect(loginUrl);
  }

  if (user.role !== "ADMIN") {
    return NextResponse.redirect(adminUrl);
  }

  if (!isOAuthCredentialsConfigured()) {
    return NextResponse.redirect(
      new URL("/admin/settings?google_error=missing_oauth_client", request.url)
    );
  }

  const { origin } = new URL(request.url);
  const state = randomBytes(32).toString("hex");
  const cookieStore = await cookies();

  cookieStore.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: OAUTH_STATE_MAX_AGE,
    path: "/api/google/callback",
  });

  const url = buildGoogleAuthorizeUrl(origin, state);

  return NextResponse.redirect(url);
}
