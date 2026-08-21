"use server";

import { createApplicationWithCv } from "@/lib/applications/process-application";
import { getPublishedJobForApply } from "@/lib/jobs/queries";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  publicApplySchema,
  validateCvFile,
} from "@/lib/validation/apply-form";

type ApplyResult =
  | { success: true; applicationId: string; jobTitle: string }
  | { success: false; error: string };

export async function applyToJobBySlug(
  slug: string,
  formData: FormData
): Promise<ApplyResult> {
  try {
    const job = await getPublishedJobForApply(slug);

    if (!job) {
      return { success: false, error: "Job not found or no longer open" };
    }

    const parsed = publicApplySchema.safeParse({
      fullName: (formData.get("fullName") as string | null)?.trim(),
      email: (formData.get("email") as string | null)?.trim(),
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid application details",
      };
    }

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return { success: false, error: "A CV file is required" };
    }

    const fileError = validateCvFile(file);
    if (fileError) {
      return { success: false, error: fileError };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const supabase = createAdminClient();

    const result = await createApplicationWithCv(
      supabase,
      job.id,
      parsed.data.fullName,
      parsed.data.email,
      {
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        buffer,
      },
      job
    );

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to submit application",
    };
  }
}
