
import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { User } from '../types';
import { useApp } from './AppContext';
import { mockUsers } from '../data/mockData';

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (username: string, pass: string) => Promise<User | null>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const { triggerAnimation, logAction, isLiveMode, apiClient: api } = useApp();

    const login = async (username: string, pass: string): Promise<User | null> => {
        let foundUser: User | null = null;
        
        if (isLiveMode) {
            // Live mode: Authenticate against the backend
            // Note: The backend's login is simplified and doesn't check the password for this version.
            // A real-world app would have secure password handling.
            try {
                foundUser = await api<User>('login', { username });
            } catch (error) {
                console.error("Live login failed:", error);
                throw new Error("Failed to connect to the login service.");
            }
        } else {
            // Demo mode: Use mock data and a hardcoded password
            if (pass !== 'Airbus@320') {
                return null;
            }
            foundUser = mockUsers.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
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
        triggerAnimation('logout', user.name, () => {
             setUser(null);
        });
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout }}>
            {children}
        {/* FIX: Corrected typo in the closing tag for AuthContext.Provider. */}
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
