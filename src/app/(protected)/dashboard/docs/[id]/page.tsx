'use client';

import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { firestore, storage } from '@/app/firebase/firebaseConfig';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { BellOff, BellRing } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

interface Document {
    id: string;
    title: string;
    description: string;
    expiryDate: string;
    reminders: boolean;
    fileUrls?: string[];
    docIds?: string[];
}

const fetchDocument = async (userId: string, docId: string): Promise<Document | null> => {
    if (!userId || !docId) return null;
    const docRef = doc(firestore, 'users', userId, 'documents', docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Document;
    }
    return null;
};

export default function DocumentDetail() {
    const params = useParams();
    const { user, isLoaded } = useUser();
    const { toast } = useToast();
    const router = useRouter();
    const queryClient = useQueryClient();

    // Fetch document data
    const { data: document, isLoading } = useQuery({
        queryKey: ['document', user?.id, params.id],
        queryFn: () => {
            if (user?.id && params.id) {
                return fetchDocument(user.id, params.id as string);
            }
            return null; // Or throw an error if you prefer
        },
        enabled: !!user?.id && !!params.id && isLoaded,
        retry: 1,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });


    // Update document mutation
    const updateMutation = useMutation({
        mutationFn: async (updates: Partial<Document>) => {
            if (!user?.id || !params.id) throw new Error('Missing user ID or document ID');
            const docRef = doc(firestore, 'users', user.id, 'documents', params.id as string);
            await updateDoc(docRef, updates);
            return updates;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['document', user?.id, params.id] });
            toast({
                title: "Success",
                description: "Document updated successfully",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to update document",
                variant: "destructive"
            });
        },
    });

    // Delete document mutation
    const deleteMutation = useMutation({
        mutationFn: async () => {
            if (!user?.id || !params.id || !document) throw new Error('Missing required data');

            // Delete all files from storage
            if (document.fileUrls?.length) {
                await Promise.all(
                    document.fileUrls.map(async (fileUrl) => {
                        const fileRef = ref(storage, fileUrl);
                        try {
                            await deleteObject(fileRef);
                        } catch (error) {
                            console.error('Error deleting file:', error);
                        }
                    })
                );
            }

            // Delete document from Firestore
            const docRef = doc(firestore, 'users', user.id, 'documents', params.id as string);
            await deleteDoc(docRef);
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Document deleted successfully",
            });
            router.push('/dashboard/docs');
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to delete document",
                variant: "destructive"
            });
        },
    });

    // Delete file mutation
    const deleteFileMutation = useMutation({
        mutationFn: async ({ fileUrl, fileIndex }: { fileUrl: string, fileIndex: number }) => {
            if (!user?.id || !params.id || !document) throw new Error('Missing required data');

            const fileRef = ref(storage, fileUrl);
            await deleteObject(fileRef);

            const newFileUrls = document.fileUrls?.filter((_, index) => index !== fileIndex);
            const docRef = doc(firestore, 'users', user.id, 'documents', params.id as string);
            await updateDoc(docRef, { fileUrls: newFileUrls });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['document', user?.id, params.id] });
            toast({
                title: "Success",
                description: "File deleted successfully",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to delete file",
                variant: "destructive"
            });
        },
    });

    // Update the handleToggleReminders function in your DocumentDetail component
    const handleToggleReminders = async () => {
        if (document) {
            updateMutation.mutate({
                reminders: !document.reminders
            }, {
                onSuccess: () => {
                    toast({
                        title: document.reminders ? "Reminders disabled" : "Reminders enabled",
                        description: document.reminders
                            ? "You will no longer receive notifications for this document."
                            : "You will receive notifications before this document expires.",
                    });
                }
            });
        }
    };

    const isExpired = document ? new Date(document.expiryDate) < new Date() : false;
    // const isImage = (fileName: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
    const isImage = (url: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(url.split('?')[0].toLowerCase());
    const getImageUrl = (url: string) => {
        try {
            // Create a URL object to handle the Firebase Storage URL
            // const firebaseUrl = new URL(url);
            // Return the full URL as is - Firebase Storage URLs are already properly formatted
            return url;
        } catch (e) {
            console.error('Invalid URL:', e);
            return url;
        }
    };


    if (!isLoaded || isLoading) {
        return (
            <div className="container mx-auto p-4">
                <div className="space-y-4">
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>
        );
    }

    if (!document) {
        return (
            <div className="container mx-auto p-4">
                <div className="text-center">Document not found</div>
            </div>
        );
    }

    return (
        <>
            <div className="w-full h-full container mx-auto p-4">
                <div className="bg-slate-400 rounded-lg shadow-md p-6">
                    <h1 className="text-2xl font-bold mb-4">
                        {document.title} {isExpired && <span className="text-red-500">(Expired)</span>}
                    </h1>

                    <p className="mb-4">{document.description}</p>

                    <p className="mb-4">
                        Expiry Date: {new Date(document.expiryDate).toLocaleDateString()}
                    </p>

                    <Button
                        onClick={handleToggleReminders}
                        variant="outline"
                        className="mb-4 flex items-center gap-2"
                        disabled={updateMutation.isPending}
                    >
                        {document.reminders ? (
                            <>
                                <BellRing className="h-4 w-4" />
                                <span>Reminders are ON</span>
                            </>
                        ) : (
                            <>
                                <BellOff className="h-4 w-4" />
                                <span>Reminders are OFF</span>
                            </>
                        )}
                    </Button>

                    {/* <div className="w-full h-full">
                    {document.fileUrls?.map((url: string, index: number) => (
                        <div key={url} className="relative group">
                            {isImage(url) ? (
                                <div className="absolute w-full h-auto">
                                    <Image
                                        src={getImageUrl(url)}
                                        alt={`File ${index + 1}`}
                                        width={500}
                                        height={500}
                                        className="object-cover w-full h-full"
                                        loading="lazy"
                                        quality={100}
                                        // fill
                                        // className="rounded-lg object-cover"
                                        // sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        unoptimized
                                    />
                                    <Button
                                        onClick={() => deleteFileMutation.mutate({ fileUrl: url, fileIndex: index })}
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        variant="destructive"
                                        size="sm"
                                        disabled={deleteFileMutation.isPending}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            ) : (
                                <div className="border rounded-lg p-4">
                                    <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        View File {index + 1}
                                    </a>
                                    <Button
                                        onClick={() => deleteFileMutation.mutate({ fileUrl: url, fileIndex: index })}
                                        className="ml-4"
                                        variant="destructive"
                                        size="sm"
                                        disabled={deleteFileMutation.isPending}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div> */}

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">Delete Document</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your document and remove your data from our servers.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => deleteMutation.mutate()}
                                    className="bg-red-500 hover:bg-red-600"
                                    disabled={deleteMutation.isPending}
                                >
                                    {deleteMutation.isPending ? 'Deleting...' : 'Continue'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
            <div className="w-full h-full">
                {document.fileUrls?.map((url: string, index: number) => (
                    <div key={url} className="relative group">
                        {isImage(url) ? (
                            <div className="absolute w-full h-auto">
                                <Image
                                    src={getImageUrl(url)}
                                    alt={`File ${index + 1}`}
                                    width={500}
                                    height={500}
                                    className="object-cover w-full h-full"
                                    loading="lazy"
                                    quality={100}
                                    // fill
                                    // className="rounded-lg object-cover"
                                    // sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    unoptimized
                                />
                                <Button
                                    onClick={() => deleteFileMutation.mutate({ fileUrl: url, fileIndex: index })}
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    variant="destructive"
                                    size="sm"
                                    disabled={deleteFileMutation.isPending}
                                >
                                    Delete
                                </Button>
                            </div>
                        ) : (
                            <div className="border rounded-lg p-4">
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    View File {index + 1}
                                </a>
                                <Button
                                    onClick={() => deleteFileMutation.mutate({ fileUrl: url, fileIndex: index })}
                                    className="ml-4"
                                    variant="destructive"
                                    size="sm"
                                    disabled={deleteFileMutation.isPending}
                                >
                                    Delete
                                </Button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
}





