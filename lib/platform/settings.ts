import { createAdminClient } from "@/lib/supabase/admin";

export async function getPlatformSetting(key: string): Promise<string | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("platform_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (error) {
    console.error(`[platform_settings] read ${key}:`, error.message);
    return null;
  }

  return data?.value ?? null;
}

export async function setPlatformSetting(key: string, value: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("platform_settings").upsert({
    key,
    value,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(`Failed to save platform setting: ${error.message}`);
  }
}

export const PLATFORM_SETTING_KEYS = {
  googleRefreshToken: "google_oauth_refresh_token",
  googleConnectedEmail: "google_oauth_connected_email",
} as const;
