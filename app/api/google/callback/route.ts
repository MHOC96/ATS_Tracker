import { NextResponse } from "next/server";
import { google } from "googleapis";
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

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      `${origin}/admin/settings?google_error=${encodeURIComponent(error)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${origin}/admin/settings?google_error=missing_code`
    );
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
        return NextResponse.redirect(
          `${origin}/admin/settings?google_error=no_refresh_token`
        );
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

    return NextResponse.redirect(`${origin}/admin/settings?google_connected=1`);
  } catch (callbackError) {
    const message =
      callbackError instanceof Error ? callbackError.message : "oauth_failed";
    return NextResponse.redirect(
      `${origin}/admin/settings?google_error=${encodeURIComponent(message)}`
    );
  }
}
