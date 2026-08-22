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

export function isGeminiRateLimitError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const lower = errorMessage(error).toLowerCase();
  return (
    lower.includes("429") ||
    lower.includes("quota") ||
    lower.includes("rate limit") ||
    lower.includes("resource exhausted") ||
    lower.includes("too many requests")
  );
}

/** Invalid/expired key, OAuth token passed as API key, etc. */
export function isGeminiAuthError(error: unknown): boolean {
  const lower = errorMessage(error).toLowerCase();
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
  const maxAttempts = apiKeys.length;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const { GoogleGenAI } = await import("@google/genai");
    const client = new GoogleGenAI({ apiKey: getCurrentGeminiApiKey() });

    try {
      return await operation(client);
    } catch (error) {
      lastError = error;
      const failedIndex = getCurrentGeminiKeyIndex() + 1;
      if (isGeminiAuthError(error)) {
        console.warn(
          `[gemini] auth failure on key ${failedIndex}/${apiKeys.length}: ${errorMessage(error).slice(0, 200)}`
        );
        if (rotateGeminiApiKey("auth")) continue;
      }
      if (isGeminiRateLimitError(error) && rotateGeminiApiKey("rate limit")) {
        continue;
      }
      throw error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Gemini request failed after rotating all API keys");
}
