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

interface Deal {
    id: number;
    title: string;
    client_name: string;
    value: number;
    stage: 'NEW' | 'NEGOTIATION' | 'UNDER_CONTRACT' | 'CLOSED_WON' | 'CLOSED_LOST';
    created_at: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDeals = async () => {
        try {
            const res = await api.get('/api/deals/');
            setDeals(res.data);
        } catch (err: any) {
            if (err.response && err.response.status === 401) {
                router.push('/login');
            }
            console.error("Failed to fetch deals", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeals();
    }, [router]);

    if (loading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    // Dynamic Calculations
    const totalPipelineValue = deals.reduce((sum, deal) => sum + Number(deal.value), 0);
    const activeDealsCount = deals.filter(d => d.stage !== 'CLOSED_WON' && d.stage !== 'CLOSED_LOST').length;

    // Placeholder for Win Rate (can be improved later)
    const wonDeals = deals.filter(d => d.stage === 'CLOSED_WON').length;
    const lostDeals = deals.filter(d => d.stage === 'CLOSED_LOST').length;
    const closedTotal = wonDeals + lostDeals;
    const winRate = closedTotal > 0 ? Math.round((wonDeals / closedTotal) * 100) : 0;

    // Formatting currency
    const formatCurrency = (val: any) => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(Number(val) || 0);

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Helper for badge colors
    const getStageColor = (stage: string) => {
        switch (stage) {
            case 'NEW': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'NEGOTIATION': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'UNDER_CONTRACT': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'CLOSED_WON': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'CLOSED_LOST': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Calculate Data for Chart
    const dealsByStage = ['NEW', 'NEGOTIATION', 'UNDER_CONTRACT', 'CLOSED_WON', 'CLOSED_LOST'].map(stage => ({
        stage: stage.replace('_', ' '),
        count: deals.filter(d => d.stage === stage).length
    }));

    const cardClass = "bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300";

    return (
        <div className="space-y-6">

            {/* Top Metric Cards */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-3">

                {/* Metric 1 */}
                <div className={`${cardClass} p-6`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-800">Total Pipeline Value</h3>
                        <div className="bg-emerald-50 p-2 rounded-full">
                            <DollarSign className="h-5 w-5 text-emerald-600" />
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-emerald-600">{formatCurrency(totalPipelineValue)}</div>
                        <p className="text-sm text-gray-500 mt-1">All Deals</p>
                    </div>
                </div>

                {/* Metric 2 */}
                <div className={`${cardClass} p-6`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-800">Active Deals</h3>
                        <div className="bg-emerald-50 p-2 rounded-full">
                            <Activity className="h-5 w-5 text-emerald-600" />
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-800">{activeDealsCount}</div>
                        <p className="text-sm text-gray-500 mt-1">In Progress</p>
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
                        <div className="text-2xl font-bold text-gray-800">{winRate}%</div>
                        <p className="text-sm text-gray-500 mt-1">Closed Deals</p>
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
                            <BarChart data={dealsByStage}>
                                <XAxis
                                    dataKey="stage"
                                    stroke="#9ca3af"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    interval={0}
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
                    {/* Schedule Widget - Passing empty for now as requested to focus on Deals */}
                    <div className="flex-1">
                        <ScheduleWidget events={[]} className={`${cardClass} border-none shadow-none`} />
                    </div>
                </div>

                {/* Column 3: Recent Activity (Deals List) */}
                <div className={`${cardClass} p-6 flex flex-col h-full`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-800">Recent Deals</h3>
                        <AddDealModal onSuccess={fetchDeals} />
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2">
                        <div className="space-y-4">
                            {deals.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-10">No deals found.</p>
                            ) : (
                                deals.slice(0, 5).map((deal) => (
                                    <div key={deal.id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors group">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="text-sm font-semibold text-gray-900 truncate pr-2">{deal.title}</p>
                                            <p className="text-sm font-bold text-emerald-600 whitespace-nowrap">
                                                {formatCurrency(deal.value)}
                                            </p>
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <p className="text-xs text-gray-500">{deal.client_name}</p>
                                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${getStageColor(deal.stage)}`}>
                                                {deal.stage.replace('_', ' ')}
                                            </Badge>
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
