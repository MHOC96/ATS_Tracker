import {
  type GoogleGenAI,
  type Part,
  createPartFromBase64,
  createPartFromText,
} from "@google/genai";
import { workerConfig } from "../config.js";
import {
  candidateExtractionSchema,
  type CandidateExtraction,
} from "../schemas.js";
import {
  BASE_EXTRACTION_RULES,
  CANDIDATE_EXTRACTION_RESPONSE_SCHEMA,
  EXTRACTION_PROMPT_VERSION,
} from "./extraction-schema.js";
import { withGeminiKeyRotation } from "./gemini-keys.js";
import type { ApplyFormHints } from "./normalize-extraction.js";
import { mergeApplyFormHints } from "./normalize-extraction.js";

export type ExtractionMethod = "pdf_text" | "vision" | "correction";

export type ExtractionResult = {
  data: CandidateExtraction;
  raw: unknown;
  method: ExtractionMethod;
  promptVersion: string;
  usageMetadata?: Record<string, unknown>;
};

type ExtractionOptions = {
  hints?: ApplyFormHints | null;
  correctionHint?: string | null;
  previousJson?: Record<string, unknown> | null;
};

function parseJsonResponse(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const payload = fenced?.[1]?.trim() ?? trimmed;
  return JSON.parse(payload);
}

function hintsBlock(hints?: ApplyFormHints | null): string {
  if (!hints?.fullName && !hints?.email) return "";
  return `\nApply-form hints (use only if missing on CV): ${JSON.stringify(hints)}`;
}

function buildGenerationConfig() {
  return {
    responseMimeType: "application/json",
    responseSchema: CANDIDATE_EXTRACTION_RESPONSE_SCHEMA,
    temperature: 0.1,
  };
}

async function runGeminiJson(client: GoogleGenAI, parts: Part[]) {
  const response = await client.models.generateContent({
    model: workerConfig.visionModel,
    contents: [{ role: "user", parts }],
    config: buildGenerationConfig(),
  });

  const text = response.text ?? "";
  const raw = parseJsonResponse(text);
  const usageMetadata = response.usageMetadata as
    | Record<string, unknown>
    | undefined;

  return { raw, usageMetadata };
}

export async function extractCandidateFromCvText(
  cvText: string,
  options: ExtractionOptions = {}
): Promise<ExtractionResult> {
  const prompt = `${BASE_EXTRACTION_RULES}

Extract from this CV text:${hintsBlock(options.hints)}

CV TEXT:
${cvText}`;

  const { raw, usageMetadata } = await withGeminiKeyRotation((client) =>
    runGeminiJson(client, [createPartFromText(prompt)])
  );

  const parsed = candidateExtractionSchema.parse(raw);
  const data = mergeApplyFormHints(parsed, options.hints);

  return {
    data,
    raw,
    method: "pdf_text",
    promptVersion: EXTRACTION_PROMPT_VERSION,
    usageMetadata,
  };
}

export async function extractCandidateFromCvVision(
  buffer: Buffer,
  mimeType: string,
  options: ExtractionOptions = {}
): Promise<ExtractionResult> {
  const prompt = `${BASE_EXTRACTION_RULES}

Extract from the attached CV document.${hintsBlock(options.hints)}`;

  const { raw, usageMetadata } = await withGeminiKeyRotation((client) =>
    runGeminiJson(client, [
      createPartFromText(prompt),
      createPartFromBase64(buffer.toString("base64"), mimeType),
    ])
  );

  const parsed = candidateExtractionSchema.parse(raw);
  const data = mergeApplyFormHints(parsed, options.hints);

  return {
    data,
    raw,
    method: "vision",
    promptVersion: EXTRACTION_PROMPT_VERSION,
    usageMetadata,
  };
}

export async function correctCandidateExtractionJson(
  previousJson: Record<string, unknown>,
  validationError: string,
  options: ExtractionOptions = {}
): Promise<ExtractionResult> {
  const prompt = `${BASE_EXTRACTION_RULES}

Fix the JSON below. Validation failed: ${validationError}
Return corrected JSON only. Do not invent fields.${hintsBlock(options.hints)}

PREVIOUS JSON:
${JSON.stringify(previousJson)}`;

  const { raw, usageMetadata } = await withGeminiKeyRotation((client) =>
    runGeminiJson(client, [createPartFromText(prompt)])
  );

  const parsed = candidateExtractionSchema.parse(raw);
  const data = mergeApplyFormHints(parsed, options.hints);

  return {
    data,
    raw,
    method: "correction",
    promptVersion: EXTRACTION_PROMPT_VERSION,
    usageMetadata,
  };
}

export async function extractCandidateFromCv(
  buffer: Buffer,
  mimeType: string,
  options: ExtractionOptions & {
    preparedText?: string | null;
    useVision?: boolean;
  } = {}
): Promise<ExtractionResult> {
  if (options.correctionHint && options.previousJson) {
    return correctCandidateExtractionJson(
      options.previousJson,
      options.correctionHint,
      options
    );
  }

  if (options.preparedText && !options.useVision) {
    return extractCandidateFromCvText(options.preparedText, options);
  }

  return extractCandidateFromCvVision(buffer, mimeType, options);
}
