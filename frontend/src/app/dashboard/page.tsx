"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Loader2, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { TodoWidget } from '@/components/dashboard/widgets/TodoWidget';
import { ScheduleWidget } from '@/components/dashboard/widgets/ScheduleWidget';

interface DashboardStats {
    total_active_deals: number;
    closed_volume: number;
    win_rate: number;
    deals_by_status: { stage: string; count: number }[];
    recent_transactions: { id: number; property__address: string; value: number; stage: string; created_at: string }[];
    todays_schedule: { id: number; title: string; start_time: string; type: 'Call' | 'Meeting' | 'Email' | 'Other' }[];
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/dashboard/stats/');
                setStats(res.data);
            } catch (err) {
                setError('Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return <div className="p-8 text-red-500">{error}</div>;
    }

    if (!stats) return null;

    // Safe Formatting Functions
    const formatCurrency = (val: any) => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(Number(val) || 0);

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="space-y-4">
            {/* Top Metric Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Active Deals</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total_active_deals}</div>
                        <p className="text-xs text-muted-foreground">in pipeline</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Closed Volume</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.closed_volume)}</div>
                        <p className="text-xs text-muted-foreground">Year to Date</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.win_rate}%</div>
                        <p className="text-xs text-muted-foreground">Conversion</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts & Activity */}
            <div className="grid gap-4 md:grid-cols-12 h-[calc(100vh-220px)]">
                {/* Bar Chart */}
                <Card className="col-span-12 md:col-span-6 lg:col-span-6 flex flex-col">
                    <CardHeader>
                        <CardTitle>Deal Funnel</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2 flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.deals_by_status}>
                                <XAxis
                                    dataKey="stage"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px' }}
                                />
                                <Bar
                                    dataKey="count"
                                    fill="#2563eb"
                                    radius={[4, 4, 0, 0]}
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Widgets Column (Middle) */}
                <div className="col-span-12 md:col-span-3 lg:col-span-3 space-y-4">
                    <div className="h-[48%] max-h-[400px]">
                        <TodoWidget />
                    </div>
                    <div className="h-[48%] max-h-[400px]">
                        <ScheduleWidget events={stats.todays_schedule} />
                    </div>
                </div>

                {/* Recent Activity List */}
                <Card className="col-span-12 md:col-span-3 lg:col-span-3 flex flex-col">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto">
                        <div className="space-y-8">
                            {stats.recent_transactions.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-10">No recent activity.</p>
                            ) : (
                                stats.recent_transactions.map((deal) => (
                                    <div key={deal.id} className="flex items-center">
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">{deal.property__address}</p>
                                            <p className="text-xs text-muted-foreground">{deal.stage}</p>
                                        </div>
                                        <div className="ml-auto font-medium">
                                            {deal.stage === 'Closed Won' ? '+' : ''}{formatCurrency(deal.value)}
                                        </div>
                                        <div className="ml-4 text-xs text-gray-400">
                                            {formatDate(deal.created_at)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
