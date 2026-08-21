import { z } from "zod";
import {
  jdGenerationInputSchema,
  jdGenerationOutputSchema,
} from "@/packages/shared/schemas/jd";
import { resolveReasoningModel } from "@/lib/ai/models";

const JD_SYSTEM_PROMPT = `You are a professional recruitment copywriter. Generate a job description for the provided role.

Return ONLY valid JSON with this schema:
{
  "description": string (2-4 sentences overview),
  "responsibilities": string (bullet-style lines separated by newlines, no markdown bullets required),
  "requirements": string (bullet-style lines separated by newlines),
  "requiredSkills": string[],
  "preferredSkills": string[]
}

Rules:
- Professional, inclusive language.
- Do not invent company-specific perks or salary.
- Skills should be concise (e.g. "Python", "React").
- No scoring weights or internal hiring criteria.`;

function requireGroqKey(): string {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not configured");
  return key;
}

export async function generateJobDescriptionWithAi(
  input: z.infer<typeof jdGenerationInputSchema>
): Promise<z.infer<typeof jdGenerationOutputSchema>> {
  const parsed = jdGenerationInputSchema.parse(input);
  const model = resolveReasoningModel(process.env.REASONING_MODEL);

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${requireGroqKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: JD_SYSTEM_PROMPT },
        {
          role: "user",
          content: JSON.stringify({
            title: parsed.title,
            jobType: parsed.jobType,
            requiredSkillsHint: parsed.requiredSkillsText,
            preferredSkillsHint: parsed.preferredSkillsText,
            additionalContext: parsed.additionalContext,
          }),
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Groq JD generation failed (${response.status}): ${body.slice(0, 300)}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Groq returned empty job description content");
  }

  return jdGenerationOutputSchema.parse(JSON.parse(content));
}
