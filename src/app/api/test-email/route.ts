// this is for testing the email service locally.

// src/app/api/test-email/route.ts
import { NextResponse } from "next/server";
import { checkUpcomingExpirations } from "@/lib/emailTestService";

export async function POST() {
  try {
    const result = await checkUpcomingExpirations();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        details: result,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to send test emails",
          details: result,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in test email endpoint:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
