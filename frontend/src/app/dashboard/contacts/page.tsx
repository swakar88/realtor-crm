"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Loader2, Search, User, Phone, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AddContactModal } from '@/components/dashboard/AddContactModal';
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

interface Contact {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    role: string;
    created_at: string;
}

export default function ContactsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push('/login');
                return;
            }

            const fetchContacts = async () => {
                try {
                    // /api/contacts/ is registered in transactions/urls.py via router.register(r'contacts', ...) 
                    // and included in project urls via path('api/', include('transactions.urls')) ?
                    // Wait, transactions/urls.py has router.register(r'contacts'). 
                    // If included at /api/, then it is /api/contacts/
                    const res = await api.get('/contacts/');
                    setContacts(res.data);
                } catch (error) {
                    console.error("Failed to fetch contacts", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchContacts();
        }
    }, [user, authLoading, router]);

    if (authLoading || loading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    const filteredContacts = contacts.filter(c =>
        c.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Contacts</h1>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search contacts..."
                            className="pl-8 bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <AddContactModal onSuccess={() => {
                        window.location.reload();
                    }} />
                </div>
            </div>

            <Card className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <CardHeader className="bg-gray-50 border-b border-gray-100 py-4">
                    <div className="flex items-center gap-2 text-emerald-700">
                        <User className="h-5 w-5" />
                        <CardTitle className="text-lg font-semibold text-gray-800">Client Directory</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 hover:bg-gray-50">
                                    <TableHead className="font-bold text-gray-700">Name</TableHead>
                                    <TableHead className="font-bold text-gray-700">Role</TableHead>
                                    <TableHead className="font-bold text-gray-700">Email</TableHead>
                                    <TableHead className="font-bold text-gray-700">Phone</TableHead>
                                    <TableHead className="font-bold text-gray-700">Added</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredContacts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                                            No contacts found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredContacts.map((contact) => (
                                        <TableRow key={contact.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                                            <TableCell className="font-semibold text-gray-800">
                                                {contact.first_name} {contact.last_name}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`
                                                    ${contact.role === 'Buyer' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                                                    ${contact.role === 'Seller' ? 'bg-orange-50 text-orange-700 border-orange-200' : ''}
                                                    ${contact.role === 'Agent' ? 'bg-purple-50 text-purple-700 border-purple-200' : ''}
                                                `}>
                                                    {contact.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-3 w-3 text-gray-400" />
                                                    {contact.email}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-3 w-3 text-gray-400" />
                                                    {contact.phone}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-500 text-sm">
                                                {new Date(contact.created_at).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div >
    );
}
