//app/page.tsx
'use client'
import { redirect } from "next/navigation";
import { useUser } from "@clerk/nextjs"; // Import the Clerk user hook

export default function Home() {
  const { isSignedIn } = useUser();

  // Redirect based on the user's authentication status
  if (isSignedIn) {
    redirect("/dashboard"); // Redirect to the dashboard if the user is signed in
  } else {
    redirect("/sign-up"); // Redirect to the sign-up page if not signed in
  }

  return null; // This line will never be reached due to the redirects
}
