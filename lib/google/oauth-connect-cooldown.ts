import {
  getPlatformSetting,
  PLATFORM_SETTING_KEYS,
  setPlatformSetting,
} from "@/lib/platform/settings";

const DEFAULT_COOLDOWN_SECONDS = 300;

export function getGoogleOAuthConnectCooldownMs(): number {
  const seconds = Number(process.env.GOOGLE_OAUTH_CONNECT_COOLDOWN_SECONDS);
  if (Number.isFinite(seconds) && seconds > 0) {
    return seconds * 1000;
  }
  return DEFAULT_COOLDOWN_SECONDS * 1000;
}

export async function getGoogleOAuthConnectCooldown(): Promise<{
  remainingSeconds: number;
}> {
  const until = await getPlatformSetting(
    PLATFORM_SETTING_KEYS.googleConnectCooldownUntil
  );

  if (!until) {
    return { remainingSeconds: 0 };
  }

  const remainingMs = new Date(until).getTime() - Date.now();
  return { remainingSeconds: Math.max(0, Math.ceil(remainingMs / 1000)) };
}

export async function startGoogleOAuthConnectCooldown(): Promise<void> {
  const until = new Date(Date.now() + getGoogleOAuthConnectCooldownMs()).toISOString();
  await setPlatformSetting(
    PLATFORM_SETTING_KEYS.googleConnectCooldownUntil,
    until
  );
}

export function formatCooldownRemaining(totalSeconds: number): string {
  if (totalSeconds <= 0) return "0s";

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) return `${seconds}s`;
  if (seconds === 0) return `${minutes}m`;
  return `${minutes}m ${seconds}s`;
}
