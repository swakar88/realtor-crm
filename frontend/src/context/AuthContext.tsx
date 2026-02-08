"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import api from '@/lib/api';
import { toast } from 'sonner';

interface User {
    user_id: number;
    email: string;
    organization_id?: number;
    exp: number;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const decoded = jwtDecode<User>(token);
                // Check expiry if needed, though 401 interceptor handles this usually
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    setUser(decoded);
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error("Invalid token", error);
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await api.post('/token/', { username: email, password });
            const { access, refresh } = response.data;

            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            const decoded = jwtDecode<User>(access);
            setUser(decoded);
            setIsAuthenticated(true);

            toast.success('Login successful');
            router.push('/dashboard');
        } catch (error: any) {
            console.error('Login error:', error);
            toast.error('Invalid credentials');
            throw error;
        }
    };

    const register = async (data: any) => {
        try {
            const response = await api.post('/accounts/register/', data);
            const { access, refresh } = response.data;

            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            const decoded = jwtDecode<User>(access);
            setUser(decoded);
            setIsAuthenticated(true);

            toast.success('Registration successful');
            router.push('/dashboard');
        } catch (error: any) {
            console.error('Registration error:', error);
            const msg = error.response?.data?.error || 'Registration failed';
            toast.error(msg);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        setIsAuthenticated(false);
        router.push('/login');
        toast.info('Logged out');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
