// lib/firebase/user.ts
import { firestore } from "@/app/firebase/firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
};

export async function createOrUpdateUser(userData: Partial<UserProfile>) {
  if (!userData.uid) throw new Error("User ID is required");

  const userRef = doc(firestore, "users", userData.uid);
  const userDoc = await getDoc(userRef);

  const now = new Date().toISOString();

  if (!userDoc.exists()) {
    // Create new user
    const newUser: UserProfile = {
      uid: userData.uid,
      name: userData.name || "",
      email: userData.email || "",
      phoneNumber: userData.phoneNumber || "",
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(userRef, newUser);
    return newUser;
  } else {
    // Update existing user
    const existingData = userDoc.data() as UserProfile;
    const updatedUser = {
      ...existingData,
      ...userData,
      updatedAt: now,
    };
    await setDoc(userRef, updatedUser);
    return updatedUser;
  }
}
