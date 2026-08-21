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

export function getGeminiKeyFormat(): "auth" | "standard" | "unknown" | "none" {
  if (apiKeys.length === 0) return "none";
  const key = apiKeys[0];
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

export function rotateGeminiApiKey(): boolean {
  if (apiKeys.length <= 1) return false;
  currentIndex = (currentIndex + 1) % apiKeys.length;
  console.warn(
    `[gemini] rotated to API key index ${currentIndex + 1}/${apiKeys.length}`
  );
  return true;
}

export function isGeminiRateLimitError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const message =
    error instanceof Error
      ? error.message
      : String((error as { message?: string }).message ?? error);

  const lower = message.toLowerCase();
  return (
    lower.includes("429") ||
    lower.includes("quota") ||
    lower.includes("rate limit") ||
    lower.includes("resource exhausted") ||
    lower.includes("too many requests")
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
      if (isGeminiRateLimitError(error) && rotateGeminiApiKey()) {
        continue;
      }
      throw error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Gemini request failed after rotating all API keys");
}
