// app/(protected)/layout.tsx
import { UserInitializer } from "@/components/UserInitializer";

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            <UserInitializer />
            {children}
        </div>
    );
}