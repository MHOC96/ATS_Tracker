import { GoogleGenerativeAI } from "@google/generative-ai";
import { requireGeminiKey, workerConfig } from "../config.js";
import {
  candidateExtractionSchema,
  type CandidateExtraction,
} from "../schemas.js";

const EXTRACTION_PROMPT = `You are a CV extraction assistant. Extract structured candidate information from the attached CV document.

Rules:
- Return ONLY valid JSON matching the schema below.
- Do NOT invent information. Use null for missing fields.
- Use empty arrays when no items exist.
- fullName, email, phone, location, university, degree use camelCase keys.
- yearsExperience and gpa are numbers or null.
- skills is an array of strings.

Schema:
{
  "fullName": string | null,
  "email": string | null,
  "phone": string | null,
  "location": string | null,
  "university": string | null,
  "degree": string | null,
  "gpa": number | null,
  "yearsExperience": number | null,
  "skills": string[],
  "education": object[],
  "experience": object[],
  "certifications": object[],
  "projects": object[]
}`;

function parseJsonResponse(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const payload = fenced?.[1]?.trim() ?? trimmed;
  return JSON.parse(payload);
}

export async function extractCandidateFromCv(
  buffer: Buffer,
  mimeType: string
): Promise<{ data: CandidateExtraction; raw: unknown }> {
  const genAI = new GoogleGenerativeAI(requireGeminiKey());
  const model = genAI.getGenerativeModel({
    model: workerConfig.visionModel,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1,
    },
  });

  const result = await model.generateContent([
    { text: EXTRACTION_PROMPT },
    {
      inlineData: {
        mimeType,
        data: buffer.toString("base64"),
      },
    },
  ]);

  const text = result.response.text();
  const raw = parseJsonResponse(text);
  const data = candidateExtractionSchema.parse(raw);

  return { data, raw };
}
