"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    LayoutDashboard,
    Building2,
    Briefcase,
    Settings,
    User,
    Calendar,
    Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button'; // Ensure this exists or import from source
import { cn } from '@/lib/utils';
import { Sidebar } from '@/components/Sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuth();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Helper to get current page title (duplicate logic, but needed for header)
    const getPageTitle = () => {
        const navItems = [
            { name: 'Dashboard', href: '/dashboard' },
            { name: 'Properties', href: '/dashboard/properties' },
            { name: 'Contacts', href: '/dashboard/contacts' },
            { name: 'Deals', href: '/dashboard/deals' },
            { name: 'Calendar', href: '/dashboard/calendar' },
            { name: 'Settings', href: '/dashboard/settings' },
        ];
        return navItems.find(item => item.href === pathname)?.name || 'Dashboard';
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Mobile Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main Content */}
            <main className="flex-1 md:pl-64 transition-all duration-300 min-h-screen flex flex-col">
                {/* Header */}
                <header className="sticky top-0 z-30 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-8 shadow-sm">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu className="h-6 w-6 text-slate-600" />
                        </Button>
                        <h1 className="text-lg font-semibold text-slate-800">
                            {getPageTitle()}
                        </h1>
                    </div>

                    <Link href="/dashboard/settings" className="flex items-center gap-4 hover:bg-gray-100 p-2 rounded-lg transition-colors group">
                        <span className="hidden md:inline text-sm font-medium text-slate-600 group-hover:text-slate-900">
                            Welcome, {user?.first_name || user?.username || 'Agent'}
                        </span>
                        <div className="bg-primary/10 p-2 rounded-full group-hover:bg-primary/20 transition-colors">
                            <User className="h-5 w-5 text-primary" />
                        </div>
                    </Link>
                </header>

                {/* Page Content */}
                <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}

