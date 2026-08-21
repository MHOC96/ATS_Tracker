/** Groq replacement for deprecated llama-3.3-70b-versatile (shutdown 2026-08-16). */
export const DEFAULT_REASONING_MODEL = "openai/gpt-oss-120b";

const DEPRECATED_REASONING_MODELS: Record<string, string> = {
  "llama-3.3-70b-versatile": DEFAULT_REASONING_MODEL,
  "3.3-70b-versatile": DEFAULT_REASONING_MODEL,
  "llama3-70b-8192": DEFAULT_REASONING_MODEL,
  "llama-3.1-70b-versatile": DEFAULT_REASONING_MODEL,
};

/**
 * Resolve Groq reasoning model from env, normalizing deprecated or mistyped IDs.
 */
export function resolveReasoningModel(envValue?: string | null): string {
  const raw = envValue?.trim();
  if (!raw) return DEFAULT_REASONING_MODEL;

  const normalized = raw.toLowerCase();
  return DEPRECATED_REASONING_MODELS[normalized] ?? raw;
}
