//app/(protected)/layout.tsx
"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    Bell,
    FilePlus2,
    FileStack,
    Home,
    Menu,
    Package2,
    Search,
    User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserButton } from "@clerk/nextjs";

interface DashboardLayoutProps {
    children?: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();
    const [activeLink, setActiveLink] = useState("");

    useEffect(() => {
        // Determine active link based on the current pathname
        if (pathname.startsWith("/dashboard/docs")) {
            setActiveLink("docs");
        } else if (pathname.startsWith("/dashboard/profile")) {
            setActiveLink("profile");
        } else if (pathname === "/dashboard") {
            setActiveLink("dashboard");
        }
    }, [pathname]);

    const handleLinkClick = (link: string) => {
        setActiveLink(link);
    };

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            {/* Sidebar */}
            <div className="sticky top-0 hidden h-screen border-r bg-muted/40 md:block">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                        <Link href="/" className="flex items-center gap-2 font-semibold">
                            <Package2 className="h-6 w-6" />
                            <span>DocNotify</span>
                        </Link>
                        <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
                            <Bell className="h-4 w-4" />
                            <span className="sr-only">Toggle notifications</span>
                        </Button>
                    </div>
                    <div className="flex-1">
                        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                            <Link href={"/dashboard"} onClick={() => handleLinkClick("dashboard")} className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${activeLink === "dashboard" ? "bg-muted text-primary" : "text-muted-foreground"}`}>
                                <Home className="h-4 w-4" />
                                Dashboard
                            </Link>
                            <Link href={"/dashboard/addDocument"} onClick={() => handleLinkClick("profile")} className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${activeLink === "profile" ? "bg-muted text-primary" : "text-muted-foreground"}`}>
                                <FilePlus2 className="h-4 w-4" />
                                Add Document
                            </Link>
                            <Link href={"/dashboard/docs"} onClick={() => handleLinkClick("docs")} className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${activeLink === "docs" ? "bg-muted text-primary" : "text-muted-foreground"}`}>
                                <FileStack className="h-4 w-4" />
                                Docs
                            </Link>
                        </nav>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex flex-col">
                {/* Header */}
                <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col">
                            <nav className="grid gap-2 text-lg font-medium">
                                <Link href={"/dashboard"} onClick={() => handleLinkClick("dashboard")} className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 transition-all hover:text-foreground ${activeLink === "dashboard" ? "bg-muted text-foreground" : "text-muted-foreground"}`}>
                                    <Home className="h-5 w-5" />
                                    Dashboard
                                </Link>
                                <Link href={"/dashboard/addDocument"} onClick={() => handleLinkClick("profile")} className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 transition-all hover:text-foreground ${activeLink === "profile" ? "bg-muted text-foreground" : "text-muted-foreground"}`}>
                                    <FilePlus2 className="h-5 w-5" />
                                    Add Document
                                </Link>
                                <Link href={"/dashboard/docs"} onClick={() => handleLinkClick("docs")} className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 transition-all hover:text-foreground ${activeLink === "docs" ? "bg-muted text-foreground" : "text-muted-foreground"}`}>
                                    <FileStack className="h-5 w-5" />
                                    Docs
                                </Link>
                            </nav>
                        </SheetContent>
                    </Sheet>
                    <div className="w-full flex-1">
                        <form>
                            <div className="relative">
                                {/* <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search docs..."
                                    className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                                /> */}
                            </div>
                        </form>
                    </div>
                    <UserButton />
                </header>

                {/* Children scrollable content */}
                <main className="flex flex-1 flex-col overflow-y-auto gap-4 p-4 lg:gap-6 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
