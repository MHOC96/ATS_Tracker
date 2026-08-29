import { escapeHtml } from "@/lib/email/escape-html";

export type InterviewInviteEmailInput = {
  candidateName: string;
  jobTitle: string;
  interviewTypeLabel: string;
  instructions?: string;
  bookingUrl: string;
  companyName?: string;
};

export function buildInterviewInviteEmail(input: InterviewInviteEmailInput): {
  subject: string;
  text: string;
  html: string;
} {
  const company = input.companyName?.trim() || "Our team";
  const subject = `Interview invitation — ${input.jobTitle}`;

  const instructionsBlock = input.instructions?.trim()
    ? `\n\nBefore your session:\n${input.instructions.trim()}`
    : "";

  const text = `Hi ${input.candidateName},

Congratulations! We were impressed with your application for ${input.jobTitle} and would like to invite you to an interview.

Session: ${input.interviewTypeLabel}
${instructionsBlock}

Please choose a time that works for you using this booking link:
${input.bookingUrl}

We look forward to speaking with you.

Best regards,
${company}`;

  const instructionsHtml = input.instructions?.trim()
    ? `<p><strong>Before your session:</strong><br>${escapeHtml(input.instructions.trim()).replace(/\n/g, "<br>")}</p>`
    : "";

  const html = `<!DOCTYPE html>
<html>
<body style="font-family: system-ui, sans-serif; line-height: 1.6; color: #111;">
  <p>Hi ${escapeHtml(input.candidateName)},</p>
  <p>Congratulations! We were impressed with your application for <strong>${escapeHtml(input.jobTitle)}</strong> and would like to invite you to an interview.</p>
  <p><strong>Session:</strong> ${escapeHtml(input.interviewTypeLabel)}</p>
  ${instructionsHtml}
  <p>Please choose a time that works for you:</p>
  <p><a href="${escapeHtml(input.bookingUrl)}" style="display:inline-block;padding:10px 18px;background:#111;color:#fff;text-decoration:none;border-radius:6px;">Book your interview</a></p>
  <p style="word-break:break-all;font-size:14px;color:#555;">${escapeHtml(input.bookingUrl)}</p>
  <p>We look forward to speaking with you.</p>
  <p>Best regards,<br>${escapeHtml(company)}</p>
</body>
</html>`;

  return { subject, text, html };
}

export async function sendInterviewInviteEmail(
  input: InterviewInviteEmailInput & { to: string }
): Promise<void> {
  const { sendGmailMessage } = await import("@/lib/email/gmail-smtp");
  const { subject, text, html } = buildInterviewInviteEmail(input);

  await sendGmailMessage({
    to: input.to,
    subject,
    text,
    html,
  });
}
