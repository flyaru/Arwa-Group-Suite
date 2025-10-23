import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { User } from '../types';
import { useApp } from './AppContext';

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (username: string, pass: string) => Promise<User | null>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const { triggerAnimation, logAction, appsScriptUrl, isBackendConnected } = useApp();

    const login = async (username: string, pass: string): Promise<User | null> => {
        if (!isBackendConnected || !appsScriptUrl) {
            throw new Error("Backend is not connected. Please configure the backend URL in settings.");
        }

        // The password check remains client-side for this demo version.
        // In a real-world scenario, you'd send a hashed password to the backend.
        if (pass !== 'Airbus@320') {
            return null;
        }

        try {
            const response = await fetch(appsScriptUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'login', payload: { username } }),
                redirect: 'follow'
            });

            if (!response.ok) {
                throw new Error(`Login request failed with status: ${response.status}`);
            }
            
            const result = await response.json();

            if (result.status === 'success' && result.data) {
                const foundUser: User = result.data;
                setUser(foundUser);
                await logAction({
                    userId: foundUser.id,
                    userName: foundUser.name,
                    action: 'USER_LOGIN',
                    details: `User ${foundUser.name} logged in.`,
                    targetId: foundUser.id,
                });
                return foundUser;
            } else {
                 // Throw the specific error message from the backend if it exists
                 throw new Error(result.message || 'User not found or invalid response.');
            }
        } catch (error) {
            console.error("Login API call failed:", error);
            // Re-throw the error to be caught by the LoginPage component
            if (error instanceof Error) {
                throw new Error(`Login failed: ${error.message}`);
            }
            throw new Error("An unknown error occurred during login.");
        }
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
