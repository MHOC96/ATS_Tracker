import { createAdminClient } from "@/lib/supabase/admin";

export const CV_STAGING_BUCKET = "cv-staging";

export function buildCvStagingPath(applicationId: string, fileName: string): string {
  const safeName = fileName.replace(/[^\w.\-]+/g, "_");
  return `${applicationId}/${Date.now()}-${safeName}`;
}

export async function uploadCvToStaging(
  storagePath: string,
  buffer: Buffer,
  mimeType: string
): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase.storage
    .from(CV_STAGING_BUCKET)
    .upload(storagePath, buffer, {
      contentType: mimeType || "application/pdf",
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to stage CV upload: ${error.message}`);
  }
}

export async function downloadCvFromStaging(storagePath: string): Promise<Buffer> {
  const supabase = createAdminClient();

  const { data, error } = await supabase.storage
    .from(CV_STAGING_BUCKET)
    .download(storagePath);

  if (error || !data) {
    throw new Error(
      `Failed to download staged CV: ${error?.message ?? "missing file"}`
    );
  }

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function deleteCvFromStaging(storagePath: string): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase.storage
    .from(CV_STAGING_BUCKET)
    .remove([storagePath]);

  if (error) {
    console.warn(`[cv-staging] failed to delete ${storagePath}:`, error.message);
  }
}
