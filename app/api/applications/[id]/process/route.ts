import { after, NextResponse } from "next/server";
import {
  requireApiRecruiterOrAdmin,
  verifyWorkerApiSecret,
} from "@/lib/auth/api";
import { enqueueApplicationProcessing } from "@/lib/queue/enqueue";

const MAX_BODY_BYTES = 4096;

/**
 * Internal endpoint to (re)queue AI processing. Requires worker secret or staff session.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!verifyWorkerApiSecret(request)) {
    const auth = await requireApiRecruiterOrAdmin();
    if (auth instanceof NextResponse) return auth;
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  after(async () => {
    try {
      await enqueueApplicationProcessing(id);
    } catch (error) {
      console.error(
        `[queue] API enqueue failed for application ${id}:`,
        error instanceof Error ? error.message : error
      );
    }
  });

  return NextResponse.json(
    {
      queued: true,
      applicationId: id,
      message: "Application queued for AI processing.",
    },
    { status: 202 }
  );
}
