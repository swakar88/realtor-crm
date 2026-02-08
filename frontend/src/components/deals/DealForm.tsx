"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Plus } from 'lucide-react';
import { Property, Contact } from '@/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
} from "@/components/ui/select"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

const dealSchema = z.object({
    property: z.coerce.number().min(1, "Property is required"),
    contact: z.coerce.number().min(1, "Client is required"),
    stage: z.enum(['Prospect', 'Active', 'Under Contract', 'Closed Won', 'Closed Lost']),
    value: z.coerce.number().min(0, "Value must be positive"),
    close_date: z.string().optional(),
});

interface DealFormProps {
    onSuccess: () => void;
}

export function DealForm({ onSuccess }: DealFormProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [properties, setProperties] = useState<Property[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);

    const fetchData = async () => {
        try {
            const [propsRes, contactsRes] = await Promise.all([
                api.get('/properties/'),
                api.get('/contacts/')
            ]);
            setProperties(propsRes.data);
            setContacts(contactsRes.data);
        } catch (error) {
            console.error("Failed to load select options", error);
            toast.error("Could not load properties or contacts");
        }
    };

    useEffect(() => {
        if (open) {
            fetchData();
        }
    }, [open]);

    const form = useForm<z.infer<typeof dealSchema>>({
        resolver: zodResolver(dealSchema) as any,
        defaultValues: {
            stage: 'Prospect',
            value: 0,
            close_date: '',
            property: 0,
            contact: 0,
        },
    });

    async function onSubmit(values: z.infer<typeof dealSchema>) {
        setIsLoading(true);
        try {
            // Allow user to clear close_date if empty string? Zod optional handles it usually but API might need null
            const payload = {
                ...values,
                close_date: values.close_date || null
            };

            await api.post('/transactions/', payload);
            toast.success('Deal created successfully');
            setOpen(false);
            form.reset();
            onSuccess();
        } catch (error) {
            console.error('Failed to create deal', error);
            toast.error('Failed to create deal');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Deal
                </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto sm:max-w-[540px]">
                <SheetHeader>
                    <SheetTitle>Create New Deal</SheetTitle>
                    <SheetDescription>
                        Start a new transaction pipeline.
                    </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                            <FormField
                                control={form.control}
                                name="property"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Property</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select property" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {properties.map(p => (
                                                    <SelectItem key={p.id} value={p.id.toString()}>
                                                        {p.address} ({p.status})
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
                                        <FormLabel>Client / Contact</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select client" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {contacts.map(c => (
                                                    <SelectItem key={c.id} value={c.id.toString()}>
                                                        {c.first_name} {c.last_name} ({c.role})
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
                                name="stage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Pipeline Stage</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select stage" />
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

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="value"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Est. Deal Value ($)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="close_date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Exp. Close Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating Deal...
                                    </>
                                ) : (
                                    'Create Deal'
                                )}
                            </Button>
                        </form>
                    </Form>
                </div>
            </SheetContent>
        </Sheet>
    );
}
