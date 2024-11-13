// src/app/api/test-cron/route.ts
import { NextResponse } from "next/server";
import { checkUpcomingExpirations } from "@/lib/emailService";

export async function GET(request: Request) {
  console.log("Test cron endpoint called");

  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET_KEY) {
    console.error("CRON_SECRET_KEY not configured");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
    console.log("Unauthorized access attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("Starting test cron execution...");
    const result = await checkUpcomingExpirations();
    console.log("Test cron execution completed:", result);

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
    console.error("Error in test cron endpoint:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
