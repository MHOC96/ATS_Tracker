/**
 * Validates in-app redirect paths to prevent open redirects.
 */
export function getSafeRedirectPath(
  value: string | null | undefined,
  fallback = "/admin"
): string {
  if (!value) return fallback;

  const path = value.trim();

  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) {
    return fallback;
  }

  if (path.includes(":") || path.includes("@")) {
    return fallback;
  }

  return path;
}
