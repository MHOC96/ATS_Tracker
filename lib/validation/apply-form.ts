import { z } from "zod";

export const publicApplySchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("A valid email is required"),
});

export const ALLOWED_CV_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export const MAX_CV_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export function validateCvFile(file: File): string | null {
  if (file.size === 0) return "A CV file is required";
  if (file.size > MAX_CV_FILE_SIZE_BYTES) return "CV file must be 10 MB or smaller";

  const mime = file.type || "application/octet-stream";
  const allowed =
    ALLOWED_CV_MIME_TYPES.includes(mime as (typeof ALLOWED_CV_MIME_TYPES)[number]) ||
    file.name.toLowerCase().endsWith(".pdf");

  if (!allowed) {
    return "Upload a PDF or image file (PNG, JPG, WEBP)";
  }

  return null;
}
