/**
 * Build a Cal.com booking URL with guest fields pre-filled.
 * @see https://cal.com/docs/core-features/bookings/prefill-booking-form
 */
export function buildCalComBookingUrl(
  baseUrl: string,
  params: {
    name: string;
    email: string;
    notes?: string;
  }
): string {
  const trimmed = baseUrl.trim().replace(/\/$/, "");
  const url = new URL(trimmed);

  url.searchParams.set("name", params.name);
  url.searchParams.set("email", params.email);

  if (params.notes?.trim()) {
    url.searchParams.set("notes", params.notes.trim());
  }

  return url.toString();
}

export async function resolveCalComBookingBaseUrl(): Promise<string | null> {
  const fromEnv = process.env.CALCOM_BOOKING_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const { getPlatformSetting, PLATFORM_SETTING_KEYS } = await import(
    "@/lib/platform/settings"
  );
  const fromDb = await getPlatformSetting(
    PLATFORM_SETTING_KEYS.calComBookingUrl
  );
  return fromDb?.trim().replace(/\/$/, "") ?? null;
}
