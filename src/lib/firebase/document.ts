// lib/firebase/documents.ts
import { firestore } from "@/app/firebase/firebaseConfig";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";

export type Document = {
  id?: string;
  userId: string;
  title: string;
  expiryDate: string;
  notifyBefore: number; // days
  createdAt: string;
  updatedAt: string;
};

export async function addDocument(
  document: Omit<Document, "id" | "createdAt" | "updatedAt">
) {
  const now = new Date().toISOString();

  const docRef = await addDoc(collection(firestore, "documents"), {
    ...document,
    createdAt: now,
    updatedAt: now,
  });

  return docRef.id;
}

export async function getUserDocuments(userId: string) {
  const q = query(
    collection(firestore, "documents"),
    where("userId", "==", userId)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Document[];
}
