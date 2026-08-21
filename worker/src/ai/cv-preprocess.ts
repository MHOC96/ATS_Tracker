import { PDFDocument } from "pdf-lib";
import { createRequire } from "module";
import {
  MAX_CV_FILE_SIZE_BYTES,
  MAX_CV_VISION_PAGES,
  MIN_PDF_TEXT_CHARS_FOR_TEXT_PATH,
  isPdfCv,
} from "../cv-limits.js";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse") as (
  buffer: Buffer
) => Promise<{ text: string }>;

export type PreparedCvInput = {
  buffer: Buffer;
  mimeType: string;
  extractedText: string | null;
  usedTextPath: boolean;
  visionPageCount: number | null;
};

export function assertCvSizeWithinLimit(buffer: Buffer): void {
  if (buffer.length > MAX_CV_FILE_SIZE_BYTES) {
    throw new Error(
      `CV exceeds ${MAX_CV_FILE_SIZE_BYTES} bytes worker limit (got ${buffer.length})`
    );
  }
}

export async function extractPdfText(buffer: Buffer): Promise<string> {
  const result = await pdfParse(buffer);
  return (result.text ?? "").replace(/\s+/g, " ").trim();
}

export async function limitPdfPages(
  buffer: Buffer,
  maxPages: number
): Promise<{ buffer: Buffer; pageCount: number }> {
  const source = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const totalPages = source.getPageCount();

  if (totalPages <= maxPages) {
    return { buffer, pageCount: totalPages };
  }

  const trimmed = await PDFDocument.create();
  const indices = Array.from({ length: maxPages }, (_, i) => i);
  const pages = await trimmed.copyPages(source, indices);
  pages.forEach((page) => trimmed.addPage(page));
  const bytes = await trimmed.save();

  return { buffer: Buffer.from(bytes), pageCount: maxPages };
}

export async function prepareCvForExtraction(
  buffer: Buffer,
  mimeType: string
): Promise<PreparedCvInput> {
  assertCvSizeWithinLimit(buffer);

  if (!isPdfCv(mimeType, buffer)) {
    throw new Error("Only PDF CV files are supported");
  }

  const normalizedMime = "application/pdf";

  try {
    const text = await extractPdfText(buffer);
    if (text.length >= MIN_PDF_TEXT_CHARS_FOR_TEXT_PATH) {
      return {
        buffer,
        mimeType: normalizedMime,
        extractedText: text.slice(0, 12000),
        usedTextPath: true,
        visionPageCount: null,
      };
    }
  } catch {
    // fall through to vision
  }

  try {
    const limited = await limitPdfPages(buffer, MAX_CV_VISION_PAGES);
    return {
      buffer: limited.buffer,
      mimeType: normalizedMime,
      extractedText: null,
      usedTextPath: false,
      visionPageCount: limited.pageCount,
    };
  } catch {
    return {
      buffer,
      mimeType: normalizedMime,
      extractedText: null,
      usedTextPath: false,
      visionPageCount: null,
    };
  }
}
