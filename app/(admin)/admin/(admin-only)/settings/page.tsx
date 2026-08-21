import { headers } from "next/headers";
import { CheckCircle2, XCircle } from "lucide-react";
import { GoogleConnectLink } from "@/components/settings/google-connect-link";
import { PageTitle } from "@/components/layout/page-title";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatCooldownRemaining,
  getGoogleOAuthConnectCooldown,
} from "@/lib/google/oauth-connect-cooldown";
import {
  getOAuthRedirectUri,
  isDriveFullyConfigured,
  isOAuthCredentialsConfigured,
  isOAuthDriveAuthorized,
} from "@/lib/google/oauth";
import { getPlatformSetting, PLATFORM_SETTING_KEYS } from "@/lib/platform/settings";

type SettingsPageProps = {
  searchParams: Promise<{
    google_connected?: string;
    google_error?: string;
    retry_after?: string;
  }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const params = await searchParams;
  const headersList = await headers();
  const host =
    headersList.get("x-forwarded-host") ?? headersList.get("host") ?? "localhost:3000";
  const protocol = headersList.get("x-forwarded-proto") ?? "http";
  const requestOrigin = `${protocol}://${host}`;
  const oauthRedirectUri = getOAuthRedirectUri(requestOrigin);

  const hasClientCredentials = isOAuthCredentialsConfigured();
  const connectedEmail = await getPlatformSetting(
    PLATFORM_SETTING_KEYS.googleConnectedEmail
  );
  const isConnected = await isOAuthDriveAuthorized();
  const driveReady = await isDriveFullyConfigured();
  const cooldown = await getGoogleOAuthConnectCooldown();
  const retryAfterParam = Number(params.retry_after);
  const initialRemainingSeconds = Math.max(
    cooldown.remainingSeconds,
    Number.isFinite(retryAfterParam) ? retryAfterParam : 0
  );

  const folderIdsConfigured = Boolean(
    process.env.GOOGLE_DRIVE_INCOMING_ROOT_ID &&
      process.env.GOOGLE_DRIVE_MANUAL_REVIEW_ROOT_ID &&
      process.env.GOOGLE_DRIVE_ARCHIVE_ROOT_ID
  );

  return (
    <div className="space-y-8">
      <PageTitle
        title="Settings"
        description="Connect Google Drive once — the app stores the refresh token automatically."
      />

      {params.google_connected === "1" && (
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-4 py-3 text-sm">
          <CheckCircle2 className="size-4 text-green-600" />
          Google Drive connected successfully.
        </div>
      )}

      {params.google_error && params.google_error !== "oauth_cooldown" && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <XCircle className="size-4" />
          Google connection failed: {params.google_error}
        </div>
      )}

      {params.google_error === "oauth_cooldown" && initialRemainingSeconds > 0 && (
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          <XCircle className="size-4 shrink-0" />
          Please wait{" "}
          <span className="font-mono text-foreground">
            {formatCooldownRemaining(initialRemainingSeconds)}
          </span>{" "}
          before connecting again.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="font-mono text-lg font-normal">
            Google Drive (OAuth)
          </CardTitle>
          <CardDescription>
            Uses your personal Gmail quota. Click connect to authorize Drive access.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              OAuth client in .env:{" "}
              <span className="font-mono text-foreground">
                {hasClientCredentials ? "configured" : "missing"}
              </span>
            </li>
            <li>
              OAuth redirect URI:{" "}
              <span className="break-all font-mono text-foreground">
                {oauthRedirectUri}
              </span>
            </li>
            <li>
              Google account connected:{" "}
              <span className="font-mono text-foreground">
                {isConnected
                  ? connectedEmail ?? "yes (email unknown)"
                  : "not connected"}
              </span>
            </li>
            <li>
              Folder IDs in .env:{" "}
              <span className="font-mono text-foreground">
                {folderIdsConfigured ? "configured" : "missing"}
              </span>
            </li>
            <li>
              Drive ready for publish/upload:{" "}
              <span className="font-mono text-foreground">
                {driveReady ? "yes" : "no"}
              </span>
            </li>
          </ul>

          {hasClientCredentials ? (
            <GoogleConnectLink
              label={
                isConnected ? "Reconnect Google Drive" : "Connect Google Drive"
              }
              initialRemainingSeconds={initialRemainingSeconds}
            />
          ) : (
            <p className="text-sm text-destructive">
              Add GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET to .env,
              then restart the dev server.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
