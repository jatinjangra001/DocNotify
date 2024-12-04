//dashboard/addDocument/page.tsx
"use client";
import { useUser } from '@clerk/nextjs';
import { doc, collection, addDoc, setDoc, serverTimestamp, FieldValue } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { firestore, storage } from '@/app/firebase/firebaseConfig';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/ui/file-upload';
import { Input } from '@/components/ui/input';
import { DatePickerDemo } from '@/components/ui/date-picker';
import { Switch } from '@/components/ui/switch';
import { ToastAction } from '@radix-ui/react-toast';

interface Document {
    title: string;
    description: string;
    expiryDate: string;
    createdAt: FieldValue;
    currentDate: string;
    reminders: boolean;
    fileUrls?: string[];
}

const AddDocument = () => {
    const { user, isLoaded } = useUser();
    const { toast } = useToast();
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [expiryDate, setExpiryDate] = useState<Date | undefined>();
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [reminders, setReminders] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!isLoaded) {
            toast({
                title: "Loading",
                description: "Please wait while we load your information.",
                variant: "default",
                action: <ToastAction altText='DISMISS_TOAST'>Dismiss</ToastAction>
            });
            return;
        }

        if (!user?.id || !title || !description || !expiryDate || files.length === 0) {
            toast({
                title: "Missing Information",
                description: "Please fill all required fields and upload at least one file.",
                variant: "destructive"
            });
            setLoading(false);
            return;
        }

        try {
            // Create document reference
            const docData: Omit<Document, 'fileUrls'> = {
                title,
                description,
                expiryDate: expiryDate.toISOString(),
                createdAt: serverTimestamp(),
                currentDate: new Date().toISOString(),
                reminders,
            };

            const docRef = await addDoc(collection(firestore, 'users', user.id, 'documents'), docData);

            // Upload files
            const fileUrls = await Promise.all(
                files.map(async (file) => {
                    const fileRef = ref(storage, `users/${user.id}/documents/${docRef.id}/${file.name}`);
                    await uploadBytes(fileRef, file, { contentType: file.type });
                    return getDownloadURL(fileRef);
                })
            );

            // Update document with file URLs
            await setDoc(
                doc(firestore, 'users', user.id, 'documents', docRef.id),
                { fileUrls },
                { merge: true }
            );

            toast({
                title: "Success",
                description: "Document added successfully",
            });

            router.push('/dashboard/docs');
        } catch (error) {
            console.error('Error adding document:', error);
            toast({
                title: "Error",
                description: "Failed to add document. Please try again.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    if (!isLoaded) {
        return <div>Loading...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                type="text"
                placeholder="Document Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />
            <Input
                type="text"
                placeholder="Document Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
            />
            <div className='space-y-4'>
                <DatePickerDemo
                    selected={expiryDate}
                    onSelect={setExpiryDate}
                />
                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <label className="text-base">Get Reminders?</label>
                        <p className="text-sm text-gray-600">
                            Receive reminders for this document expirations
                        </p>
                    </div>
                    <Switch
                        checked={reminders}
                        onCheckedChange={setReminders}
                    />
                </div>
            </div>
            <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed primary2 rounded-lg">
                <FileUpload
                    onChange={(files) => setFiles(Array.from(files))}
                    multiple
                />
            </div>
            <Button type="submit" disabled={loading}>
                {loading ? 'Uploading...' : 'Add Document'}
            </Button>
        </form>
    );
};

export default AddDocument;