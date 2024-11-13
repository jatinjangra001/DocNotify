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
    const authHeader = request.headers.get("authorization");
    console.log("Authorization header:", authHeader); // Log the Authorization header

    const isVercelCron = request.headers
      .get("user-agent")
      ?.includes("vercel-cron");

    // Check for correct authorization
    if (isVercelCron) {
      if (!VERCEL_CRON_TOKEN || authHeader !== `Bearer ${VERCEL_CRON_TOKEN}`) {
        console.error("Unauthorized Vercel cron attempt");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } else {
      // Handle manual API calls if any
      if (
        !process.env.CRON_SECRET_KEY ||
        authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`
      ) {
        console.error("Unauthorized manual API call");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Proceed with cron logic
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
