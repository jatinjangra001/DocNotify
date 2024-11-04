'use client'
import React from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { firestore } from "@/app/firebase/firebaseConfig";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { UserProfile } from "@/lib/firebase/user";
import { CalendarRange, FileText, Bell, Clock, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { LucideIcon } from 'lucide-react'

// Types
interface Document {
    id: string;
    title: string;
    expiryDate: string;
    createdAt: any;
    reminders: boolean;
}

interface DashboardStats {
    totalDocs: number;
    expiringDocs: number;
    activeReminders: number;
}
interface StatCardProps {
    icon: LucideIcon;
    title: string;
    value: number;
    description: string;
}


// Fetch functions
const fetchUserProfile = async (uid: string) => {
    const docRef = doc(firestore, "users", uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error("User profile not found");
    return { uid, ...docSnap.data() } as UserProfile;
};

const fetchRecentDocuments = async (uid: string) => {
    const docsRef = collection(firestore, "users", uid, "documents");
    const q = query(docsRef, orderBy("createdAt", "desc"), limit(5));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Document[];
};

const fetchDashboardStats = async (uid: string) => {
    const docsRef = collection(firestore, "users", uid, "documents");
    const querySnapshot = await getDocs(docsRef);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.setDate(now.getDate() + 30));

    const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Document[];
    const stats: DashboardStats = {
        totalDocs: docs.length,
        expiringDocs: docs.filter(doc => new Date(doc.expiryDate) <= thirtyDaysFromNow).length,
        activeReminders: docs.filter(doc => doc.reminders).length,
    };

    return stats;
};

// Components
const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, description }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);

interface RecentDocumentsListProps {
    documents: Document[];
}

const RecentDocumentsList: React.FC<RecentDocumentsListProps> = ({ documents }) => (
    <div className="space-y-4">
        {documents.map((doc) => (
            <Card key={doc.id}>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <FileText className="h-6 w-6 text-blue-500" />
                            <div>
                                <h3 className="font-medium">{doc.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                    Expires: {format(new Date(doc.expiryDate), "PP")}
                                </p>
                            </div>
                        </div>
                        <Link href={`/dashboard/docs/${doc.id}`}>
                            <Button variant="outline" size="sm">View</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        ))}
    </div>
);

// Main Dashboard Component
export default function DashboardPage() {
    const { user, isLoaded: isUserLoaded } = useUser();

    const { data: userData, isLoading: isUserLoading } = useQuery({
        queryKey: ["userProfile", user?.id],
        queryFn: () => fetchUserProfile(user?.id || ""),
        enabled: !!user?.id,
    });

    const { data: recentDocs, isLoading: isDocsLoading } = useQuery({
        queryKey: ["recentDocuments", user?.id],
        queryFn: () => fetchRecentDocuments(user?.id || ""),
        enabled: !!user?.id,
    });

    const { data: stats, isLoading: isStatsLoading } = useQuery({
        queryKey: ["dashboardStats", user?.id],
        queryFn: () => fetchDashboardStats(user?.id || ""),
        enabled: !!user?.id,
    });

    if (!isUserLoaded || isUserLoading || isDocsLoading || isStatsLoading) {
        return (
            <div className="space-y-4 p-4">
                <Skeleton className="h-8 w-[200px]" />
                <div className="grid gap-4 md:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-[120px]" />
                    ))}
                </div>
                <Skeleton className="h-[300px]" />
            </div>
        );
    }

    return (
        <div className="space-y-8 p-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Welcome back, {user?.firstName}
                    </h1>
                    <p className="text-muted-foreground">
                        Here's an overview of your documents and upcoming expirations.
                    </p>
                </div>
                <Link href="/dashboard/addDocument">
                    <Button>Add New Document</Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                    icon={FileText}
                    title="Total Documents"
                    value={stats?.totalDocs || 0}
                    description="Total documents in your storage"
                />
                <StatCard
                    icon={AlertTriangle}
                    title="Expiring Soon"
                    value={stats?.expiringDocs || 0}
                    description="Documents expiring in next 30 days"
                />
                <StatCard
                    icon={Bell}
                    title="Active Reminders"
                    value={stats?.activeReminders || 0}
                    description="Documents with active notifications"
                />
            </div>

            {/* Document Expiry Timeline */}
            <Card>
                <CardHeader>
                    <CardTitle>Document Timeline</CardTitle>
                    <CardDescription>Overview of your document expiration dates</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentDocs?.map((doc) => {
                            const daysUntilExpiry = Math.ceil(
                                (new Date(doc.expiryDate).getTime() - new Date().getTime()) /
                                (1000 * 60 * 60 * 24)
                            );
                            const progress = Math.max(0, Math.min(100, (daysUntilExpiry / 365) * 100));

                            return (
                                <div key={doc.id} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>{doc.title}</span>
                                        <span>{daysUntilExpiry} days left</span>
                                    </div>
                                    <Progress value={progress} className="h-2" />
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Documents */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Documents</CardTitle>
                    <CardDescription>Your latest added documents</CardDescription>
                </CardHeader>
                <CardContent>
                    {recentDocs?.length ? (
                        <RecentDocumentsList documents={recentDocs} />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <FileText className="h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-semibold">No documents yet</h3>
                            <p className="text-sm text-gray-500">
                                Add your first document to get started
                            </p>
                            <Link href="/dashboard/addDocument" className="mt-4">
                                <Button>Add Document</Button>
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}