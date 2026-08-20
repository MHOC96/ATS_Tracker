import { google } from "googleapis";
import { createAdminClient } from "../supabase.js";

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive";
const REFRESH_TOKEN_KEY = "google_oauth_refresh_token";

export async function getGoogleRefreshToken(): Promise<string | null> {
  if (process.env.GOOGLE_OAUTH_REFRESH_TOKEN) {
    return process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
  }

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("platform_settings")
    .select("value")
    .eq("key", REFRESH_TOKEN_KEY)
    .maybeSingle();

  return data?.value ?? null;
}

export function createOAuth2Client() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET in .env"
    );
  }

  return new google.auth.OAuth2(clientId, clientSecret);
}

export async function getAuthorizedOAuth2Client() {
  const refreshToken = await getGoogleRefreshToken();

  if (!refreshToken) {
    throw new Error(
      "Google Drive is not connected. Connect Google in Admin → Settings or set GOOGLE_OAUTH_REFRESH_TOKEN."
    );
  }

  const oauth2 = createOAuth2Client();
  oauth2.setCredentials({
    refresh_token: refreshToken,
    scope: DRIVE_SCOPE,
  });

  return oauth2;
}

export async function getDriveClient() {
  const auth = await getAuthorizedOAuth2Client();
  return google.drive({ version: "v3", auth });
}
