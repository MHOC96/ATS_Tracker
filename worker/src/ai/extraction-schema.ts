import { SchemaType, type Schema } from "@google/generative-ai";

/** JSON schema for Gemini structured output (screening fields only). */
export const CANDIDATE_EXTRACTION_RESPONSE_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    fullName: { type: SchemaType.STRING, nullable: true },
    email: { type: SchemaType.STRING, nullable: true },
    phone: { type: SchemaType.STRING, nullable: true },
    location: { type: SchemaType.STRING, nullable: true },
    university: { type: SchemaType.STRING, nullable: true },
    degree: { type: SchemaType.STRING, nullable: true },
    gpa: { type: SchemaType.NUMBER, nullable: true },
    yearsExperience: { type: SchemaType.NUMBER, nullable: true },
    skills: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    education: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          institution: { type: SchemaType.STRING, nullable: true },
          degree: { type: SchemaType.STRING, nullable: true },
          year: { type: SchemaType.STRING, nullable: true },
        },
      },
    },
    experience: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          company: { type: SchemaType.STRING, nullable: true },
          title: { type: SchemaType.STRING, nullable: true },
          duration: { type: SchemaType.STRING, nullable: true },
        },
      },
    },
    certifications: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    projects: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING, nullable: true },
          description: { type: SchemaType.STRING, nullable: true },
        },
      },
    },
    extractionConfidence: { type: SchemaType.NUMBER, nullable: true },
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
