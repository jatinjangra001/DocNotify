"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function TestEmailPage() {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        to: '',
        documentTitle: 'Test Document',
        message: 'This is a test notification',
        type: 'EXPIRY_WARNING'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/test/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    subject: `Test Notification: ${formData.documentTitle}`
                })
            });

            if (!response.ok) throw new Error('Failed to send test email');

            toast({
                title: "Test Email Sent",
                description: "Check your inbox for the test email",
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast({
                    title: "Error",
                    description: error.message,
                    variant: "destructive"
                });
            } else {
                toast({
                    title: "Error",
                    description: "An unknown error occurred.",
                    variant: "destructive"
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container max-w-2xl py-8">
            <Card>
                <CardHeader>
                    <CardTitle>Test Email Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Recipient Email</label>
                            <Input
                                type="email"
                                value={formData.to}
                                onChange={e => setFormData(prev => ({ ...prev, to: e.target.value }))}
                                placeholder="test@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Document Title</label>
                            <Input
                                value={formData.documentTitle}
                                onChange={e => setFormData(prev => ({ ...prev, documentTitle: e.target.value }))}
                                placeholder="Test Document"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Message</label>
                            <Textarea
                                value={formData.message}
                                onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                                placeholder="Notification message..."
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Notification Type</label>
                            <select
                                className="w-full p-2 border rounded-md"
                                value={formData.type}
                                onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))}
                            >
                                <option value="EXPIRY_WARNING">Expiry Warning</option>
                                <option value="DOCUMENT_EXPIRED">Document Expired</option>
                                <option value="REMINDER_ENABLED">Reminder Enabled</option>
                                <option value="REMINDER_DISABLED">Reminder Disabled</option>
                            </select>
                        </div>

                        <Button type="submit" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Test Email'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
