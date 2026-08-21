import { NextResponse } from "next/server";
import {
  createOAuthState,
  GOOGLE_OAUTH_STATE_COOKIE,
} from "@/lib/auth/oauth-state";
import { getSessionUser } from "@/lib/auth/session";
import {
  buildGoogleAuthorizeUrl,
  isOAuthCredentialsConfigured,
} from "@/lib/google/oauth";

const OAUTH_STATE_MAX_AGE_SECONDS = 600;

export async function GET(request: Request) {
  const user = await getSessionUser();
  const loginUrl = new URL("/login", request.url);
  const adminUrl = new URL("/admin", request.url);
  const settingsUrl = new URL("/admin/settings", request.url);

  if (!user) {
    loginUrl.searchParams.set("redirect", "/admin/settings");
    return NextResponse.redirect(loginUrl);
  }

  if (user.role !== "ADMIN") {
    return NextResponse.redirect(adminUrl);
  }

  if (!isOAuthCredentialsConfigured()) {
    settingsUrl.searchParams.set("google_error", "missing_oauth_client");
    return NextResponse.redirect(settingsUrl);
  }

  const { origin } = new URL(request.url);
  const state = createOAuthState();
  const authorizeUrl = buildGoogleAuthorizeUrl(origin, state);

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: OAUTH_STATE_MAX_AGE_SECONDS,
    path: "/",
  });

  return response;
}
