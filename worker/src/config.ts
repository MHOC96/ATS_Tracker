import { resolveReasoningModel } from "./models.js";

export const workerConfig = {
  visionModel: process.env.VISION_MODEL ?? "gemini-2.0-flash",
  reasoningModel: resolveReasoningModel(process.env.REASONING_MODEL),
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  groqApiKey: process.env.GROQ_API_KEY ?? "",
  maxExtractionRetries: 1,
} as const;

export function requireGeminiKey(): string {
  if (!workerConfig.geminiApiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return workerConfig.geminiApiKey;
}

export function requireGroqKey(): string {
  if (!workerConfig.groqApiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }
  return workerConfig.groqApiKey;
}
