"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useUser } from "@clerk/nextjs";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircleIcon, SendIcon } from "lucide-react";

export default function ContactUsPage() {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useUser();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check if user is logged in
        if (!user) {
            toast({
                title: "Error",
                description: "You must be logged in to send a message",
                variant: "destructive"
            });
            return;
        }

        // Basic validation
        if (!subject.trim() || !message.trim()) {
            toast({
                title: "Error",
                description: "Please fill in both subject and message",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: user.primaryEmailAddress?.emailAddress,
                    name: `${user.firstName} ${user.lastName}`,
                    subject,
                    message
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            toast({
                title: "Success",
                description: "Your message has been sent successfully",
                variant: "default"
            });

            // Reset form
            setSubject('');
            setMessage('');
        } catch (error) {
            console.error('Contact form submission error:', error);
            toast({
                title: "Error",
                description: "Failed to send message. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <div className="flex items-center space-x-4">
                        <MessageCircleIcon className="w-10 h-10 text-primary" />
                        <div>
                            <CardTitle>Contact Support</CardTitle>
                            <CardDescription>
                                Have an issue or query? We are here to help.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {user && (
                            <div className="bg-muted/50 p-4 rounded-lg">
                                <p className="text-sm font-medium">
                                    Logged in as: {user.firstName} {user.lastName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {user.primaryEmailAddress?.emailAddress}
                                </p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input
                                id="subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Brief description of your issue"
                                disabled={isSubmitting}
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Provide detailed information about your issue or query"
                                disabled={isSubmitting}
                                className="w-full min-h-[200px]"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isSubmitting}
                        >
                            <SendIcon className="mr-2 h-4 w-4" />
                            {isSubmitting ? "Sending..." : "Send Message"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        <p>We typically respond within 1-2 business days.</p>
                        <p>For urgent matters, please contact support directly.</p>
                    </div>
                </CardContent>
                <div className="mt-4 text-center">
                    <a
                        href="https://www.linkedin.com/in/jangrajatin/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 text-blue-600 hover:underline"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-linkedin w-5 h-5"
                        >
                            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                            <rect width="4" height="12" x="2" y="9" />
                            <circle cx="4" cy="4" r="2" />
                        </svg>
                        <span>Lets Connect</span>
                    </a>
                </div>

                <div className="mt-1 text-center">
                    <a
                        href="https://github.com/jatinjangra001"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 text-blue-600 hover:underline"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-github w-5 h-5"
                        >
                            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                            <path d="M9 18c-4.51 2-5-2-7-2" />
                        </svg>
                        <span>Checkout my github</span>
                    </a>
                </div>

            </Card>
        </div>
    );
}