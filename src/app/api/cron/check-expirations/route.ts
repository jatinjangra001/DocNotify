// src/app/api/cron/check-expirations/route.ts
import { NextResponse } from "next/server";
import { checkUpcomingExpirations } from "@/lib/emailService";

export const maxDuration = 60; // 5 minutes max duration for long-running cron
const VERCEL_CRON_TOKEN = process.env.VERCEL_CRON_TOKEN; // Set this in Vercel environment variables

export async function GET(request: Request) {
  console.log("Automated cron job triggered");

  try {
    const userAgent = request.headers.get("user-agent") ?? "";
    console.log("User-Agent:", userAgent);

    // Only check the authorization token if it's not a cron job request
    const isVercelCron = userAgent.includes("vercel-cron");

    if (!isVercelCron) {
      const authHeader = request.headers.get("authorization");
      console.log("Authorization header:", authHeader); // Log the Authorization header

      // Check if the authorization token matches your VERCEL_CRON_TOKEN
      if (authHeader !== `Bearer ${VERCEL_CRON_TOKEN}`) {
        console.error("Unauthorized Vercel cron attempt");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Proceed with cron job logic
    const result = await checkUpcomingExpirations();
    console.log("Expiration check completed:", result);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Expiration check completed successfully",
        details: result,
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to check expirations" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in cron job:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
