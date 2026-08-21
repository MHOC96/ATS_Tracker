import { createAdminClient } from "../supabase.js";
import { uploadFileToDriveFolder } from "../google/drive.js";
import {
  deleteCvFromStaging,
  downloadCvFromStaging,
} from "../storage/cv-staging.js";

type PendingCvRow = {
  id: string;
  file_name: string;
  mime_type: string | null;
  storage_path: string | null;
  drive_folder_id: string | null;
  candidate_application_id: string;
};

export async function completeCvUploadToDrive(
  applicationId: string
): Promise<{ driveFileId: string; driveFileUrl: string } | null> {
  const supabase = createAdminClient();

  const { data: application, error: appError } = await supabase
    .from("candidate_applications")
    .select("id, drive_file_id, cv_file_id")
    .eq("id", applicationId)
    .single();

  if (appError || !application) {
    throw new Error(appError?.message ?? "Application not found");
  }

  if (application.drive_file_id) {
    return null;
  }

  const { data: cvFile, error: cvError } = await supabase
    .from("cv_files")
    .select(
      "id, file_name, mime_type, storage_path, drive_folder_id, candidate_application_id, storage_status"
    )
    .eq("candidate_application_id", applicationId)
    .maybeSingle();

  if (cvError || !cvFile) {
    throw new Error(cvError?.message ?? "CV file record not found");
  }

  const typedCv = cvFile as PendingCvRow & { storage_status: string };

  if (typedCv.storage_status !== "PENDING_UPLOAD") {
    throw new Error(`CV is not pending upload (status: ${typedCv.storage_status})`);
  }

  if (!typedCv.storage_path || !typedCv.drive_folder_id) {
    throw new Error("CV staging path or drive folder is missing");
  }

  const buffer = await downloadCvFromStaging(typedCv.storage_path);
  const mimeType = typedCv.mime_type || "application/pdf";

  const { driveFileId, driveFileUrl } = await uploadFileToDriveFolder(
    typedCv.drive_folder_id,
    typedCv.file_name,
    mimeType,
    buffer
  );

  await supabase
    .from("candidate_applications")
    .update({
      drive_file_id: driveFileId,
      drive_file_url: driveFileUrl,
    })
    .eq("id", applicationId);

  await supabase
    .from("cv_files")
    .update({
      drive_file_id: driveFileId,
      storage_status: "UPLOADED",
      storage_path: null,
    })
    .eq("id", typedCv.id);

  await deleteCvFromStaging(typedCv.storage_path);

  return {
    driveFileId,
    driveFileUrl: driveFileUrl ?? "",
  };
}
