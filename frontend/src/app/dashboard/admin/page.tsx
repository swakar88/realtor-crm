import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users, Shield, UserCheck, Clock, TrendingUp, BarChart3, Activity } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface UserData {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    date_joined: string;
    is_superuser: boolean;
}

interface PlatformStats {
    total_agents: number;
    total_deals: number;
    avg_deals_per_agent: number;
    new_agents_week: number;
}

export default function AdminDashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<UserData[]>([]);
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            if (!user?.is_superuser) {
                router.push('/dashboard');
                return;
            }

            const fetchData = async () => {
                try {
                    const [usersRes, statsRes] = await Promise.all([
                        api.get('/accounts/users/'),
                        api.get('/accounts/platform-stats/')
                    ]);
                    setUsers(usersRes.data);
                    setStats(statsRes.data);
                } catch (error) {
                    console.error("Failed to fetch admin data", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [user, authLoading, router]);

    if (authLoading || loading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    const cardClass = "bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden text-gray-800 p-6";

    return (
        <div className="space-y-8 text-gray-800">
            <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>

            {/* Platform Overview */}
            {stats && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-700">Platform Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card className={cardClass}>
                            <div className="flex items-center justify-between space-y-0 pb-2">
                                <span className="text-sm font-medium text-gray-500">Total Agents</span>
                                <Users className="h-4 w-4 text-emerald-600" />
                            </div>
                            <div className="text-2xl font-bold">{stats.total_agents}</div>
                        </Card>
                        <Card className={cardClass}>
                            <div className="flex items-center justify-between space-y-0 pb-2">
                                <span className="text-sm font-medium text-gray-500">Total Deals</span>
                                <BarChart3 className="h-4 w-4 text-emerald-600" />
                            </div>
                            <div className="text-2xl font-bold">{stats.total_deals}</div>
                        </Card>
                        <Card className={cardClass}>
                            <div className="flex items-center justify-between space-y-0 pb-2">
                                <span className="text-sm font-medium text-gray-500">Avg Deals / Agent</span>
                                <Activity className="h-4 w-4 text-emerald-600" />
                            </div>
                            <div className="text-2xl font-bold">{stats.avg_deals_per_agent}</div>
                        </Card>
                        <Card className={cardClass}>
                            <div className="flex items-center justify-between space-y-0 pb-2">
                                <span className="text-sm font-medium text-gray-500">New (7 Days)</span>
                                <TrendingUp className="h-4 w-4 text-emerald-600" />
                            </div>
                            <div className="text-2xl font-bold">{stats.new_agents_week}</div>
                        </Card>
                    </div>
                </div>
            )}

            {/* User Roster */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-700">User Roster</h2>
                    <Badge variant="outline" className="text-gray-500">{users.length} Users</Badge>
                </div>

                <Card className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 hover:bg-gray-50">
                                    <TableHead className="font-bold text-gray-700">Name</TableHead>
                                    <TableHead className="font-bold text-gray-700">Email</TableHead>
                                    <TableHead className="font-bold text-gray-700">Role</TableHead>
                                    <TableHead className="font-bold text-gray-700">Status</TableHead>
                                    <TableHead className="font-bold text-gray-700">Joined</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((u) => (
                                    <TableRow key={u.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                                        <TableCell className="font-medium">
                                            {u.first_name} {u.last_name}
                                        </TableCell>
                                        <TableCell>{u.email}</TableCell>
                                        <TableCell>
                                            {u.is_superuser ? (
                                                <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-none">
                                                    Admin
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-gray-600 border-gray-300">
                                                    User
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {u.is_active ? (
                                                <Badge className="bg-emerald-100 text-emerald-700 border-none hover:bg-emerald-200">
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="destructive" className="bg-red-100 text-red-700 border-none hover:bg-red-200">
                                                    Inactive
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-gray-500">
                                            {new Date(u.date_joined).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
