import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import type { User } from '../types';
import { useApp } from './AppContext';
import { mockUsers } from '../data/mockData';

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (email: string, pass: string) => Promise<User | null>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const { supabase, isLiveMode, triggerAnimation, logAction } = useApp();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        if (!isLiveMode || !supabase) {
            setUser(null);
            return;
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT' || !session) {
                setUser(null);
                return;
            }
            if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                setUser(profile ? fromSnakeCase(profile) as User : null);
            }
        });
        
        return () => subscription.unsubscribe();

    }, [isLiveMode, supabase]);

    const fromSnakeCase = (obj: Record<string, any>) => {
        if (!obj) return obj;
        const newObj: Record<string, any> = {};
        for (const key in obj) {
            newObj[key.replace(/_([a-z])/g, (g) => g[1].toUpperCase())] = obj[key];
        }
        return newObj;
    };

    const login = async (email: string, pass: string): Promise<User | null> => {
        let foundUser: User | null = null;
        
        if (isLiveMode && supabase) {
            // FIX: Corrected a typo in the login function where 'password' was used as a shorthand property instead of assigning the 'pass' variable to it.
            const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
            if (error) throw error;
            if (data.user) {
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();
                
                if (profileError) throw profileError;
                foundUser = fromSnakeCase(profile) as User;
            }
        } else {
            // Demo mode
            if (pass !== 'Airbus@320') return null;
            foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
        }

        if (foundUser) {
            setUser(foundUser);
            await logAction({
                userId: foundUser.id,
                userName: foundUser.name,
                action: 'USER_LOGIN',
                details: `User ${foundUser.name} logged in.`,
                targetId: foundUser.id,
            });
            return foundUser;
        }
        
        return null;
    };

    const logout = async () => {
        if (!user) return;
        
        await logAction({
            userId: user.id,
            userName: user.name,
            action: 'USER_LOGOUT',
            details: `User ${user.name} logged out.`,
            targetId: user.id,
        });
        
        triggerAnimation('logout', user.name, async () => {
            if (isLiveMode && supabase) {
                await supabase.auth.signOut();
            }
            setUser(null);
        });
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
