import { NextResponse } from "next/server";
import { checkUpcomingExpirations } from "@/lib/emailService";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  // Use the same CRON_SECRET_KEY for testing
  if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("Starting test cron execution...");
    const result = await checkUpcomingExpirations();
    console.log("Test cron execution completed:", result);

    return NextResponse.json({
      success: result.success,
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
