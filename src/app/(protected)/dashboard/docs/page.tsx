"use client";
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore';
import { firestore } from '@/app/firebase/firebaseConfig';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from 'next/link';
import { FileText, Calendar, Bell, Search, Plus, Filter } from 'lucide-react';
import { format } from 'date-fns';

interface Document {
    id: string;
    title: string;
    description: string;
    expiryDate: string;
    createdAt: any;
    reminders: boolean;
    fileUrls?: string[];
}

export default function DocumentsPage() {
    const { user, isLoaded } = useUser();
    const { toast } = useToast();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBy, setFilterBy] = useState<'all' | 'active' | 'expired'>('all');
    const [sortBy, setSortBy] = useState<'created' | 'expiry'>('created');

    useEffect(() => {
        const fetchDocuments = async () => {
            if (!isLoaded || !user?.id) return;

            try {
                const docsRef = collection(firestore, 'users', user.id, 'documents');
                const q = query(docsRef, orderBy('createdAt', 'desc'));
                const querySnapshot = await getDocs(q);

                const docs = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Document[];

                setDocuments(docs);
            } catch (error) {
                console.error('Error fetching documents:', error);
                toast({
                    title: "Error",
                    description: "Failed to fetch documents",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDocuments();
    }, [user?.id, isLoaded]);

    const filteredAndSortedDocs = documents
        .filter(doc => {
            const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.description.toLowerCase().includes(searchTerm.toLowerCase());
            const isExpired = new Date(doc.expiryDate) < new Date();

            switch (filterBy) {
                case 'active':
                    return !isExpired && matchesSearch;
                case 'expired':
                    return isExpired && matchesSearch;
                default:
                    return matchesSearch;
            }
        })
        .sort((a, b) => {
            if (sortBy === 'created') {
                return b.createdAt.seconds - a.createdAt.seconds;
            } else {
                return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
            }
        });

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Your Documents</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage and track your important documents
                    </p>
                </div>
                <Link href="/dashboard/addDocument">
                    <Button className="mt-4 md:mt-0">
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Document
                    </Button>
                </Link>
            </div>

            {/* Filters and Search Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                        placeholder="Search documents..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={filterBy} onValueChange={(value: 'all' | 'active' | 'expired') => setFilterBy(value)}>
                    <SelectTrigger>
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Documents</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(value: 'created' | 'expiry') => setSortBy(value)}>
                    <SelectTrigger>
                        <Calendar className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="created">Created Date</SelectItem>
                        <SelectItem value="expiry">Expiry Date</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
                </div>
            ) : filteredAndSortedDocs.length === 0 ? (
                <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-semibold">No documents found</h3>
                    <p className="text-muted-foreground">
                        {searchTerm
                            ? "Try adjusting your search or filters"
                            : "Start by adding your first document"}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAndSortedDocs.map((doc) => {
                        const isExpired = new Date(doc.expiryDate) < new Date();
                        return (
                            <Link href={`/dashboard/docs/${doc.id}`} key={doc.id}>
                                <Card className={`hover:shadow-lg transition-shadow ${isExpired ? 'border-red-200' : ''}`}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            <span className="truncate">{doc.title}</span>
                                            {doc.reminders && <Bell className="h-4 w-4 text-green-500" />}
                                        </CardTitle>
                                        <CardDescription className="truncate">
                                            {doc.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center">
                                                <FileText className="h-4 w-4 mr-2" />
                                                {doc.fileUrls?.length || 0} files
                                            </div>
                                            <div className={`px-2 py-1 rounded-full text-xs ${isExpired
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-green-100 text-green-800'
                                                }`}>
                                                {isExpired ? 'Expired' : 'Active'}
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="text-sm text-muted-foreground">
                                        Expires: {format(new Date(doc.expiryDate), 'PPP')}
                                    </CardFooter>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}