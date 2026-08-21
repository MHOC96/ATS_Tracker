import { resolveReasoningModel, resolveVisionModel } from "./models.js";
import { getGeminiApiKeyCount } from "./ai/gemini-keys.js";

export const workerConfig = {
  visionModel: resolveVisionModel(process.env.VISION_MODEL),
  reasoningModel: resolveReasoningModel(process.env.REASONING_MODEL),
  groqApiKey: process.env.GROQ_API_KEY ?? "",
  geminiApiKeyCount: getGeminiApiKeyCount(),
  maxExtractionRetries: Number(process.env.MAX_AI_RETRIES ?? 2),
} as const;

export function assertGeminiConfigured(): void {
  if (workerConfig.geminiApiKeyCount === 0) {
    throw new Error(
      "GEMINI_API_KEY or GEMINI_API_KEYS is not configured for the worker"
    );
  }
}

export function requireGroqKey(): string {
  if (!workerConfig.groqApiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }
  return workerConfig.groqApiKey;
}
