import { getDriveClient } from "./oauth.js";

export async function downloadDriveFile(fileId: string) {
  const drive = await getDriveClient();

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
}

export async function moveDriveFile(
  fileId: string,
  fromFolderId: string,
  toFolderId: string
) {
  const drive = await getDriveClient();

  await drive.files.update({
    fileId,
    addParents: toFolderId,
    removeParents: fromFolderId,
    fields: "id, parents",
    supportsAllDrives: true,
  });
}
