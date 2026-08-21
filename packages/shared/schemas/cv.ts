/** Shared CV upload limits (app gateway + worker). */
export const MAX_CV_FILE_SIZE_BYTES = 4 * 1024 * 1024;

/** Max PDF pages sent to Gemini vision (screening signal is usually on page 1–3). */
export const MAX_CV_VISION_PAGES = 3;

/** Minimum extracted PDF text length to skip vision and use text-only extraction. */
export const MIN_PDF_TEXT_CHARS_FOR_TEXT_PATH = 400;

export const ALLOWED_CV_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;
