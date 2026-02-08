"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
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
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            email: '',
            password: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            await login(values.email, values.password);
            router.push('/dashboard');
            // Login function handles success toast and redirect
        } catch (error) {
            // Login function handles generic error toast, but we can be specific if needed
            // toast.error("Invalid credentials"); is already in AuthContext
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
                    style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-black/40" />
                <div className="absolute bottom-10 left-10 right-10 z-10">
                    <blockquote className="space-y-2">
                        <p className="text-lg font-medium text-white">
                            &ldquo;This platform changed how I manage my leads. It&apos;s efficient, beautiful, and exactly what a modern agent needs.&rdquo;
                        </p>
                        <footer className="text-sm text-neutral-300">Sofia Davis</footer>
                    </blockquote>
                </div>
            </div>

            {/* Right Column: Login Form */}
            <div className="flex w-full items-center justify-center bg-background lg:w-1/2">
                <Card className="w-full max-w-[400px] border-none shadow-none">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
                        <CardDescription>
                            Enter your email to sign in to your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                <div className="flex items-center justify-end">
                                    <span
                                        className="text-sm font-medium text-primary hover:underline cursor-pointer"
                                        onClick={() => toast.info('Reset link sent to console (Dev Mode)')}
                                    >
                                        Forgot password?
                                    </span>
                                </div>
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Please wait
                                        </>
                                    ) : (
                                        'Sign In'
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
                            Don&apos;t have an account?{' '}
                            <span
                                className="underline cursor-pointer hover:text-primary"
                                onClick={() => router.push('/signup')}
                            >
                                Sign Up
                            </span>
                        </div>

                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
