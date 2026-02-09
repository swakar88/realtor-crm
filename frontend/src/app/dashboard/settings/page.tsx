"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: '', // We might need to add this to AuthContext User type if available from backend
                email: user.email || '',
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // Placeholder for update logic
            console.log("Updating profile with:", formData);
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success("Profile updated successfully (Placeholder)");
        } catch (error) {
            toast.error("Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    const cardClass = "bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden";

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Settings</h2>

            <Card className={cardClass}>
                <CardHeader className="border-b border-gray-100 p-6">
                    <div className="flex items-center gap-2">
                        <div className="bg-emerald-50 p-2 rounded-full">
                            <User className="h-5 w-5 text-emerald-600" />
                        </div>
                        <CardTitle className="text-lg font-semibold text-gray-800">Profile Settings</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="first_name">First Name</Label>
                                <Input
                                    id="first_name"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    placeholder="Jane"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last_name">Last Name</Label>
                                <Input
                                    id="last_name"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="jane@example.com"
                            />
                        </div>

                        <div className="pt-4">
                            <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                {isLoading ? "Saving..." : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
