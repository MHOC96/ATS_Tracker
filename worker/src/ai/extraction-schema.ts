import { Type, type Schema } from "@google/genai";

/** JSON schema for Gemini structured output (screening fields only). */
export const CANDIDATE_EXTRACTION_RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    fullName: { type: Type.STRING, nullable: true },
    email: { type: Type.STRING, nullable: true },
    phone: { type: Type.STRING, nullable: true },
    location: { type: Type.STRING, nullable: true },
    university: { type: Type.STRING, nullable: true },
    degree: { type: Type.STRING, nullable: true },
    gpa: { type: Type.NUMBER, nullable: true },
    yearsExperience: { type: Type.NUMBER, nullable: true },
    skills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          institution: { type: Type.STRING, nullable: true },
          degree: { type: Type.STRING, nullable: true },
          year: { type: Type.STRING, nullable: true },
        },
      },
    },
    experience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          company: { type: Type.STRING, nullable: true },
          title: { type: Type.STRING, nullable: true },
          duration: { type: Type.STRING, nullable: true },
        },
      },
    },
    certifications: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    projects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, nullable: true },
          description: { type: Type.STRING, nullable: true },
        },
      },
    },
    extractionConfidence: { type: Type.NUMBER, nullable: true },
  },
  required: ["skills", "education", "experience", "certifications", "projects"],
};

export const EXTRACTION_PROMPT_VERSION = "cv-extract-v2";

export const BASE_EXTRACTION_RULES = `You extract structured candidate data from a CV for recruitment screening.

Rules:
- Return JSON only.
- Do NOT invent information; use null for missing scalar fields.
- Use empty arrays when lists are empty.
- skills: concise skill names only (no long sentences).
- Prefer facts from the document; apply-form hints may fill missing name/email only when the CV omits them.
- extractionConfidence: 0-1 estimate of how readable and complete the CV was.`;
