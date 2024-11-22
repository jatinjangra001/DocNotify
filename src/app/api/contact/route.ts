//src/app/api/contact/route.ts
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Define a type for the input
interface SupportRequest {
  email: string;
  name: string;
  subject: string;
  message: string;
}

// Validate input function
const validateInput = ({
  email,
  name,
  subject,
  message,
}: SupportRequest): boolean => {
  return !!(email && name && subject && message); // Ensure all fields are provided
};

// POST method handler
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { email, name, subject, message } = body as SupportRequest;

    // Validate the input
    if (!validateInput(body)) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create a transporter using your existing email configuration
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_PORT === "465",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Send the email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER, // Your email
      replyTo: email, // This allows you to reply directly to the sender
      subject: `Support Request from ${name}: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Support Request</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px;">
            <p><strong>Message:</strong></p>
            <p>${message}</p>
          </div>
          <p style="margin-top: 20px; font-size: 0.8em; color: #666;">
            This message was sent via the DocNotify support form.
          </p>
        </div>
      `,
      text: `
        New Support Request
        From: ${name} (${email})
        Subject: ${subject}
        Message: ${message}
      `,
    });

    return NextResponse.json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json(
      { message: "Failed to send message" },
      { status: 500 }
    );
  }
}
