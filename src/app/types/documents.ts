import { Timestamp } from "firebase/firestore";

// types/document.ts
export interface Document {
  id: string;
  title: string;
  description: string;
  expiryDate: string;
  reminders: boolean;
  fileUrls?: string[];
  createdAt: Timestamp;
  currentDate: string;
}
