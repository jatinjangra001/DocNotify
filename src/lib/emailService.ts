// src/lib/emailService.ts
import nodemailer from "nodemailer";
import { firestore } from "@/app/firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  DocumentData,
} from "firebase/firestore";

interface DocumentToNotify {
  title: string;
  expiryDate: Date;
  isExpired: boolean;
  daysUntilExpiry: number;
}

interface EmailResult {
  success: boolean;
  emailsSent: number;
  errorCount: number;
  errors: string[];
  processedUsers: number;
  message?: string;
}

const createTransporter = async () => {
  if (
    !process.env.EMAIL_HOST ||
    !process.env.EMAIL_PORT ||
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASSWORD ||
    !process.env.EMAIL_FROM
  ) {
    throw new Error("Missing email configuration environment variables");
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_PORT === "465",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  try {
    await transporter.verify();
    console.log("Email transporter verified successfully");
    return transporter;
  } catch (error) {
    console.error("Email transporter verification failed:", error);
    throw error;
  }
};

export async function checkUpcomingExpirations(): Promise<EmailResult> {
  const results: EmailResult = {
    success: false,
    emailsSent: 0,
    errorCount: 0,
    errors: [],
    processedUsers: 0,
  };

  try {
    console.log("Starting email check process...");
    const transporter = await createTransporter();
    const now = new Date();
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    const usersSnapshot = await getDocs(collection(firestore, "users"));
    console.log(`Found ${usersSnapshot.size} total users`);

    for (const userDoc of usersSnapshot.docs) {
      results.processedUsers++;
      const userData = userDoc.data() as DocumentData;

      if (!userData.email) {
        console.log(`Skipping user ${userDoc.id} - no email found`);
        continue;
      }

      try {
        const docsRef = collection(firestore, "users", userDoc.id, "documents");
        const docsQuery = query(docsRef, where("reminders", "==", true));
        const documentSnapshots = await getDocs(docsQuery);

        const documentsToNotify: DocumentToNotify[] = [];

        documentSnapshots.forEach((doc) => {
          const data = doc.data();
          if (!data.expiryDate) return;

          const expiryDate = new Date(data.expiryDate);
          if (expiryDate <= thirtyDaysFromNow) {
            documentsToNotify.push({
              title: data.title,
              expiryDate,
              isExpired: expiryDate <= now,
              daysUntilExpiry: Math.ceil(
                (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
              ),
            });
          }
        });

        if (documentsToNotify.length > 0) {
          console.log(
            `Sending email to ${userData.email} for ${documentsToNotify.length} documents`
          );
          await sendConsolidatedEmail(
            transporter,
            userData.email,
            documentsToNotify
          );
          results.emailsSent++;
          console.log(`Successfully sent email to ${userData.email}`);
        }
      } catch (error) {
        results.errorCount++;
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        results.errors.push(
          `Error processing user ${userData.email}: ${errorMessage}`
        );
        console.error(`Error processing user ${userData.email}:`, error);
      }
    }

    results.success = true;
    results.message = `Processed ${results.processedUsers} users, sent ${results.emailsSent} emails`;
    console.log("Email check process completed:", results);
    return results;
  } catch (error) {
    console.error("Fatal error in checkUpcomingExpirations:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    results.errors.push(errorMessage);
    results.message = `Failed: ${errorMessage}`;
    return results;
  }
}

async function sendConsolidatedEmail(
  transporter: nodemailer.Transporter,
  to: string,
  documents: DocumentToNotify[]
) {
  const subject = `Document Expiration Notice - ${documents.length} document${
    documents.length > 1 ? "s" : ""
  }`;

  const dashboardUrl = "https://docnotify.vercel.app/";

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
      
      <div style="margin-top: 30px; text-align: center;">
        <a href="${dashboardUrl}" 
           style="background-color: #0070f3; 
                  color: white; 
                  padding: 12px 24px; 
                  text-decoration: none; 
                  border-radius: 5px; 
                  display: inline-block;
                  font-weight: 600;">
          Access Your Dashboard
        </a>
      </div>

      <p style="margin-top: 20px; color: #666; font-size: 14px;">
        Click the button above or visit <a href="${dashboardUrl}" style="color: #0070f3;">${dashboardUrl}</a> to manage your documents.
      </p>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
        <p>This is an automated notification from DocNotify. If you believe you received this email in error, please ignore it or contact support.</p>
      </div>
    </div>
  `;

  const text = `Document Expiration Notice\n\n${documents
    .map(
      (doc) =>
        `${doc.title} - ${
          doc.isExpired ? "EXPIRED" : `Expires in ${doc.daysUntilExpiry} days`
        } (${doc.expiryDate.toLocaleDateString()})`
    )
    .join("\n")}\n\nAccess your dashboard at: ${dashboardUrl}`;

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
