"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode'; // Fixed import name
import api from '@/lib/api'; // <--- Using your new centralized API file
import { toast } from 'sonner';

interface User {
    user_id: number;
    email: string;
    organization_id?: number;
    username?: string;
    first_name?: string;
    is_superuser?: boolean;
    exp: number;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check for token on load
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const decoded = jwtDecode<User>(token);
                // Check if token is expired
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    setUser(decoded);
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error("Invalid token on load", error);
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const normalizedEmail = email.toLowerCase();
        try {
            // Using /token/ to match backend URL
            const response = await api.post('/token/', { username: normalizedEmail, password });

            // Handle response (SimpleJWT usually returns access/refresh)
            const { access, refresh } = response.data;

            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            const decoded = jwtDecode<User>(access);
            setUser(decoded);
            setIsAuthenticated(true);

            toast.success('Login successful');
            router.push('/'); // Go to Dashboard
        } catch (error: any) {
            console.error('Login error:', error);
            const msg = error.response?.data?.detail || 'Invalid credentials';
            toast.error(msg);
            throw error;
        }
    };

    const register = async (name: string, email: string, password: string) => {
        const normalizedEmail = email.toLowerCase();
        try {
            await api.post('/accounts/register/', { username: name, email: normalizedEmail, password });

            // Auto-login after successful registration
            await login(normalizedEmail, password);
            toast.success('Account created successfully');
        } catch (error: any) {
            console.error('Registration error:', error);
            // specific error handling for arrays (common in Django)
            const data = error.response?.data;
            let msg = 'Registration failed';

            if (data) {
                // If backend returns { email: ["Invalid email"] }
                const firstKey = Object.keys(data)[0];
                if (firstKey && Array.isArray(data[firstKey])) {
                    msg = `${firstKey}: ${data[firstKey][0]}`;
                } else if (typeof data === 'string') {
                    msg = data;
                } else if (data.detail) {
                    msg = data.detail;
                }
            }

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