import { randomBytes } from "crypto";

export const GOOGLE_OAUTH_STATE_COOKIE = "google_oauth_state";

export function createOAuthState(): string {
  return randomBytes(32).toString("hex");
}
