import { after, NextResponse } from "next/server";
import { requireApiRecruiterOrAdmin } from "@/lib/auth/api";
import { queueApplicationProcessing } from "@/lib/queue/handoff";

/**
 * API gateway endpoint — queues AI processing on Railway.
 * Requires an authenticated staff session (admin or recruiter).
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiRecruiterOrAdmin();
  if ("error" in auth) return auth.error;

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
