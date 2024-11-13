// this is for locally testing the email service/

//  src/lib/emailTestService.ts

import nodemailer from "nodemailer";
import { firestore } from "@/app/firebase/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

// Validate email configuration
const validateEmailConfig = () => {
  const requiredEnvVars = [
    "EMAIL_HOST",
    "EMAIL_PORT",
    "EMAIL_USER",
    "EMAIL_PASSWORD",
    "EMAIL_FROM",
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }

  return {
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM,
  };
};

// Create transporter with verification
const createTransporter = async () => {
  const config = validateEmailConfig();

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.password,
    },
  });

  // Verify SMTP connection
  try {
    await transporter.verify();
    return transporter;
  } catch (error) {
    console.error("Failed to create email transporter:", error);
    throw new Error("Email service configuration error");
  }
};

export async function checkUpcomingExpirations() {
  try {
    // Create and verify transporter first
    const transporter = await createTransporter();

    const now = new Date();
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    );
    let emailsSent = 0;
    let errorCount = 0;
    const errors: string[] = [];

    const usersSnapshot = await getDocs(collection(firestore, "users"));
    console.log(`Found ${usersSnapshot.size} users`);

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userEmail = userData.email;

      if (!userEmail) {
        console.log(`No email found for user ${userDoc.id}`);
        continue;
      }

      try {
        const docsRef = collection(firestore, "users", userDoc.id, "documents");
        const docsQuery = query(docsRef, where("reminders", "==", true));
        const documentSnapshots = await getDocs(docsQuery);

        const documentsToNotify = documentSnapshots.docs
          .map((doc) => {
            const data = doc.data();
            const expiryDate = new Date(data.expiryDate);
            if (expiryDate <= thirtyDaysFromNow) {
              return {
                title: data.title,
                expiryDate,
                isExpired: expiryDate <= now,
                daysUntilExpiry: Math.ceil(
                  (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                ),
              };
            }
            return null;
          })
          .filter(
            (
              doc
            ): doc is {
              title: string;
              expiryDate: Date;
              isExpired: boolean;
              daysUntilExpiry: number;
            } => doc !== null
          );

        if (documentsToNotify.length > 0) {
          await sendConsolidatedEmail(
            transporter,
            userEmail,
            documentsToNotify
          );
          emailsSent++;
        }
      } catch (error) {
        errorCount++;
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        errors.push(`Error processing user ${userEmail}: ${errorMessage}`);
      }
    }

    if (errorCount > 0) {
      return {
        success: false,
        message: `Completed with errors. Sent ${emailsSent} emails. Errors: ${errorCount}`,
        emailsSent,
        errorCount,
        errors,
      };
    }

    return {
      success: true,
      message: `Successfully sent ${emailsSent} emails`,
      emailsSent,
      errorCount: 0,
    };
  } catch (error) {
    console.error("Fatal error in checkUpcomingExpirations:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      emailsSent: 0,
      errorCount: 1,
    };
  }
}

async function sendConsolidatedEmail(
  transporter: nodemailer.Transporter,
  to: string,
  documents: {
    title: string;
    expiryDate: Date;
    isExpired: boolean;
    daysUntilExpiry: number;
  }[]
) {
  const subject = `Document Expiration Notice - ${documents.length} document${
    documents.length > 1 ? "s" : ""
  }`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Document Expiration Notice</h1>
      <p>The following documents require your attention:</p>

      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 12px; border: 1px solid #dee2e6; text-align: left;">Document</th>
            <th style="padding: 12px; border: 1px solid #dee2e6; text-align: left;">Expiry Date</th>
            <th style="padding: 12px; border: 1px solid #dee2e6; text-align: left;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${documents
            .map(
              (doc) => `
            <tr>
              <td style="padding: 12px; border: 1px solid #dee2e6;">${
                doc.title
              }</td>
              <td style="padding: 12px; border: 1px solid #dee2e6;">${doc.expiryDate.toLocaleDateString()}</td>
              <td style="padding: 12px; border: 1px solid #dee2e6; color: ${
                doc.isExpired ? "#dc3545" : "#ffc107"
              };">
                ${
                  doc.isExpired
                    ? "Expired"
                    : `Expires in ${doc.daysUntilExpiry} days`
                }
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>

      <p style="margin-top: 20px;">Please visit your dashboard to manage these documents.</p>
    </div>
  `;

  const text = `Document Expiration Notice\n\n${documents
    .map(
      (doc) =>
        `${doc.title} - ${
          doc.isExpired ? "EXPIRED" : `Expires in ${doc.daysUntilExpiry} days`
        } (${doc.expiryDate.toLocaleDateString()})`
    )
    .join("\n")}`;

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html,
    });
    console.log(`Email sent to ${to}, messageId: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    throw error;
  }
}
