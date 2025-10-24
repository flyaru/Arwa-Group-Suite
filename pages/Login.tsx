import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import AnimatedBackground from '../components/common/AnimatedBackground';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('gm@arwatravelksa.com');
    const [password, setPassword] = useState('Airbus@320');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const { triggerAnimation } = useApp();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const user = await login(email, password);
            if (user) {
                triggerAnimation('login', user.name, () => {
                     navigate('/dashboard');
                });
            } else {
                setError('Invalid email or password.');
                setIsLoading(false);
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative">
            <AnimatedBackground />
            <Card className="w-full max-w-sm p-8 space-y-6">
                <div className="text-center">
                    <svg
                      className="h-10 w-auto mx-auto mb-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 2L2 22H22L12 2Z"
                        fill="#D10028"
                      />
                      <path
                        d="M12 9L7 22H17L12 9Z"
                        fill="#0B2D48"
                        fillOpacity="0.5"
                      />
                      <path
                        d="M12 12.5L10.5 14.5L11 12L9.5 11L11.5 10.8L12 9L12.5 10.8L14.5 11L13 12L13.5 14.5L12 12.5Z"
                        fill="white"
                      />
                    </svg>
                    <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
                    <p className="text-slate-400">Sign in to your account</p>
                    <p className="text-xs text-slate-500 mt-2">Arwa Group - Integrated Business Suite</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D10028]/80"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D10028]/80"
                    />
                     {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </Button>
                </form>
            </Card>
            <footer className="absolute bottom-4 left-0 right-0 text-center text-xs text-slate-500">
                Developed by Arwa Tech - All rights reserved (C)2025
            </footer>
        </div>
    );
};

export default LoginPage;