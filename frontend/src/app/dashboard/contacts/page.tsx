"use client";

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Contact } from '@/types';
import { ContactForm } from '@/components/contacts/ContactForm';
import { Loader2, MoreVertical, Mail, Phone } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export default function ContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const response = await api.get('/contacts/');
            setContacts(response.data);
            setError('');
        } catch (err) {
            console.error("Failed to fetch contacts", err);
            setError("Failed to load contacts.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const getInitials = (first: string, last: string) => {
        return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'Buyer': return 'default'; // primary
            case 'Seller': return 'secondary';
            case 'Agent': return 'outline';
            default: return 'outline';
        }
    };

    if (loading && contacts.length === 0) {
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
                    <h2 className="text-3xl font-bold tracking-tight">Contacts</h2>
                    <p className="text-muted-foreground">
                        Manage your buyers, sellers, and network.
                    </p>
                </div>
                <ContactForm onSuccess={fetchContacts} />
            </div>

            {error && <div className="text-red-500">{error}</div>}

            <div className="rounded-md border bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Contact Info</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="w-[80px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {contacts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No contacts found. Add one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            contacts.map((contact) => (
                                <TableRow key={contact.id} className="hover:bg-slate-50">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center space-x-4">
                                            <Avatar>
                                                <AvatarFallback>{getInitials(contact.first_name, contact.last_name)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium leading-none">{contact.first_name} {contact.last_name}</p>
                                                <p className="text-xs text-muted-foreground">{contact.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col space-y-1 text-sm">
                                            <span className="flex items-center text-muted-foreground">
                                                <Mail className="mr-2 h-3 w-3" /> {contact.email}
                                            </span>
                                            <span className="flex items-center text-muted-foreground">
                                                <Phone className="mr-2 h-3 w-3" /> {contact.phone}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getRoleColor(contact.role) as any}>
                                            {contact.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(contact.email)}>
                                                    Copy Email
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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
