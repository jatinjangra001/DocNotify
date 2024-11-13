// lib/types.ts
export interface Notification {
  id: string;
  userId: string;
  documentId: string;
  documentTitle: string;
  type: "EXPIRY_WARNING" | "EXPIRED" | "REMINDER";
  status: "PENDING" | "SENT" | "FAILED";
  scheduledFor: Date;
  sentAt?: Date;
  message: string;
}
