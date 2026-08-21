"use server";

import { headers } from "next/headers";
import { createApplicationWithCv } from "@/lib/applications/process-application";
import { getPublishedJobForApply } from "@/lib/jobs/queries";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  checkRateLimit,
  getClientIp,
} from "@/lib/security/rate-limit";
import {
  publicApplySchema,
  validateCvFile,
  validatePdfBuffer,
} from "@/lib/validation/apply-form";

type ApplyResult =
  | { success: true; applicationId: string; jobTitle: string }
  | { success: false; error: string };

const APPLY_RATE_LIMIT = 8;
const APPLY_RATE_WINDOW_MS = 15 * 60 * 1000;

export async function applyToJobBySlug(
  slug: string,
  formData: FormData
): Promise<ApplyResult> {
  try {
    const headersList = await headers();
    const ip = getClientIp(
      new Request("http://local", {
        headers: headersList,
      })
    );
    const rate = checkRateLimit(
      `apply:${ip}`,
      APPLY_RATE_LIMIT,
      APPLY_RATE_WINDOW_MS
    );
    if (!rate.allowed) {
      return {
        success: false,
        error: `Too many applications. Try again in ${rate.retryAfterSeconds} seconds.`,
      };
    }

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

    const emailRate = checkRateLimit(
      `apply-email:${parsed.data.email.toLowerCase()}`,
      APPLY_RATE_LIMIT,
      APPLY_RATE_WINDOW_MS
    );
    if (!emailRate.allowed) {
      return {
        success: false,
        error: "Too many applications from this email. Please try again later.",
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
    const pdfError = validatePdfBuffer(buffer);
    if (pdfError) {
      return { success: false, error: pdfError };
    }

    const supabase = createAdminClient();

    const result = await createApplicationWithCv(
      supabase,
      job.id,
      parsed.data.fullName,
      parsed.data.email,
      {
        name: file.name,
        type: "application/pdf",
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
