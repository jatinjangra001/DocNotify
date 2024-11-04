import { NextResponse } from "next/server";
import { checkDocumentExpiry } from "@/lib/notifications";
import { firestore } from "@/app/firebase/firebaseConfig";
import { collectionGroup, getDocs } from "firebase/firestore";

export async function GET(request: Request) {
  // Verify cron secret in production
  const authHeader = request.headers.get("authorization");
  if (
    process.env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const documentsQuery = collectionGroup(firestore, "documents");
    const snapshot = await getDocs(documentsQuery);

    const documents = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        path: doc.ref.path,
        title: data.title,
        description: data.description,
        expiryDate: data.expiryDate,
        reminders: data.reminders,
        currentDate: data.currentDate,
        ...data, // Merge all other fields, if any
      };
    });

    console.log(`Processing ${documents.length} documents for notifications`);

    const results = await Promise.all(
      documents.map((doc) => checkDocumentExpiry(doc))
    );

    // Filter out null results and count notifications sent
    const validResults = results.filter((r) => r !== null);
    const notificationsSent = validResults.filter(
      (r) => r.status === "notified"
    ).length;

    return NextResponse.json({
      success: true,
      processed: documents.length,
      notificationsSent,
      results: validResults,
    });
  } catch (error: any) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      {
        error: error.message,
        errorDetails:
          process.env.NODE_ENV === "development"
            ? {
                name: error.name,
                code: error.code,
                stack: error.stack,
              }
            : undefined,
      },
      { status: 500 }
    );
  }
}
