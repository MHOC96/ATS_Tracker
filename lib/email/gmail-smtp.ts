import nodemailer from "nodemailer";
import type Transporter from "nodemailer/lib/mailer";

let cachedTransporter: Transporter | null = null;

export type GmailSmtpConfig = {
  user: string;
  appPassword: string;
  from?: string;
};

export function getGmailSmtpConfig(): GmailSmtpConfig | null {
  const user = process.env.GMAIL_SMTP_USER?.trim();
  const appPassword = process.env.GMAIL_SMTP_APP_PASSWORD?.trim();

  if (!user || !appPassword) {
    return null;
  }

  return {
    user,
    appPassword,
    from: process.env.GMAIL_SMTP_FROM?.trim() || user,
  };
}

export function getGmailTransporter(): Transporter {
  const config = getGmailSmtpConfig();

  if (!config) {
    throw new Error(
      "Gmail SMTP is not configured. Set GMAIL_SMTP_USER and GMAIL_SMTP_APP_PASSWORD in .env"
    );
  }

  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: config.user,
        pass: config.appPassword,
      },
    });
  }

  return cachedTransporter;
}

export async function sendGmailMessage(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<void> {
  const config = getGmailSmtpConfig();

  if (!config) {
    throw new Error(
      "Gmail SMTP is not configured. Set GMAIL_SMTP_USER and GMAIL_SMTP_APP_PASSWORD in .env"
    );
  }

  const transporter = getGmailTransporter();

  await transporter.sendMail({
    from: config.from,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });
}
