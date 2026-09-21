import type { GoogleGenAI } from "@google/genai";

function loadGeminiApiKeys(): string[] {
  const fromList = process.env.GEMINI_API_KEYS?.split(",")
    .map((key) => key.trim())
    .filter(Boolean);

  if (fromList && fromList.length > 0) {
    return fromList;
  }

  const single = process.env.GEMINI_API_KEY?.trim();
  return single ? [single] : [];
}

const apiKeys = loadGeminiApiKeys();
let currentIndex = 0;

export function getGeminiApiKeyCount(): number {
  return apiKeys.length;
}

export function getGeminiKeyFormat():
  | "auth"
  | "standard"
  | "unknown"
  | "none" {
  if (apiKeys.length === 0) return "none";
  const key = apiKeys[0];
  // Google AI Studio auth keys (new default, AQ.*). Legacy traffic keys use AIza.*
  if (key.startsWith("AQ.")) return "auth";
  if (key.startsWith("AIza")) return "standard";
  return "unknown";
}

export function getCurrentGeminiApiKey(): string {
  if (apiKeys.length === 0) {
    throw new Error(
      "Gemini is not configured. Set GEMINI_API_KEY or GEMINI_API_KEYS in .env"
    );
  }
  return apiKeys[currentIndex];
}

export function getCurrentGeminiKeyIndex(): number {
  return currentIndex;
}

export function resetGeminiApiKeyIndex(): void {
  currentIndex = 0;
}

export function rotateGeminiApiKey(reason?: string): boolean {
  if (apiKeys.length <= 1) return false;
  currentIndex = (currentIndex + 1) % apiKeys.length;
  console.warn(
    `[gemini] rotated to API key index ${currentIndex + 1}/${apiKeys.length}${reason ? ` (${reason})` : ""}`
  );
  return true;
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message?: string }).message ?? error);
  }
  return String(error ?? "");
}

function collectErrorText(error: unknown): string {
  const parts: string[] = [errorMessage(error)];

  if (typeof error === "object" && error !== null) {
    const status = (error as { status?: number | string }).status;
    if (status !== undefined) parts.push(String(status));

    const cause = (error as { cause?: unknown }).cause;
    if (cause) parts.push(errorMessage(cause));

    try {
      parts.push(JSON.stringify(error));
    } catch {
      // ignore
    }
  }

  return parts.join(" ").toLowerCase();
}

export function isGeminiRateLimitError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const lower = collectErrorText(error);
  return (
    lower.includes("429") ||
    lower.includes("quota") ||
    lower.includes("rate limit") ||
    lower.includes("resource exhausted") ||
    lower.includes("too many requests")
  );
}

/** Overload / capacity / gateway errors — safe to retry with backoff. */
export function isGeminiTransientError(error: unknown): boolean {
  if (isGeminiRateLimitError(error)) return true;

  const lower = collectErrorText(error);
  return (
    lower.includes("503") ||
    lower.includes("502") ||
    lower.includes("500") ||
    lower.includes("504") ||
    lower.includes("408") ||
    lower.includes("unavailable") ||
    lower.includes("high demand") ||
    lower.includes("overloaded") ||
    lower.includes("internal error") ||
    lower.includes("deadline exceeded") ||
    lower.includes("temporarily")
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function transientRetriesPerKey(): number {
  const n = Number(process.env.GEMINI_TRANSIENT_RETRIES ?? 4);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 4;
}

/** Invalid/expired key, OAuth token passed as API key, etc. */
export function isGeminiAuthError(error: unknown): boolean {
  const lower = collectErrorText(error);
  return (
    lower.includes("401") ||
    lower.includes("403") ||
    lower.includes("unauthenticated") ||
    lower.includes("invalid authentication") ||
    lower.includes("access_token_type_unsupported") ||
    lower.includes("api key not valid") ||
    lower.includes("api_key_invalid") ||
    lower.includes("permission denied")
  );
}

export async function withGeminiKeyRotation<T>(
  operation: (client: GoogleGenAI) => Promise<T>
): Promise<T> {
  if (apiKeys.length === 0) {
    throw new Error(
      "Gemini is not configured. Set GEMINI_API_KEY or GEMINI_API_KEYS in .env"
    );
  }

  let lastError: unknown;
  const startIndex = currentIndex;

  const maxTransientPerKey = transientRetriesPerKey();

  for (let attempt = 0; attempt < apiKeys.length; attempt++) {
    const keyIndex = (startIndex + attempt) % apiKeys.length;
    currentIndex = keyIndex;

    const { GoogleGenAI } = await import("@google/genai");
    const client = new GoogleGenAI({ apiKey: apiKeys[keyIndex] });
    const keyLabel = `${keyIndex + 1}/${apiKeys.length}`;

    for (let transientAttempt = 0; transientAttempt < maxTransientPerKey; transientAttempt++) {
      try {
        return await operation(client);
      } catch (error) {
        lastError = error;
        const isLastKey = attempt === apiKeys.length - 1;
        const isLastTransientAttempt = transientAttempt === maxTransientPerKey - 1;

        if (isGeminiAuthError(error)) {
          console.warn(
            `[gemini] auth failure on key ${keyLabel}: ${errorMessage(error).slice(0, 200)}`
          );
          break;
        }

        if (isGeminiTransientError(error)) {
          if (!isLastTransientAttempt) {
            const delayMs = Math.min(1500 * 2 ** transientAttempt, 12_000);
            console.warn(
              `[gemini] transient error on key ${keyLabel} (attempt ${transientAttempt + 1}/${maxTransientPerKey}): ${errorMessage(error).slice(0, 160)} — retry in ${delayMs}ms`
            );
            await sleep(delayMs);
            continue;
          }

          console.warn(
            `[gemini] transient error exhausted on key ${keyLabel}${!isLastKey ? ", rotating key" : ""}`
          );
          if (!isLastKey) break;
          continue;
        }

        throw error;
      }
    }
  }

  resetGeminiApiKeyIndex();

  throw lastError instanceof Error
    ? lastError
    : new Error("Gemini request failed after trying all API keys");
}
