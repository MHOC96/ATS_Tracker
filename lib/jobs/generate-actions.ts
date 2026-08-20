"use server";

import { generateJobDescriptionWithAi } from "@/lib/ai/generate-jd";
import { requireAdminUser } from "@/lib/auth/session";
import { jdGenerationInputSchema } from "@/packages/shared/schemas/jd";
import type { z } from "zod";

type GenerateResult =
  | { success: true; data: Awaited<ReturnType<typeof generateJobDescriptionWithAi>> }
  | { success: false; error: string };

export async function generateJobDescription(
  input: z.infer<typeof jdGenerationInputSchema>
): Promise<GenerateResult> {
  try {
    await requireAdminUser();
    const parsed = jdGenerationInputSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input for JD generation",
      };
    }

    const data = await generateJobDescriptionWithAi(parsed.data);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate job description",
    };
  }
}
