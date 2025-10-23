import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import AnimatedBackground from '../components/common/AnimatedBackground';
import Card from '../components/ui/Card';

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
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
            const user = await login(username, password);
            if (user) {
                triggerAnimation('login', user.name, () => {
                     navigate('/dashboard');
                });
            } else {
                setError('Invalid username or password.');
                setIsLoading(false);
            }
        } catch (err: any) {
            // Display a more specific error from the AuthContext
            setError(err.message || 'An unexpected error occurred.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center">
            <AnimatedBackground />
            <Card className="w-full max-w-sm p-8 space-y-6">
                <div className="text-center">
                    <div className="mx-auto w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#D10028" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 17L12 22L22 17" stroke="#0B2D48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 12L12 17L22 12" stroke="#0B2D48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Arwa Group</h1>
                    <p className="text-slate-300 mt-1">Integrated Business Solution</p>
                    <p className="text-xs text-slate-400 mt-1">(Developed by Arwa Tech)</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D10028]/80"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D10028]/80"
                            required
                        />
                    </div>
                    {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-[#D10028] text-white font-bold rounded-lg hover:bg-red-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
                 <div className="text-center text-xs text-slate-400 pt-2">
                    <p>Hint: Try one of the following logins.</p>
                    <p>
                        <span className="font-semibold text-slate-300">User:</span> admin, manager, agent, accountant
                        <br />
                        <span className="font-semibold text-slate-300">Pass:</span> Airbus@320
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default LoginPage;
