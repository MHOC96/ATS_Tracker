import { createAdminClient } from "../supabase.js";

export const CV_STAGING_BUCKET = "cv-staging";

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
