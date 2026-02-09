"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { format } from 'date-fns';
import {
    Loader2,
    Search,
    Plus,
    Archive,
    Trash2,
    FileEdit,
    Filter,
    ArrowUpFromLine
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { AddTransactionModal } from '@/components/dashboard/AddTransactionModal';

interface Transaction {
    id: number;
    name: string;
    value: number;
    close_date: string;
    type_name?: string;
    status_name?: string;
    stage: string;
    property_type?: string;
    is_archived: boolean;
    created_at: string;
}

export default function TransactionsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showArchived, setShowArchived] = useState(false);

    const fetchTransactions = async () => {
        try {
            const res = await api.get('/transactions/');
            setTransactions(res.data);
        } catch (error) {
            console.error("Failed to fetch transactions", error);
            toast.error("Failed to load transactions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push('/login');
                return;
            }
            fetchTransactions();
        }
    }, [user, authLoading, router]);

    const handleArchiveToggle = async (id: number, currentStatus: boolean) => {
        try {
            await api.patch(`/transactions/${id}/`, { is_archived: !currentStatus });
            toast.success(currentStatus ? "Transaction unarchived" : "Transaction archived");
            fetchTransactions(); // Refresh
        } catch (error) {
            console.error("Failed to update archive status", error);
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this transaction?")) return;
        try {
            await api.delete(`/transactions/${id}/`);
            toast.success("Transaction deleted");
            setTransactions(prev => prev.filter(tx => tx.id !== id));
        } catch (error) {
            console.error("Failed to delete transaction", error);
            toast.error("Failed to delete");
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    const filteredTransactions = transactions.filter(tx => {
        const matchesSearch = tx.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (tx.status_name && tx.status_name.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesArchive = showArchived ? true : !tx.is_archived;
        return matchesSearch && matchesArchive;
    });

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(val);
    };

    // Helper to format Property Type (Single Family -> SF)
    const formatPropertyType = (type?: string) => {
        if (!type) return '-';
        if (type === 'Single Family') return 'SF';
        if (type === 'Multi-Family') return 'MF';
        if (type === 'Condo') return 'CO';
        if (type === 'Townhouse') return 'TH';
        if (type === 'Land') return 'LD';
        return type.substring(0, 2).toUpperCase();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Transactions</h1>

                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="flex items-center space-x-2">
                        <Switch id="show-archived" checked={showArchived} onCheckedChange={setShowArchived} />
                        <Label htmlFor="show-archived" className="text-sm text-gray-600">Show Archived</Label>
                    </div>

                    <AddTransactionModal onSuccess={fetchTransactions} />
                </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search transactions..."
                        className="pl-8 bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 hover:bg-gray-50">
                                    <TableHead className="font-bold text-gray-700 w-[35%]">Transaction Name</TableHead>
                                    <TableHead className="font-bold text-gray-700">Type</TableHead>
                                    <TableHead className="font-bold text-gray-700">Price</TableHead>
                                    <TableHead className="font-bold text-gray-700">Status</TableHead>
                                    <TableHead className="font-bold text-gray-700 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTransactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                                            No transactions found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTransactions.map((tx) => (
                                        <TableRow key={tx.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 group">
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2 group cursor-pointer">
                                                    <a href="#" className="text-blue-600 hover:underline flex items-center gap-1 font-semibold">
                                                        {tx.name}
                                                        <FileEdit className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />
                                                    </a>
                                                    {tx.is_archived && (
                                                        <Badge variant="secondary" className="text-[10px] bg-gray-100 text-gray-500">Archived</Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-600">
                                                {formatPropertyType(tx.property_type)}
                                            </TableCell>
                                            <TableCell className="font-bold text-gray-700">
                                                {formatCurrency(tx.value)}
                                            </TableCell>
                                            <TableCell>
                                                {/* Logic for badges based on status/stage */}
                                                <Badge
                                                    className={
                                                        tx.stage === 'Active'
                                                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none rounded-md font-medium"
                                                            : "bg-slate-800 text-white hover:bg-slate-700 border-none rounded-md font-normal"
                                                    }
                                                >
                                                    {tx.status_name || tx.stage || 'Unknown'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-gray-400 hover:text-blue-600"
                                                        onClick={() => handleArchiveToggle(tx.id, tx.is_archived)}
                                                        title={tx.is_archived ? "Unarchive" : "Archive"}
                                                    >
                                                        <ArrowUpFromLine className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-gray-400 hover:text-red-600"
                                                        onClick={() => handleDelete(tx.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
