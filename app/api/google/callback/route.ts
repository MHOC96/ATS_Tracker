import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { google } from "googleapis";
import { getSessionUser } from "@/lib/auth/session";
import { GOOGLE_OAUTH_STATE_COOKIE } from "@/lib/auth/oauth-state";
import {
  createOAuth2Client,
  getOAuthRedirectUri,
  invalidateGoogleRefreshTokenCache,
} from "@/lib/google/oauth";
import {
  getPlatformSetting,
  PLATFORM_SETTING_KEYS,
  setPlatformSetting,
} from "@/lib/platform/settings";

function redirectToSettings(
  origin: string,
  params: Record<string, string>
): NextResponse {
  const url = new URL("/admin/settings", origin);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  const response = NextResponse.redirect(url);
  response.cookies.delete(GOOGLE_OAUTH_STATE_COOKIE);
  return response;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const stateParam = searchParams.get("state");

  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("redirect", "/admin/settings");
    return NextResponse.redirect(loginUrl);
  }

  const cookieStore = await cookies();
  const stateCookie = cookieStore.get(GOOGLE_OAUTH_STATE_COOKIE)?.value;

  if (!stateCookie || !stateParam || stateCookie !== stateParam) {
    return redirectToSettings(origin, { google_error: "invalid_oauth_state" });
  }

  if (error) {
    return redirectToSettings(origin, { google_error: error });
  }

  if (!code) {
    return redirectToSettings(origin, { google_error: "missing_code" });
  }

  try {
    const redirectUri = getOAuthRedirectUri(origin);
    const oauth2 = createOAuth2Client(redirectUri);
    const { tokens } = await oauth2.getToken(code);

    if (tokens.refresh_token) {
      await setPlatformSetting(
        PLATFORM_SETTING_KEYS.googleRefreshToken,
        tokens.refresh_token
      );
      invalidateGoogleRefreshTokenCache();
    } else {
      const existing = await getPlatformSetting(
        PLATFORM_SETTING_KEYS.googleRefreshToken
      );
      if (!existing && !process.env.GOOGLE_OAUTH_REFRESH_TOKEN) {
        return redirectToSettings(origin, { google_error: "no_refresh_token" });
      }
    }

    if (tokens.access_token) {
      oauth2.setCredentials(tokens);
      try {
        const oauth2Api = google.oauth2({ version: "v2", auth: oauth2 });
        const profile = await oauth2Api.userinfo.get();
        if (profile.data.email) {
          await setPlatformSetting(
            PLATFORM_SETTING_KEYS.googleConnectedEmail,
            profile.data.email
          );
        }
      } catch {
        // Email is optional — refresh token is what matters for Drive
      }
    }

    return redirectToSettings(origin, { google_connected: "1" });
  } catch (callbackError) {
    const message =
      callbackError instanceof Error ? callbackError.message : "oauth_failed";
    return redirectToSettings(origin, { google_error: message });
  }
}
