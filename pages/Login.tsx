import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApp, DEFAULT_BACKEND_URL } from '../contexts/AppContext';
import AnimatedBackground from '../components/common/AnimatedBackground';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

const BackendConfigurator: React.FC = () => {
    const { setAppsScriptUrl, testBackendConnection } = useApp();
    const [url, setUrl] = useState(DEFAULT_BACKEND_URL);
    const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [testMessage, setTestMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleTest = async () => {
        setTestStatus('testing');
        setTestMessage('');
        try {
            const response = await testBackendConnection(url);
            if (response.status === 'success') {
                setTestStatus('success');
                setTestMessage('Success! Connection is working.');
            } else {
                throw new Error(response.message || 'Unknown error');
            }
        } catch (error: any) {
            setTestStatus('error');
            let message = `Failed: ${error.message}`;
            if (error.message.includes('Failed to fetch')) {
                message += " This is often a CORS issue. Please ensure your Apps Script is deployed correctly with 'Who has access: Anyone' and that you have redeployed after making changes to the script.";
            }
            setTestMessage(message);
        }
    };
    
    const handleSave = async () => {
        if (testStatus !== 'success') {
             setTestMessage('Please test the connection successfully before saving.');
             setTestStatus('error');
             return;
        }
        setIsSaving(true);
        const success = await setAppsScriptUrl(url);
        // On success, the app reloads, so no need to handle that state.
        if (!success) {
            setTestStatus('error');
            setTestMessage('Failed to save. The URL might be invalid.');
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-4 pt-4 mt-4 border-t border-slate-700">
            <h3 className="text-sm font-bold text-white text-center">Backend Configuration</h3>
            <div>
                <label htmlFor="appsScriptUrl" className="block text-xs font-medium text-slate-300 mb-1">Web App URL</label>
                <textarea
                    id="appsScriptUrl"
                    value={url}
                    onChange={(e) => { setUrl(e.target.value); setTestStatus('idle'); }}
                    placeholder="https://script.google.com/macros/s/..."
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D10028]/80 resize-none"
                    rows={3}
                />
                 <p className="text-xs text-slate-400 mt-1">Hint: The URL must be the deployed Web App URL, ending in `/exec`.</p>
            </div>
             {testStatus !== 'idle' && (
                <div className={`flex items-start gap-2 text-xs p-2 rounded-md ${
                    testStatus === 'success' ? 'bg-green-900/50 text-green-300' 
                    : testStatus === 'error' ? 'bg-red-900/50 text-red-300' 
                    : 'bg-sky-900/50 text-sky-300'
                }`}>
                    {testStatus === 'success' && <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                    {testStatus === 'error' && <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                    {testStatus === 'testing' && <Loader2 className="w-4 h-4 animate-spin mt-0.5 flex-shrink-0" />}
                    <span>{testMessage}</span>
                </div>
            )}
            <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={handleTest} disabled={!url || testStatus === 'testing'} className="!py-2 !text-xs w-full">
                    {testStatus === 'testing' ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Testing...</> : 'Test Connection'}
                </Button>
                <Button onClick={handleSave} disabled={!url || isSaving || testStatus !== 'success'} className="!py-2 !text-xs w-full">
                     {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Save & Connect'}
                </Button>
            </div>
        </div>
    );
};

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const { triggerAnimation, isBackendConnected, backendError } = useApp();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!isBackendConnected) {
            setError('Backend is not connected. Please configure the URL first.');
            setIsLoading(false);
            return;
        }

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
    
    const isFormDisabled = isLoading || !isBackendConnected;

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
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D10028]/80 disabled:opacity-50"
                            required
                            disabled={isFormDisabled}
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D10028]/80 disabled:opacity-50"
                            required
                            disabled={isFormDisabled}
                        />
                    </div>

                    <div className="text-sm text-center min-h-[40px] flex flex-col justify-center">
                        {error && <p className="text-red-400">{error}</p>}
                    </div>

                    <Button
                        type="submit"
                        disabled={isFormDisabled}
                        className="w-full"
                    >
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </Button>
                </form>

                {(!isBackendConnected || backendError) && <BackendConfigurator />}


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
