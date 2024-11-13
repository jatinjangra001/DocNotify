// src/app/api/cron/route.ts
import { NextResponse } from "next/server";
import { checkUpcomingExpirations } from "@/lib/emailService";

// Function to validate cron secret
const validateCronSecret = (request: Request) => {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET_KEY) {
    console.error("CRON_SECRET_KEY not configured");
    return false;
  }
  return authHeader === `Bearer ${process.env.CRON_SECRET_KEY}`;
};

export async function POST(request: Request) {
  console.log("Manual cron trigger received");

  if (!validateCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return await handleCronExecution();
}

// Add GET method for Vercel Cron
export async function GET(request: Request) {
  console.log("Automated cron trigger received");

  // For Vercel Cron, validate using CRON_SECRET
  if (!validateCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return await handleCronExecution();
}

// Shared execution logic
async function handleCronExecution() {
  try {
    console.log("Starting cron execution...");
    const result = await checkUpcomingExpirations();
    console.log("Cron execution completed:", result);

    return NextResponse.json({
      success: result.success,
      message: result.message,
      details: {
        emailsSent: result.emailsSent,
        processedUsers: result.processedUsers,
        errorCount: result.errorCount,
        errors: result.errors,
      },
    });
  } catch (error) {
    console.error("Error in cron execution:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
