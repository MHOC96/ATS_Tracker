import { NextResponse } from "next/server";
import { queueApplicationProcessing } from "@/lib/queue/handoff";

/**
 * API gateway endpoint — queues AI processing on Railway.
 * Long-running Gemini/Groq calls MUST NOT run here (Vercel timeout limits).
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const result = await queueApplicationProcessing(id);
    return NextResponse.json(result, { status: 202 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to queue processing";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
