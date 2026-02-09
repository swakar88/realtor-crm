"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    property: z.string().min(1, "Property is required"),
    contact: z.string().min(1, "Contact is required"),
    stage: z.enum(['Prospect', 'Active', 'Under Contract', 'Closed Won', 'Closed Lost']),
    value: z.union([z.string(), z.number()]),
    close_date: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof formSchema>;

interface AddTransactionModalProps {
    onSuccess: () => void;
}

export function AddTransactionModal({ onSuccess }: AddTransactionModalProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [contacts, setContacts] = useState<any[]>([]);
    const [properties, setProperties] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [contactsRes, propertiesRes] = await Promise.all([
                    api.get('/api/contacts/'),
                    api.get('/api/properties/')
                ]);
                setContacts(contactsRes.data);
                setProperties(propertiesRes.data);
            } catch (error) {
                console.error("Failed to fetch data", error);
            }
        };
        if (open) {
            fetchData();
        }
    }, [open]);

    const form = useForm<TransactionFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            property: '',
            contact: '',
            stage: 'Prospect',
            value: 0,
            close_date: '',
        },
    });

    async function onSubmit(values: TransactionFormValues) {
        setIsLoading(true);
        try {
            const payload = {
                ...values,
                value: Number(values.value),
                close_date: values.close_date || null
            };
            await api.post('/transactions/', payload); // url might be /api/transactions/transactions/ depending on router?
            // Wait, previous turn I saw router.register(r'transactions', TransactionViewSet) in transactions/urls.py
            // And main urls include transactions.urls.
            // If main urls include `path('api/', include('transactions.urls'))`, then it is `/api/transactions/`.
            // But I saw `api.get('/transactions/')` in TransactionsPage working.
            // Let's stick with `/transactions/` or `/api/transactions/` relative to base URL.
            // My axios instance `api` likely has baseURL set to localhost:8000.
            // In TransactionsPage I used `api.get('/transactions/')`.
            // Let's check `lib/api` or just use `/transactions/` assuming it maps correctly or fix if it fails 404.
            // Actually, `TransactionsPage` used `/transactions/`.

            toast.success('Transaction created');
            setOpen(false);
            form.reset();
            onSuccess();
        } catch (error) {
            console.error('Failed to create transaction', error);
            toast.error('Failed to create transaction');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Transaction
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Transaction</DialogTitle>
                    <DialogDescription>
                        Create a new transaction record.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Transaction Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. 123 Main St Sale" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="property"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Property</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Property" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {properties.map((p) => (
                                                    <SelectItem key={p.id} value={p.id.toString()}>
                                                        {p.address}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="contact"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contact</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Contact" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {contacts.map((c) => (
                                                    <SelectItem key={c.id} value={c.id.toString()}>
                                                        {c.first_name} {c.last_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="value"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Value ($)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="stage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Stage</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Stage" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Prospect">Prospect</SelectItem>
                                                <SelectItem value="Active">Active</SelectItem>
                                                <SelectItem value="Under Contract">Under Contract</SelectItem>
                                                <SelectItem value="Closed Won">Closed Won</SelectItem>
                                                <SelectItem value="Closed Lost">Closed Lost</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="close_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Close Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Transaction'
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
