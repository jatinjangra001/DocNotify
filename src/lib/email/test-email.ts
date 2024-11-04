// lib/email/test-email.ts
import { Resend } from "resend";
import { EmailTemplate } from "@/components/email/EmailTemplate";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendTestEmail = async ({
  to,
  subject,
  documentTitle,
  message,
  type,
}: {
  to: string;
  subject: string;
  documentTitle: string;
  message: string;
  type:
    | "EXPIRY_WARNING"
    | "DOCUMENT_EXPIRED"
    | "REMINDER_ENABLED"
    | "REMINDER_DISABLED";
}) => {
  if (process.env.NODE_ENV === "development") {
    // Log email content for development
    console.log("📧 Development Email:", {
      to,
      subject,
      documentTitle,
      message,
      type,
    });

    // Use Resend's test email address in development
    return resend.emails.send({
      from: process.env.EMAIL_FROM || "Default Name <default@example.com>",
      to: to,
      subject: `[TEST] ${subject}`,
      react: EmailTemplate({
        documentTitle,
        message,
        type,
        previewText: `Test email for: ${documentTitle}`,
      }),
    });
  }
};
