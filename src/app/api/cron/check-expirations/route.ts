// src/app/api/cron/check-expirations/route.ts
import { NextResponse } from "next/server";
import { checkUpcomingExpirations } from "@/lib/emailService";

export async function GET(request: Request) {
  // Verify cron secret key for security
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await checkUpcomingExpirations();

    if (result.success) {
      return NextResponse.json({
        message: "Expiration check completed successfully",
      });
    } else {
      return NextResponse.json(
        { error: "Failed to check expirations" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in cron job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
