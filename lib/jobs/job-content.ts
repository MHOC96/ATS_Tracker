/**
 * Split stored job text into display lines (handles newlines and bullet prefixes).
 */
export function parseJobContentLines(value: string | null | undefined): string[] {
  if (!value?.trim()) return [];

  return value
    .split(/\r?\n/)
    .map((line) => line.replace(/^[\s•\-*–—]+/, "").trim())
    .filter(Boolean);
}

export function parseJobParagraphs(value: string | null | undefined): string[] {
  if (!value?.trim()) return [];

  return value
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);
}
