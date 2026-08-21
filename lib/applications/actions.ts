"use server";

import { revalidatePath } from "next/cache";
import { createApplicationWithCv } from "@/lib/applications/process-application";
import { requireSessionUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateCvFile, validatePdfBuffer } from "@/lib/validation/apply-form";

type UploadResult =
  | { success: true; applicationId: string }
  | { success: false; error: string };

export async function uploadCvForJob(
  jobId: string,
  formData: FormData
): Promise<UploadResult> {
  try {
    const user = await requireSessionUser();

    if (user.role === "REVIEWER") {
      return { success: false, error: "Reviewers cannot upload CVs" };
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

    const candidateName =
      (formData.get("fullName") as string | null)?.trim() || null;
    const candidateEmail =
      (formData.get("email") as string | null)?.trim() || null;

    const supabase = createAdminClient();
    const result = await createApplicationWithCv(
      supabase,
      jobId,
      candidateName,
      candidateEmail,
      {
        name: file.name,
        type: "application/pdf",
        size: file.size,
        buffer,
      }
    );

    if (result.success) {
      revalidatePath(`/admin/jobs/${jobId}`);
      revalidatePath("/admin/candidates");
      return { success: true, applicationId: result.applicationId };
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload CV",
    };
  }
}
