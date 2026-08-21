import { z } from "zod";
import {
  ALLOWED_CV_MIME_TYPES,
  CV_FILE_ACCEPT,
  MAX_CV_FILE_SIZE_BYTES,
} from "@/packages/shared/schemas/cv";

export const publicApplySchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("A valid email is required"),
});

export { ALLOWED_CV_MIME_TYPES, CV_FILE_ACCEPT, MAX_CV_FILE_SIZE_BYTES };

export function validateCvFile(file: File): string | null {
  if (file.size === 0) return "A CV file is required";
  if (file.size > MAX_CV_FILE_SIZE_BYTES) {
    return `CV file must be ${MAX_CV_FILE_SIZE_BYTES / (1024 * 1024)} MB or smaller`;
  }

  const mime = file.type || "application/octet-stream";
  const isPdf =
    mime === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

  if (!isPdf) {
    return "Upload a PDF file only";
  }

  return null;
}

export function validatePdfBuffer(buffer: Buffer): string | null {
  if (buffer.length < 5) {
    return "Invalid PDF file";
  }

  const header = buffer.subarray(0, 5).toString("ascii");
  if (!header.startsWith("%PDF")) {
    return "Invalid PDF file";
  }

  if (buffer.length > MAX_CV_FILE_SIZE_BYTES) {
    return `CV file must be ${MAX_CV_FILE_SIZE_BYTES / (1024 * 1024)} MB or smaller`;
  }

  return null;
}
