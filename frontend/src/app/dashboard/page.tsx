"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, TrendingUp, DollarSign, Activity, Calendar as CalendarIcon, ClipboardList, Clock } from 'lucide-react';
import { TodoWidget } from '@/components/dashboard/widgets/TodoWidget';
import { ScheduleWidget } from '@/components/dashboard/widgets/ScheduleWidget';
import { Badge } from "@/components/ui/badge";

import { AddDealModal } from '@/components/dashboard/AddDealModal';

export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // State for new analytics structure
    const [stats, setStats] = useState<any>(null);

    const fetchStats = async () => {
        try {
            const res = await api.get('/dashboard/stats/');
            setStats(res.data);
            setError(null);
        } catch (err: any) {
            console.error("Failed to fetch stats", err);
            const status = err.response?.status;
            const detail = err.response?.data?.detail || err.message;
            setError(`Error ${status}: ${detail}`);

            if (status === 401) {
                router.push('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [router]);

    if (loading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center flex-col gap-4">
                <p className="text-red-500">{error}</p>
                <button onClick={fetchStats} className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">
                    Retry
                </button>
            </div>
        );
    }

    if (!stats) return null;

    const { financials, pipeline, recent_activity, todays_schedule } = stats;

    const formatCurrency = (val: any) => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(Number(val) || 0);

    return (
        <div className="space-y-8">
            {/* 1. FINANCIAL HIGHLIGHTS (Transactions) */}
            <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Financial Overview</h2>
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">

                    {/* Total Sales Volume */}
                    <Card className="bg-white shadow-sm border-emerald-100">
                        <CardContent className="p-4">
                            <p className="text-xs font-medium text-gray-500 uppercase">Total Sales Volume</p>
                            <div className="text-xl font-bold text-emerald-700 mt-1">
                                {formatCurrency(financials.total_sales_volume)}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">Lifetime</p>
                        </CardContent>
                    </Card>

                    {/* Total Transactions */}
                    <Card className="bg-white shadow-sm border-blue-100">
                        <CardContent className="p-4">
                            <p className="text-xs font-medium text-gray-500 uppercase">Total Transactions</p>
                            <div className="text-xl font-bold text-blue-700 mt-1">
                                {financials.total_transactions}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">Lifetime</p>
                        </CardContent>
                    </Card>

                    {/* Current Year Volume */}
                    <Card className="bg-white shadow-sm border-indigo-100">
                        <CardContent className="p-4">
                            <p className="text-xs font-medium text-gray-500 uppercase">YTD Volume</p>
                            <div className="text-xl font-bold text-indigo-700 mt-1">
                                {formatCurrency(financials.current_year_volume)}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">{new Date().getFullYear()}</p>
                        </CardContent>
                    </Card>

                    {/* Current Year Count */}
                    <Card className="bg-white shadow-sm border-violet-100">
                        <CardContent className="p-4">
                            <p className="text-xs font-medium text-gray-500 uppercase">YTD Transactions</p>
                            <div className="text-xl font-bold text-violet-700 mt-1">
                                {financials.current_year_transactions}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">{new Date().getFullYear()}</p>
                        </CardContent>
                    </Card>

                    {/* Commission Due */}
                    <Card className="bg-white shadow-sm border-amber-100">
                        <CardContent className="p-4">
                            <p className="text-xs font-medium text-gray-500 uppercase">Commission Due</p>
                            <div className="text-xl font-bold text-amber-700 mt-1">
                                {formatCurrency(financials.commission_due)}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">Est. from Active</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 2. PIPELINE SNAPSHOT (Deals) */}
                <div className="md:col-span-2 flex flex-col gap-6">
                    <h2 className="text-lg font-semibold text-gray-800">Pipeline Performance</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <TrendingUp className="h-5 w-5 text-blue-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-600">Active Pipeline</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(pipeline.active_value)}</p>
                            <p className="text-xs text-gray-400 mt-1">{pipeline.active_count} active deals</p>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-emerald-50 rounded-lg">
                                    <Activity className="h-5 w-5 text-emerald-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-600">Win Rate</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{pipeline.win_rate}%</p>
                            <p className="text-xs text-gray-400 mt-1">Based on closed deals</p>
                        </div>

                        {/* Placeholder for future metric */}
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm opacity-60">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-gray-50 rounded-lg">
                                    <Clock className="h-5 w-5 text-gray-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-600">Avg. Close Time</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">-- days</p>
                            <p className="text-xs text-gray-400 mt-1">Coming soon</p>
                        </div>
                    </div>

                    {/* Recent Activity List */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex-1">
                        <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-800">Recent Transactions</h3>
                            <Badge variant="outline" className="text-xs font-normal">Last 5</Badge>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {recent_activity.length === 0 ? (
                                <p className="p-4 text-sm text-gray-400 text-center">No recent activity</p>
                            ) : (
                                recent_activity.map((t: any) => (
                                    <div key={t.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{t.name || t.property__address || 'Transaction'}</p>
                                            <p className="text-xs text-gray-500">{new Date(t.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-emerald-600">{formatCurrency(t.value)}</p>
                                            <Badge variant="secondary" className="text-[10px] mt-1">{t.stage}</Badge>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. SIDE WIDGETS */}
                <div className="space-y-6">
                    <TodoWidget />
                    <ScheduleWidget events={todays_schedule.map((e: any) => ({
                        ...e,
                        start: new Date(e.start_time),
                        end: new Date(new Date(e.start_time).getTime() + 60 * 60 * 1000) // 1 hr duration assumption
                    }))} />
                </div>
            </div>
        </div>
    );
}
