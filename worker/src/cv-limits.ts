/** Mirrors packages/shared/schemas/cv.ts for the worker bundle. */
export const MAX_CV_FILE_SIZE_BYTES = 4 * 1024 * 1024;
export const MAX_CV_VISION_PAGES = 3;
export const MIN_PDF_TEXT_CHARS_FOR_TEXT_PATH = 400;

export const ALLOWED_CV_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;
