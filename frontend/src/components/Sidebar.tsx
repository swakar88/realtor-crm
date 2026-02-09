"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    LayoutDashboard,
    Building2,
    Briefcase,
    Settings,
    LogOut,
    User,
    Calendar,
    X,
    Banknote,
    ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Transactions', href: '/dashboard/transactions', icon: Banknote },
        { name: 'Properties', href: '/dashboard/properties', icon: Building2 },
        { name: 'Contacts', href: '/dashboard/contacts', icon: User },
        { name: 'Deals', href: '/dashboard/deals', icon: Briefcase },
        { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ];

    if (user?.is_superuser) {
        navItems.splice(1, 0, { name: 'Admin Dashboard', href: '/dashboard/admin', icon: ShieldCheck });
    }

    return (
        <aside
            className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white shadow-lg transform transition-transform duration-300 ease-in-out",
                isOpen ? "translate-x-0" : "-translate-x-full",
                "md:translate-x-0"
            )}
        >
            <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
                <span className="text-xl font-bold tracking-tight">RealtorCRM</span>
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden text-slate-400 hover:text-white"
                    onClick={onClose}
                >
                    <X className="h-5 w-5" />
                </Button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                            )}
                            onClick={() => onClose()} // Close sidebar on mobile when link is clicked
                        >
                            <Icon className="mr-3 h-5 w-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-slate-800"
                    onClick={logout}
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    Sign Out
                </Button>
            </div>
        </aside>
    );
}
