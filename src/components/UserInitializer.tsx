// components/UserInitializer.tsx
"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { createOrUpdateUser } from "@/lib/firebase/user";

export function UserInitializer() {
    const { user, isLoaded } = useUser();

    useEffect(() => {
        if (isLoaded && user) {
            createOrUpdateUser({
                uid: user.id,
                name: `${user.firstName} ${user.lastName}`,
                email: user.primaryEmailAddress?.emailAddress || "",
                phoneNumber: user.primaryPhoneNumber?.phoneNumber || ""
            }).catch(console.error);
        }
    }, [isLoaded, user]);

    return null;
}