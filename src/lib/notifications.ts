// lib/notifications.ts
import { firestore } from "@/app/firebase/firebaseConfig";
import {
  collection,
  getDocs,
  collectionGroup,
  getDoc,
  doc,
} from "firebase/firestore";

interface Document {
  id: string;
  path: string;
  title: string;
  description: string;
  expiryDate: string;
  reminders: boolean;
  currentDate: string;
}

interface User {
  email: string;
  name: string;
  phoneNumber: string;
  uid: string;
}

export const checkDocumentExpiry = async (document: Document) => {
  try {
    // Get the user ID from the document path
    const pathParts = document.path.split("/");
    const userId = pathParts[1]; // users/{userId}/documents/{documentId}

    // Fetch user data to get email
    const userDoc = await getDoc(doc(firestore, "users", userId));
    const userData = userDoc.data() as User;

    if (!userData || !userData.email) {
      console.error(`No user data or email found for document ${document.id}`);
      return null;
    }

    const expiryDate = new Date(document.expiryDate);
    const currentDate = new Date();
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Only process if reminders are enabled
    if (!document.reminders) {
      return {
        documentId: document.id,
        status: "skipped",
        reason: "reminders disabled",
      };
    }

    let notificationType = "";
    let shouldNotify = false;
    let message = "";

    // Notification logic
    if (daysUntilExpiry <= 0) {
      notificationType = "DOCUMENT_EXPIRED";
      shouldNotify = true;
      message = `Your document "${document.title}" has expired.`;
    } else if (daysUntilExpiry <= 7) {
      notificationType = "EXPIRY_WARNING";
      shouldNotify = true;
      message = `Your document "${document.title}" will expire in ${daysUntilExpiry} days.`;
    }

    if (shouldNotify) {
      // Send email notification
      await fetch("/api/notifications/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: userData.email,
          subject: `Document Notification: ${document.title}`,
          documentTitle: document.title,
          message,
          type: notificationType,
        }),
      });

      return {
        documentId: document.id,
        status: "notified",
        type: notificationType,
        recipient: userData.email,
      };
    }

    return {
      documentId: document.id,
      status: "checked",
      daysUntilExpiry,
    };
  } catch (error: any) {
    console.error(`Error processing document ${document.id}:`, error);
    return {
      documentId: document.id,
      status: "error",
      error: error.message,
    };
  }
};
