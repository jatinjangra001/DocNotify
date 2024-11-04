import { NextResponse } from "next/server";
import { checkDocumentExpiry } from "@/lib/notifications";
import { firestore } from "@/app/firebase/firebaseConfig";
import { collectionGroup, getDocs } from "firebase/firestore";

// Define a custom error type to include a 'code' property
interface FirestoreError extends Error {
  code?: string; // The code property is optional
}

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
  } catch (error: unknown) {
    // Change 'any' to 'unknown'
    console.error("Cron job error:", error);

    // Type narrowing to access properties safely
    if (error instanceof Error) {
      const firestoreError = error as FirestoreError; // Type assertion

      return NextResponse.json(
        {
          error: firestoreError.message,
          errorDetails:
            process.env.NODE_ENV === "development"
              ? {
                  name: firestoreError.name,
                  code: firestoreError.code, // Now this is safe to access
                  stack: firestoreError.stack,
                }
              : undefined,
        },
        { status: 500 }
      );
    }

    // Fallback for unexpected error types
    return NextResponse.json(
      {
        error: "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}
