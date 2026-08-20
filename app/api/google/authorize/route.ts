import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { buildGoogleAuthorizeUrl, isOAuthCredentialsConfigured } from "@/lib/google/oauth";

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
  const url = buildGoogleAuthorizeUrl(origin);

  return NextResponse.redirect(url);
}
