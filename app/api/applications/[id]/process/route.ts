import { after, NextResponse } from "next/server";
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

  after(async () => {
    try {
      await queueApplicationProcessing(id);
    } catch (error) {
      console.error(
        `[queue] API handoff failed for application ${id}:`,
        error instanceof Error ? error.message : error
      );
    }
  });

  return NextResponse.json(
    {
      queued: true,
      applicationId: id,
      message: "Application queued for AI processing on Railway worker.",
    },
    { status: 202 }
  );
}
