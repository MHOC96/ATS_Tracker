"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  applicationStatusToAdminDecision,
  recruiterOutcomeStatusSchema,
} from "@/packages/shared/schemas";
import {
  getInterviewTypeLabel,
  interviewTypeValueSchema,
} from "@/packages/shared/schemas/interview";
import {
  deleteApplicationSchema,
  updateCandidateSchema,
} from "@/lib/validation/candidate-form";

const decisionSchema = z.object({
  applicationId: z.string().uuid(),
  status: recruiterOutcomeStatusSchema,
  notes: z.string().optional(),
});

type DecisionResult = { success: true } | { success: false; error: string };

const interviewInviteSchema = z.object({
  applicationId: z.string().uuid(),
  interviewType: interviewTypeValueSchema,
  instructions: z.string().max(2000).optional(),
});

export async function sendInterviewInvite(
  input: z.infer<typeof interviewInviteSchema>
): Promise<DecisionResult> {
  try {
    const user = await requireSessionUser();

    if (user.role === "REVIEWER") {
      return { success: false, error: "Reviewers cannot send interview invites" };
    }

    const parsed = interviewInviteSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid interview invite",
      };
    }

    const { applicationId, interviewType, instructions } = parsed.data;
    const interviewTypeLabel = getInterviewTypeLabel(interviewType);

    const supabase = await createClient();

    const { data: application, error: fetchError } = await supabase
      .from("candidate_applications")
      .select(
        `
        id,
        candidate:candidates (
          full_name,
          email
        ),
        job:jobs (
          title
        )
      `
      )
      .eq("id", applicationId)
      .single();

    if (fetchError || !application) {
      return { success: false, error: "Application not found" };
    }

    const candidate = Array.isArray(application.candidate)
      ? application.candidate[0]
      : application.candidate;
    const job = Array.isArray(application.job) ? application.job[0] : application.job;

    const candidateEmail = candidate?.email?.trim();
    const candidateName = candidate?.full_name?.trim() || "Candidate";
    const jobTitle = job?.title?.trim() || "the role";

    if (!candidateEmail) {
      return {
        success: false,
        error: "Candidate email is required before sending an interview invite",
      };
    }

    const { buildCalComBookingUrl, resolveCalComBookingBaseUrl } = await import(
      "@/lib/email/cal-com"
    );
    const { getGmailSmtpConfig } = await import("@/lib/email/gmail-smtp");

    if (!getGmailSmtpConfig()) {
      return {
        success: false,
        error:
          "Gmail SMTP is not configured. Set GMAIL_SMTP_USER and GMAIL_SMTP_APP_PASSWORD in .env",
      };
    }

    const calBaseUrl = await resolveCalComBookingBaseUrl();
    if (!calBaseUrl) {
      return {
        success: false,
        error:
          "Cal.com booking URL is not configured. Set CALCOM_BOOKING_URL in .env",
      };
    }

    const bookingUrl = buildCalComBookingUrl(calBaseUrl, {
      name: candidateName,
      email: candidateEmail,
      notes: instructions,
    });

    const decisionNotes = [
      `Interview invite sent: ${interviewTypeLabel}`,
      instructions ? `Instructions: ${instructions.trim()}` : null,
      `Booking link: ${bookingUrl}`,
    ]
      .filter(Boolean)
      .join("\n");

    const { error: rpcError } = await supabase.rpc("save_admin_decision", {
      p_application_id: applicationId,
      p_status: "INTERVIEW",
      p_decision: applicationStatusToAdminDecision.INTERVIEW,
      p_notes: decisionNotes,
    });

    if (rpcError) {
      return { success: false, error: rpcError.message };
    }

    const { sendInterviewInviteEmail } = await import(
      "@/lib/email/send-interview-invite"
    );

    try {
      await sendInterviewInviteEmail({
        to: candidateEmail,
        candidateName,
        jobTitle,
        interviewTypeLabel,
        instructions,
        bookingUrl,
        companyName: process.env.INTERVIEW_FROM_NAME?.trim(),
      });
    } catch (emailError) {
      revalidatePath("/admin/candidates");
      revalidatePath(`/admin/candidates/${applicationId}`);
      revalidatePath("/admin/manual-review");

      const message =
        emailError instanceof Error ? emailError.message : "Email send failed";
      return {
        success: false,
        error: `Candidate marked for interview, but email failed: ${message}`,
      };
    }

    revalidatePath("/admin/candidates");
    revalidatePath(`/admin/candidates/${applicationId}`);
    revalidatePath("/admin/manual-review");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to send interview invite",
    };
  }
}

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
    const { applicationId, status, notes } = parsed.data;
    const decision = applicationStatusToAdminDecision[status];

    const { error: rpcError } = await supabase.rpc("save_admin_decision", {
      p_application_id: applicationId,
      p_status: status,
      p_decision: decision,
      p_notes: notes?.trim() || null,
    });

    if (rpcError) {
      return { success: false, error: rpcError.message };
    }

    revalidatePath("/admin/candidates");
    revalidatePath(`/admin/candidates/${applicationId}`);
    revalidatePath("/admin/manual-review");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save decision",
    };
  }
}

type MutationResult = { success: true } | { success: false; error: string };

export async function updateCandidate(
  input: z.infer<typeof updateCandidateSchema>
): Promise<MutationResult> {
  try {
    const user = await requireSessionUser();

    if (user.role === "REVIEWER") {
      return { success: false, error: "Reviewers cannot edit candidates" };
    }

    const parsed = updateCandidateSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input",
      };
    }

    const supabase = await createClient();
    const { applicationId, fullName, email, phone, location } = parsed.data;

    const { data: application, error: fetchError } = await supabase
      .from("candidate_applications")
      .select("id, candidate_id")
      .eq("id", applicationId)
      .single();

    if (fetchError || !application) {
      return { success: false, error: "Application not found" };
    }

    const { error: candidateError } = await supabase
      .from("candidates")
      .update({
        full_name: fullName.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        location: location?.trim() || null,
      })
      .eq("id", application.candidate_id);

    if (candidateError) {
      return { success: false, error: candidateError.message };
    }

    revalidatePath("/admin/candidates");
    revalidatePath(`/admin/candidates/${applicationId}`);
    revalidatePath("/admin/manual-review");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update candidate",
    };
  }
}

export async function deleteCandidateApplication(
  input: z.infer<typeof deleteApplicationSchema>
): Promise<MutationResult> {
  try {
    const user = await requireSessionUser();

    if (user.role !== "ADMIN") {
      return { success: false, error: "Only admins can delete applications" };
    }

    const parsed = deleteApplicationSchema.safeParse(input);

    if (!parsed.success) {
      return { success: false, error: "Invalid application id" };
    }

    const supabase = await createClient();
    const { applicationId } = parsed.data;

    const { error: deleteError } = await supabase
      .from("candidate_applications")
      .delete()
      .eq("id", applicationId);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    revalidatePath("/admin/candidates");
    revalidatePath("/admin/manual-review");
    revalidatePath("/admin/jobs");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete application",
    };
  }
}
