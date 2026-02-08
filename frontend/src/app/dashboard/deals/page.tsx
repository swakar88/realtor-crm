"use client";

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Deal, Property, Contact } from '@/types';
import { DealForm } from '@/components/deals/DealForm';
import { Loader2, DollarSign, Calendar } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Extend Deal type locally or assume the lists are joined in frontend 
// Since API returns IDs (as discussed), we need to fetch all props/contacts to map them
// OR we assume separate fetches. 
// For simplicity in this step, I will fetch all and map in frontend.
// In a real app with pagination, we'd use `expand` or nested serializer.

export default function DealsPage() {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchDeals = async () => {
        setLoading(true);
        try {
            // Parallel fetch to resolve IDs
            const [dealsRes, propsRes, contactsRes] = await Promise.all([
                api.get('/transactions/'),
                api.get('/properties/'),
                api.get('/contacts/')
            ]);
            setDeals(dealsRes.data);
            setProperties(propsRes.data);
            setContacts(contactsRes.data);
            setError('');
        } catch (err) {
            console.error("Failed to fetch deals data", err);
            setError("Failed to load deals.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeals();
    }, []);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(val);
    };

    const getStageColor = (stage: string) => {
        switch (stage) {
            case 'Prospect': return 'secondary';
            case 'Active': return 'default'; // blue/black
            case 'Under Contract': return 'warning'; // map to yellow if custom, else default
            case 'Closed Won': return 'success'; // map to green
            case 'Closed Lost': return 'destructive'; // red
            default: return 'outline';
        }
    };

    // Helpers to resolve IDs
    const getPropertyAddress = (id: number) => properties.find(p => p.id === id)?.address || 'Unknown Property';
    const getContactName = (id: number) => {
        const c = contacts.find(c => c.id === id);
        return c ? `${c.first_name} ${c.last_name}` : 'Unknown Client';
    };

    if (loading && deals.length === 0) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Deals Pipeline</h2>
                    <p className="text-muted-foreground">
                        Track your active transactions and revenue.
                    </p>
                </div>
                <DealForm onSuccess={fetchDeals} />
            </div>

            {error && <div className="text-red-500">{error}</div>}

            <div className="rounded-md border bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Stage</TableHead>
                            <TableHead>Property</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Close Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {deals.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No deals found. Create a new deal to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            deals.map((deal) => (
                                <TableRow key={deal.id} className="cursor-pointer hover:bg-slate-50">
                                    <TableCell>
                                        <Badge variant={(getStageColor(deal.stage) === 'success' || getStageColor(deal.stage) === 'warning') ? 'default' : getStageColor(deal.stage) as any} className={
                                            deal.stage === 'Closed Won' ? 'bg-green-600 hover:bg-green-700' :
                                                deal.stage === 'Under Contract' ? 'bg-amber-500 hover:bg-amber-600' : ''
                                        }>
                                            {deal.stage}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {getPropertyAddress(deal.property)}
                                    </TableCell>
                                    <TableCell>
                                        {getContactName(deal.contact)}
                                    </TableCell>
                                    <TableCell className="font-mono">
                                        {formatCurrency(deal.value)}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        <span className="flex items-center">
                                            <Calendar className="mr-2 h-3 w-3" />
                                            {deal.close_date || '-'}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
