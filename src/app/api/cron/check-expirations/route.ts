// // src/app/api/cron/check-expirations/route.ts
// import { NextResponse } from "next/server";
// import { checkUpcomingExpirations } from "@/lib/emailService";

// export async function GET(request: Request) {
//   // Verify cron secret key for security
//   const authHeader = request.headers.get("authorization");
//   if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     const result = await checkUpcomingExpirations();

//     if (result.success) {
//       return NextResponse.json({
//         message: "Expiration check completed successfully",
//       });
//     } else {
//       return NextResponse.json(
//         { error: "Failed to check expirations" },
//         { status: 500 }
//       );
//     }
//   } catch (error) {
//     console.error("Error in cron job:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

// src/app/api/cron/check-expirations/route.ts
import { NextResponse } from "next/server";
import { checkUpcomingExpirations } from "@/lib/emailService";

export const maxDuration = 60; // 5 minutes max duration for long-running cron
const VERCEL_CRON_TOKEN = process.env.VERCEL_CRON_TOKEN; // Set this in Vercel environment variables

export async function GET(request: Request) {
  console.log("Automated cron job triggered");

  try {
    // Check for Vercel Cron specific headers
    const authHeader = request.headers.get("authorization");
    const isVercelCron = request.headers
      .get("user-agent")
      ?.includes("vercel-cron");

    // Validation logic
    if (isVercelCron) {
      // For Vercel automated cron
      if (!VERCEL_CRON_TOKEN || authHeader !== `Bearer ${VERCEL_CRON_TOKEN}`) {
        console.error("Unauthorized Vercel cron attempt");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } else {
      // For manual API calls
      if (
        !process.env.CRON_SECRET_KEY ||
        authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`
      ) {
        console.error("Unauthorized manual API call");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Execute the cron job
    console.log("Starting expiration check...");
    const result = await checkUpcomingExpirations();
    console.log("Expiration check completed:", result);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Expiration check completed successfully",
        details: {
          emailsSent: result.emailsSent,
          processedUsers: result.processedUsers,
          errorCount: result.errorCount,
          errors: result.errors,
        },
      });
    } else {
      console.error("Expiration check failed:", result);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to check expirations",
          details: result,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in cron job:", error);
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
