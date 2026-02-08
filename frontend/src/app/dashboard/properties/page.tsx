"use client";

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Property } from '@/types';
import { PropertyForm } from '@/components/properties/PropertyForm';
import { Loader2, MapPin, Bed, Bath, Ruler, Tag } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function PropertiesPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const response = await api.get('/properties/');
            setProperties(response.data);
            setError('');
        } catch (err) {
            console.error("Failed to fetch properties", err);
            setError("Failed to load properties.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(price);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return 'default'; // primary color (usually black/slate-900)
            case 'Pending': return 'secondary'; // yellow-ish or gray
            case 'Sold': return 'outline'; // clear
            default: return 'default';
        }
    };

    if (loading && properties.length === 0) {
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
                    <h2 className="text-3xl font-bold tracking-tight">Properties</h2>
                    <p className="text-muted-foreground">
                        Manage your property listings and inventory.
                    </p>
                </div>
                <PropertyForm onSuccess={fetchProperties} />
            </div>

            {error && <div className="text-red-500">{error}</div>}

            <div className="rounded-md border bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Address</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Specs</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {properties.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No properties found. Add one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            properties.map((property) => (
                                <TableRow key={property.id} className="cursor-pointer hover:bg-slate-50">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center">
                                            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                                            {property.address}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {property.city}, {property.state}
                                    </TableCell>
                                    <TableCell className="font-semibold text-slate-700">
                                        {formatPrice(property.price)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-3 text-xs text-muted-foreground">
                                            <span className="flex items-center"><Bed className="mr-1 h-3 w-3" /> {property.bedrooms}</span>
                                            <span className="flex items-center"><Bath className="mr-1 h-3 w-3" /> {property.bathrooms}</span>
                                            <span className="flex items-center"><Ruler className="mr-1 h-3 w-3" /> {property.square_feet}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {property.property_type}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusColor(property.status) as any}>
                                            {property.status}
                                        </Badge>
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
