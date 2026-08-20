import {
  getDriveClient,
  isDriveFullyConfigured,
} from "@/lib/google/oauth";

export async function isDriveConfigured(): Promise<boolean> {
  return isDriveFullyConfigured();
}

export async function createDriveFolder(name: string, parentId: string) {
  const drive = await getDriveClient();
  const response = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    },
    fields: "id",
    supportsAllDrives: true,
  });

  if (!response.data.id) {
    throw new Error(`Failed to create Drive folder: ${name}`);
  }

  return response.data.id;
}

export type JobDriveFolders = {
  incomingFolderId: string;
  manualReviewFolderId: string;
  archiveFolderId: string;
};

export async function createJobDriveFolders(jobSlug: string): Promise<JobDriveFolders> {
  const incomingRoot = process.env.GOOGLE_DRIVE_INCOMING_ROOT_ID!;
  const manualRoot = process.env.GOOGLE_DRIVE_MANUAL_REVIEW_ROOT_ID!;
  const archiveRoot = process.env.GOOGLE_DRIVE_ARCHIVE_ROOT_ID!;

  const [incomingFolderId, manualReviewFolderId, archiveFolderId] = await Promise.all([
    createDriveFolder(jobSlug, incomingRoot),
    createDriveFolder(jobSlug, manualRoot),
    createDriveFolder(jobSlug, archiveRoot),
  ]);

  return { incomingFolderId, manualReviewFolderId, archiveFolderId };
}

export async function uploadFileToDriveFolder(
  folderId: string,
  fileName: string,
  mimeType: string,
  buffer: Buffer
) {
  const drive = await getDriveClient();
  const { Readable } = await import("stream");

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: Readable.from(buffer),
    },
    fields: "id, webViewLink",
    supportsAllDrives: true,
  });

  if (!response.data.id) {
    throw new Error("Failed to upload file to Google Drive");
  }

  return {
    driveFileId: response.data.id,
    driveFileUrl: response.data.webViewLink ?? null,
  };
}
