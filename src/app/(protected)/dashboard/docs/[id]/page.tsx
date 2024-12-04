'use client';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { firestore, storage } from '@/app/firebase/firebaseConfig';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject, getDownloadURL } from 'firebase/storage';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { BellOff, BellRing, Download } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { PDFViewer } from '@/components/ui/PDFViewer';
import { FC } from 'react';

interface Document {
    id: string;
    title: string;
    description: string;
    expiryDate: string;
    reminders: boolean;
    fileUrls?: string[];
    docIds?: string[];
}

interface FileItemProps {
    url: string;
    index: number;
    onDelete: () => void;
    isDeleting: boolean;
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

const FileItem: FC<FileItemProps> = ({ url, index, onDelete, isDeleting }) => {
    const isImage = (urlToCheck: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(urlToCheck.split('?')[0].toLowerCase());
    const isPDF = (urlToCheck: string) => /\.(pdf)$/i.test(urlToCheck.split('?')[0].toLowerCase());

    const handleDownload = async () => {
        try {
            const downloadUrl = await getDownloadURL(ref(storage, url));

            // Use browser-native method to trigger download
            const link = document.createElement('a');
            link.href = downloadUrl;

            // Extract filename from URL or generate a default
            const filename = url.substring(url.lastIndexOf('/') + 1).split('?')[0] || `file_${index + 1}`;
            link.download = filename;

            // Append to body, click, and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto mb-6 relative group">
            {isImage(url) ? (
                <div className="relative w-full">
                    <Image
                        src={url}
                        alt={`File ${index + 1}`}
                        width={1200}
                        height={800}
                        className="w-full h-auto object-contain rounded-lg shadow-lg"
                        loading="lazy"
                        quality={100}
                        unoptimized
                    />
                    <div className="absolute top-4 right-4 flex space-x-2">
                        <Button
                            onClick={handleDownload}
                            variant="secondary"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                        </Button>
                        <Button
                            onClick={onDelete}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            variant="destructive"
                            size="sm"
                            disabled={isDeleting}
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            ) : isPDF(url) ? (
                <div className="w-full border rounded-lg overflow-hidden shadow-lg">
                    <PDFViewer
                        url={`${url.split('?')[0]}?alt=media`}
                        fileName={`File ${index + 1}`}
                    />
                    <div className="p-2 flex justify-end space-x-2">
                        <Button
                            onClick={onDelete}
                            variant="destructive"
                            size="sm"
                            disabled={isDeleting}
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="w-full border rounded-lg p-4 flex justify-between items-center">
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 truncate"
                    >
                        View File {index + 1}
                    </a>
                    <div className="flex space-x-2">
                        <Button
                            onClick={onDelete}
                            variant="destructive"
                            size="sm"
                            disabled={isDeleting}
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
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
            return null;
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

    // Toggle reminders function
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
        <div className="container mx-auto p-4 max-w-4xl">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h1 className="text-2xl font-bold mb-4">
                    {document.title} {isExpired && <span className="text-red-500">(Expired)</span>}
                </h1>

                <p className="mb-4">{document.description}</p>

                <p className="mb-4">
                    Expiry Date: {new Date(document.expiryDate).toLocaleDateString()}
                </p>

                <div className="flex space-x-4 mb-4">
                    <Button
                        onClick={handleToggleReminders}
                        variant="outline"
                        className="flex items-center gap-2"
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

            <div className="space-y-6">
                {document.fileUrls?.map((url: string, index: number) => (
                    <FileItem
                        key={url}
                        url={url}
                        index={index}
                        onDelete={() => deleteFileMutation.mutate({ fileUrl: url, fileIndex: index })}
                        isDeleting={deleteFileMutation.isPending}
                    />
                ))}
            </div>
        </div>
    );
}