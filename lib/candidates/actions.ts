"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const decisionSchema = z.object({
  applicationId: z.string().uuid(),
  decision: z.enum(["SHORTLIST", "INTERVIEW", "HOLD", "REJECT", "MANUAL_REVIEW"]),
  notes: z.string().optional(),
});

const statusByDecision: Record<
  z.infer<typeof decisionSchema>["decision"],
  string
> = {
  SHORTLIST: "SHORTLISTED",
  INTERVIEW: "INTERVIEW",
  HOLD: "ON_HOLD",
  REJECT: "REJECTED",
  MANUAL_REVIEW: "MANUAL_REVIEW",
};

type DecisionResult = { success: true } | { success: false; error: string };

export async function saveAdminDecision(
  input: z.infer<typeof decisionSchema>
): Promise<DecisionResult> {
  try {
    const user = await requireSessionUser();

    if (user.role === "REVIEWER") {
      return { success: false, error: "Reviewers cannot record decisions" };
    }

    const parsed = decisionSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid decision",
      };
    }

    const supabase = await createClient();
    const { applicationId, decision, notes } = parsed.data;

    const { error: decisionError } = await supabase.from("admin_decisions").insert({
      candidate_application_id: applicationId,
      reviewer_id: user.id,
      decision,
      notes: notes?.trim() || null,
    });

    if (decisionError) {
      return { success: false, error: decisionError.message };
    }

    const { error: statusError } = await supabase
      .from("candidate_applications")
      .update({ status: statusByDecision[decision] })
      .eq("id", applicationId);

    if (statusError) {
      return { success: false, error: statusError.message };
    }

    revalidatePath("/admin/candidates");
    revalidatePath(`/admin/candidates/${applicationId}`);
    revalidatePath("/admin/manual-review");
    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save decision",
    };
  }
}
