import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { google } from "googleapis";
import { getSessionUser } from "@/lib/auth/session";
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
import { startGoogleOAuthConnectCooldown } from "@/lib/google/oauth-connect-cooldown";

const OAUTH_STATE_COOKIE = "google_oauth_state";
const ALLOWED_GOOGLE_ERRORS = new Set([
  "access_denied",
  "missing_code",
  "invalid_state",
  "unauthorized",
  "no_refresh_token",
  "missing_oauth_client",
  "oauth_failed",
]);

function settingsRedirect(origin: string, params: Record<string, string>) {
  const url = new URL("/admin/settings", origin);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state");

  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return settingsRedirect(origin, { google_error: "unauthorized" });
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get(OAUTH_STATE_COOKIE)?.value;
  cookieStore.delete(OAUTH_STATE_COOKIE);

  if (!state || !storedState || state !== storedState) {
    await startGoogleOAuthConnectCooldown();
    return settingsRedirect(origin, { google_error: "invalid_state" });
  }

  if (error) {
    await startGoogleOAuthConnectCooldown();
    const safeError = ALLOWED_GOOGLE_ERRORS.has(error) ? error : "oauth_failed";
    return settingsRedirect(origin, { google_error: safeError });
  }

  if (!code) {
    await startGoogleOAuthConnectCooldown();
    return settingsRedirect(origin, { google_error: "missing_code" });
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
        await startGoogleOAuthConnectCooldown();
        return settingsRedirect(origin, { google_error: "no_refresh_token" });
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

    await startGoogleOAuthConnectCooldown();
    return settingsRedirect(origin, { google_connected: "1" });
  } catch {
    await startGoogleOAuthConnectCooldown();
    return settingsRedirect(origin, { google_error: "oauth_failed" });
  }
}
