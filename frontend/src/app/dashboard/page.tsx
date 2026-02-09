"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, TrendingUp, DollarSign, Activity, Calendar as CalendarIcon, ClipboardList, Clock } from 'lucide-react';
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
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
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

    const cardClass = "bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300";

    return (
        <div className="space-y-6">

            {/* Top Metric Cards */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-3">

                {/* Metric 1 */}
                <div className={`${cardClass} p-6`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-800">Total Active Deals</h3>
                        <div className="bg-emerald-50 p-2 rounded-full">
                            <Activity className="h-5 w-5 text-emerald-600" />
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-800">{stats.total_active_deals}</div>
                        <p className="text-sm text-gray-500 mt-1">in pipeline</p>
                    </div>
                </div>

                {/* Metric 2 */}
                <div className={`${cardClass} p-6`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-800">Closed Volume</h3>
                        <div className="bg-emerald-50 p-2 rounded-full">
                            <DollarSign className="h-5 w-5 text-emerald-600" />
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.closed_volume)}</div>
                        <p className="text-sm text-gray-500 mt-1">Year to Date</p>
                    </div>
                </div>

                {/* Metric 3 */}
                <div className={`${cardClass} p-6`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-800">Win Rate</h3>
                        <div className="bg-emerald-50 p-2 rounded-full">
                            <TrendingUp className="h-5 w-5 text-emerald-600" />
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-800">{stats.win_rate}%</div>
                        <p className="text-sm text-gray-500 mt-1">Conversion</p>
                    </div>
                </div>
            </div>

            {/* Main Content Grid: 3 Columns side-by-side on desktop, Stacked on Mobile */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 gap-y-6 min-h-[500px]">

                {/* Column 1: Deal Funnel */}
                <div className={`${cardClass} p-6 flex flex-col h-full`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-800">Deal Funnel</h3>
                        <TrendingUp className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.deals_by_status}>
                                <XAxis
                                    dataKey="stage"
                                    stroke="#9ca3af"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#9ca3af"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar
                                    dataKey="count"
                                    fill="#059669" /* emerald-600 */
                                    radius={[4, 4, 0, 0]}
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Column 2: Schedule & Tasks */}
                <div className="flex flex-col gap-6 h-full">
                    {/* Todo Widget */}
                    <div className="flex-1">
                        <TodoWidget className={`${cardClass} border-none shadow-none`} />
                    </div>
                    {/* Schedule Widget */}
                    <div className="flex-1">
                        <ScheduleWidget events={stats.todays_schedule} className={`${cardClass} border-none shadow-none`} />
                    </div>
                </div>

                {/* Column 3: Recent Activity */}
                <div className={`${cardClass} p-6 flex flex-col h-full`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-800">Recent Activity</h3>
                        <ClipboardList className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2">
                        <div className="space-y-6">
                            {stats.recent_transactions.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-10">No recent activity.</p>
                            ) : (
                                stats.recent_transactions.map((deal) => (
                                    <div key={deal.id} className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center mr-4">
                                            <DollarSign className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{deal.property__address}</p>
                                            <p className="text-xs text-gray-500">{deal.stage}</p>
                                        </div>
                                        <div className="text-right ml-4">
                                            <p className="text-sm font-bold text-emerald-600">
                                                {deal.stage === 'Closed Won' ? '+' : ''}{formatCurrency(deal.value)}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {formatDate(deal.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
