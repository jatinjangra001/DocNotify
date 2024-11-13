// src/components/EmailTestButton.tsx
'use client';

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function EmailTestButton() {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleTestEmail = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/test-email', {
                method: 'POST',
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Test emails sent successfully. Check your inbox.",
                });
            } else {
                throw new Error(data.error || 'Failed to send test emails');
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to send test emails",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleTestEmail}
            disabled={isLoading}
        >
            {isLoading ? "Sending..." : "Send Test Emails"}
        </Button>
    );
}


