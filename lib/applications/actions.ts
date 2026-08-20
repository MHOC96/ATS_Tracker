"use server";

import { revalidatePath } from "next/cache";
import { createApplicationWithCv } from "@/lib/applications/process-application";
import { requireSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { validateCvFile } from "@/lib/validation/apply-form";

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

    const supabase = await createClient();
    const candidateName =
      (formData.get("fullName") as string | null)?.trim() || null;
    const candidateEmail =
      (formData.get("email") as string | null)?.trim() || null;

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await createApplicationWithCv(
      supabase,
      jobId,
      candidateName,
      candidateEmail,
      {
        name: file.name,
        type: file.type || "application/octet-stream",
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
