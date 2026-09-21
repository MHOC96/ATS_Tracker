import { Readable } from "stream";
import { getDriveClient } from "./oauth.js";

function isDriveAuthError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes("invalid authentication credentials") ||
    message.includes("invalid_grant") ||
    message.includes("insufficient authentication scopes") ||
    message.includes("insufficient permission")
  );
}

function formatDriveError(error: unknown): Error {
  if (isDriveAuthError(error)) {
    return new Error(
      "Google Drive authentication failed. In Admin → Settings, reconnect Google Drive, then re-upload or re-run screening. " +
        "If using Railway, ensure the worker uses the same OAuth client and refresh token as your app (avoid a stale GOOGLE_OAUTH_REFRESH_TOKEN in Railway env)."
    );
  }
  return error instanceof Error ? error : new Error(String(error));
}

async function withDriveClient<T>(fn: (drive: Awaited<ReturnType<typeof getDriveClient>>) => Promise<T>) {
  try {
    const drive = await getDriveClient();
    return await fn(drive);
  } catch (error) {
    throw formatDriveError(error);
  }
}

export async function uploadFileToDriveFolder(
  folderId: string,
  fileName: string,
  mimeType: string,
  buffer: Buffer
) {
  return withDriveClient(async (drive) => {
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
  });
}

export async function downloadDriveFile(fileId: string) {
  return withDriveClient(async (drive) => {
  const meta = await drive.files.get({
    fileId,
    fields: "mimeType, name",
    supportsAllDrives: true,
  });

  const response = await drive.files.get(
    {
      fileId,
      alt: "media",
      supportsAllDrives: true,
    },
    { responseType: "arraybuffer" }
  );

  return {
    buffer: Buffer.from(response.data as ArrayBuffer),
    mimeType: meta.data.mimeType ?? "application/octet-stream",
    fileName: meta.data.name ?? "cv",
  };
  });
}

export async function moveDriveFile(
  fileId: string,
  fromFolderId: string,
  toFolderId: string
) {
  return withDriveClient(async (drive) => {
  await drive.files.update({
    fileId,
    addParents: toFolderId,
    removeParents: fromFolderId,
    fields: "id, parents",
    supportsAllDrives: true,
  });
  });
}
