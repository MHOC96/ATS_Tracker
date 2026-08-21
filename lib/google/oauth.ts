import { google } from "googleapis";
import {
  getPlatformSetting,
  PLATFORM_SETTING_KEYS,
} from "@/lib/platform/settings";

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive";
const USERINFO_EMAIL_SCOPE = "https://www.googleapis.com/auth/userinfo.email";

const REFRESH_TOKEN_CACHE_TTL_MS = 5 * 60 * 1000;

let cachedRefreshToken: string | null | undefined;
let refreshTokenCacheExpiresAt = 0;

export const GOOGLE_OAUTH_SCOPES = [DRIVE_SCOPE, USERINFO_EMAIL_SCOPE];

export function getOAuthRedirectUri(origin: string) {
  const configured = process.env.GOOGLE_OAUTH_REDIRECT_URI;
  if (configured) return configured;
  return `${origin}/api/google/callback`;
}

export function isOAuthCredentialsConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_OAUTH_CLIENT_ID && process.env.GOOGLE_OAUTH_CLIENT_SECRET
  );
}

export function invalidateGoogleRefreshTokenCache(): void {
  cachedRefreshToken = undefined;
  refreshTokenCacheExpiresAt = 0;
}

export async function getGoogleRefreshToken(): Promise<string | null> {
  if (process.env.GOOGLE_OAUTH_REFRESH_TOKEN) {
    return process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
  }

  const now = Date.now();
  if (cachedRefreshToken !== undefined && now < refreshTokenCacheExpiresAt) {
    return cachedRefreshToken;
  }

  cachedRefreshToken = await getPlatformSetting(
    PLATFORM_SETTING_KEYS.googleRefreshToken
  );
  refreshTokenCacheExpiresAt = now + REFRESH_TOKEN_CACHE_TTL_MS;

  return cachedRefreshToken;
}

export async function isOAuthDriveAuthorized(): Promise<boolean> {
  const token = await getGoogleRefreshToken();
  return Boolean(token);
}

export function isOAuthDriveConfigured(): boolean {
  return isOAuthCredentialsConfigured();
}

export async function isDriveFullyConfigured(): Promise<boolean> {
  return (
    isOAuthCredentialsConfigured() &&
    (await isOAuthDriveAuthorized()) &&
    Boolean(
      process.env.GOOGLE_DRIVE_INCOMING_ROOT_ID &&
        process.env.GOOGLE_DRIVE_MANUAL_REVIEW_ROOT_ID &&
        process.env.GOOGLE_DRIVE_ARCHIVE_ROOT_ID
    )
  );
}

export function createOAuth2Client(redirectUri?: string) {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET in .env"
    );
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export async function getAuthorizedOAuth2Client() {
  const refreshToken = await getGoogleRefreshToken();

  if (!refreshToken) {
    throw new Error(
      "Google Drive is not connected. Go to Admin → Settings and connect your Google account."
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

export function buildGoogleAuthorizeUrl(origin: string, state?: string) {
  const redirectUri = getOAuthRedirectUri(origin);
  const oauth2 = createOAuth2Client(redirectUri);

  return oauth2.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GOOGLE_OAUTH_SCOPES,
    include_granted_scopes: true,
    ...(state ? { state } : {}),
  });
}
