import { requireGroqKey, workerConfig } from "../config.js";
import { auditOutputSchema, type AuditOutput } from "../schemas.js";
import type { CandidateExtraction } from "../schemas.js";

type ScoringCriterion = {
  id: string;
  name: string;
  description: string | null;
  weight: number;
  criteriaType: string;
  minimumValue: number | null;
  isMandatory: boolean;
};

type JobContext = {
  title: string;
  description: string | null;
  responsibilities: string | null;
  requirements: string | null;
  requiredSkills: string[];
  preferredSkills: string[];
};

type ScoringContext = {
  id: string;
  name: string;
  description: string | null;
  criteria: ScoringCriterion[];
};

const AUDITOR_SYSTEM_PROMPT = `You are a recruitment auditor. Compare the candidate profile against the job description and scoring model.

Return ONLY valid JSON with this schema:
{
  "finalScore": number (0-100),
  "recommendation": "STRONG_MATCH" | "MATCH" | "BORDERLINE" | "WEAK_MATCH",
  "matchedSkills": string[],
  "missingSkills": string[],
  "mandatoryFailures": string[],
  "reasoning": string (concise, auditable summary — no hidden chain-of-thought),
  "criterionScores": [
    {
      "criterionName": string,
      "score": number,
      "maximumScore": number,
      "reasoning": string
    }
  ]
}

Rules:
- Score each criterion in criterionScores using the provided scoring criteria names.
- Flag mandatory requirement failures explicitly in mandatoryFailures.
- Do not silently reject candidates; still provide a score when possible.
- Keep reasoning professional and concise.`;

export async function auditCandidateProfile(
  candidate: CandidateExtraction,
  job: JobContext,
  scoringModel: ScoringContext
): Promise<AuditOutput> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${requireGroqKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: workerConfig.reasoningModel,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: AUDITOR_SYSTEM_PROMPT },
        {
          role: "user",
          content: JSON.stringify({ candidate, job, scoringModel }),
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Groq audit failed (${response.status}): ${body.slice(0, 300)}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Groq audit returned empty content");
  }

  return auditOutputSchema.parse(JSON.parse(content));
}
