"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
    first_name: z.string().min(2, { message: 'First name is required' }),
    last_name: z.string().min(2, { message: 'Last name is required' }),
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export default function SignUpPage() {
    const { register } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            first_name: '',
            last_name: '',
            email: '',
            password: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            await register({
                username: values.email, // using email as username
                email: values.email,
                password: values.password,
                first_name: values.first_name,
                last_name: values.last_name
            });
        } catch (error) {
            // Error handled in AuthContext
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen w-full">
            {/* Left Column: Image & Quote */}
            <div className="hidden w-1/2 bg-black lg:block relative">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1600&q=80)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-black/40" />
                <div className="absolute bottom-10 left-10 right-10 z-10">
                    <blockquote className="space-y-2">
                        <p className="text-lg font-medium text-white">
                            &ldquo;Join thousands of top-performing agents who trust our platform to close more deals faster.&rdquo;
                        </p>
                    </blockquote>
                </div>
            </div>

            {/* Right Column: Register Form */}
            <div className="flex w-full items-center justify-center bg-background lg:w-1/2">
                <Card className="w-full max-w-[400px] border-none shadow-none">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
                        <CardDescription>
                            Enter your details to get started
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="first_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>First Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="John" {...field} disabled={isLoading} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="last_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Last Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Doe" {...field} disabled={isLoading} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="name@example.com" {...field} disabled={isLoading} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating account...
                                        </>
                                    ) : (
                                        'Sign Up'
                                    )}
                                </Button>
                            </form>
                        </Form>

                        <div className="mt-4 flex items-center justify-between">
                            <Separator className="w-[45%]" />
                            <span className="text-xs text-muted-foreground">OR</span>
                            <Separator className="w-[45%]" />
                        </div>

                        <div className="mt-4 text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <span
                                className="underline cursor-pointer hover:text-primary"
                                onClick={() => router.push('/login')}
                            >
                                Login
                            </span>
                        </div>

                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
