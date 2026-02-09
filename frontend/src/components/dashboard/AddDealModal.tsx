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

const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    contact_id: z.string().min(1, "Client is required"),
    value: z.union([z.string(), z.number()]),
    stage: z.enum(['NEW', 'NEGOTIATION', 'UNDER_CONTRACT', 'CLOSED_WON', 'CLOSED_LOST']),
    closing_date: z.string().optional(),
});

interface AddDealModalProps {
    onSuccess: () => void;
}

export function AddDealModal({ onSuccess }: AddDealModalProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [contacts, setContacts] = useState<any[]>([]);

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const res = await api.get('/api/contacts/');
                setContacts(res.data);
            } catch (error) {
                console.error("Failed to fetch contacts", error);
            }
        };
        fetchContacts();
    }, []);

    type DealFormValues = z.infer<typeof formSchema>;

    const form = useForm<DealFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            contact_id: '',
            value: 0,
            stage: 'NEW',
            closing_date: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            // Convert empty date string to null if needed, but Django DRF usually handles blank string for DateField as error if not null=True, blank=True? 
            // Our model has null=True, blank=True. Let's send null if empty.
            const payload = {
                ...values,
                value: Number(values.value),
                closing_date: values.closing_date || null
            };

            await api.post('/api/deals/', payload);
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
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Deal
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Deal</DialogTitle>
                    <DialogDescription>
                        Enter the details of the new deal below.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Deal Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. 123 Maple Ave" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="contact_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Client</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a client" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {contacts.map((contact) => (
                                                <SelectItem key={contact.id} value={contact.id.toString()}>
                                                    {contact.first_name} {contact.last_name}
                                                </SelectItem>
                                            ))}
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
                                name="closing_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Closing Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="stage"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Stage</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select stage" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="NEW">New</SelectItem>
                                            <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
                                            <SelectItem value="UNDER_CONTRACT">Under Contract</SelectItem>
                                            <SelectItem value="CLOSED_WON">Closed Won</SelectItem>
                                            <SelectItem value="CLOSED_LOST">Closed Lost</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                                    'Save Deal'
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
