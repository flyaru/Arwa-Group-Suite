import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useApp } from '../../contexts/AppContext';
import { CheckCircle, AlertTriangle, XCircle, ExternalLink } from 'lucide-react';

const BackendConfiguration: React.FC = () => {
    const { 
        isLiveMode, 
        setBackendAndSwitchToLive, 
        switchToDemoMode, 
        isLoading,
        geminiApiKey,
        setGeminiApiKey
    } = useApp();

    const [urlInput, setUrlInput] = useState('');
    const [anonKeyInput, setAnonKeyInput] = useState('');
    const [geminiKeyInput, setGeminiKeyInput] = useState('');

    const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [testMessage, setTestMessage] = useState('');
    const [geminiSaveStatus, setGeminiSaveStatus] = useState<'idle' | 'saved'>('idle');

    useEffect(() => {
        setUrlInput(localStorage.getItem('supabaseUrl_arwa') || '');
        setAnonKeyInput(localStorage.getItem('supabaseAnonKey_arwa') || '');
        setGeminiKeyInput(geminiApiKey || '');
    }, [isLiveMode, geminiApiKey]);

    const handleTestConnection = async () => {
        if (!urlInput || !anonKeyInput) {
            setTestStatus('error');
            setTestMessage('URL and Anon Key cannot be empty.');
            return;
        }
        setTestStatus('testing');
        setTestMessage('Pinging Supabase backend...');
        try {
            const testClient = createClient(urlInput, anonKeyInput);
            const { error } = await testClient.from('customers').select('id', { count: 'exact', head: true });
            if (error) throw error;
            
            setTestStatus('success');
            setTestMessage('Success! Connection is working.');
        } catch (err: any) {
            setTestStatus('error');
            setTestMessage(`Connection failed: ${err.message}. Check URL and Anon Key.`);
            console.error(err);
        }
    };
    
    const handleSaveAndSwitch = async () => {
        const success = await setBackendAndSwitchToLive(urlInput, anonKeyInput);
        if(!success) {
            setTestStatus('error');
            setTestMessage('Failed to save. Please test the connection first.');
        }
    };

    const handleSaveGeminiKey = () => {
        setGeminiApiKey(geminiKeyInput);
        setGeminiSaveStatus('saved');
        setTimeout(() => setGeminiSaveStatus('idle'), 2000);
    };

    return (
        <Card className="p-6">
            <h2 className="text-xl font-bold text-white mb-1">Backend Configuration</h2>
            <p className="text-slate-400 mb-4">Switch between offline demo mode and live production mode connected to your Supabase project.</p>

            {isLiveMode ? (
                 <div className="bg-green-900/40 border border-green-700/60 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-green-400" />
                        <div>
                            <p className="font-bold text-white">Live Mode is Active</p>
                            <p className="text-sm text-green-300">App is connected to your Supabase backend.</p>
                        </div>
                    </div>
                    <Button variant="secondary" onClick={switchToDemoMode}>Switch to Demo Mode</Button>
                </div>
            ) : (
                 <div className="bg-sky-900/40 border border-sky-700/60 rounded-lg p-4 flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-sky-400" />
                    <div>
                        <p className="font-bold text-white">Demo Mode is Active</p>
                        <p className="text-sm text-sky-300">App is running with local mock data. No internet connection needed.</p>
                    </div>
                </div>
            )}
            
            <div className="mt-6 space-y-4">
                 <h3 className="text-lg font-semibold text-white">Supabase Settings</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="supabaseUrl" className="block text-sm font-medium text-slate-300 mb-1">
                            Supabase Project URL
                        </label>
                        <input
                            id="supabaseUrl"
                            type="url"
                            value={urlInput}
                            onChange={(e) => { setUrlInput(e.target.value); setTestStatus('idle'); }}
                            placeholder="https://your-project-ref.supabase.co"
                            className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D10028]/80"
                            disabled={isLoading}
                        />
                    </div>
                     <div>
                        <label htmlFor="supabaseKey" className="block text-sm font-medium text-slate-300 mb-1">
                            Supabase Anon Key (public)
                        </label>
                        <input
                            id="supabaseKey"
                            type="text"
                            value={anonKeyInput}
                            onChange={(e) => { setAnonKeyInput(e.target.value); setTestStatus('idle'); }}
                            placeholder="ey..."
                            className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D10028]/80"
                            disabled={isLoading}
                        />
                    </div>
                </div>
                 <div className="flex items-center justify-between gap-4 pt-2">
                     <div className="flex items-center gap-3 min-h-[44px]">
                        {testStatus === 'success' && <CheckCircle className="w-5 h-5 text-green-400" />}
                        {testStatus === 'error' && <AlertTriangle className="w-5 h-5 text-red-400" />}
                        {testStatus !== 'idle' && (
                             <p className={`text-sm ${testStatus === 'success' ? 'text-green-400' : testStatus === 'error' ? 'text-red-400' : 'text-slate-400'}`}>
                                {testMessage}
                            </p>
                        )}
                     </div>
                     <div className="flex items-center gap-3">
                        <Button variant="secondary" onClick={handleTestConnection} disabled={isLoading || testStatus === 'testing'}>
                            {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
                        </Button>
                        <Button onClick={handleSaveAndSwitch} disabled={isLoading || testStatus !== 'success'}>
                            {isLoading ? 'Switching...' : 'Save & Switch to Live Mode'}
                        </Button>
                     </div>
                 </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700 space-y-3">
                <h3 className="text-lg font-semibold text-white">AI Assistant Settings</h3>
                 <div>
                    <label htmlFor="geminiKey" className="block text-sm font-medium text-slate-300 mb-1">
                        Gemini API Key
                    </label>
                    <input
                        id="geminiKey"
                        type="password"
                        value={geminiKeyInput}
                        onChange={(e) => setGeminiKeyInput(e.target.value)}
                        placeholder="Enter your Google AI Studio API key"
                        className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D10028]/80"
                    />
                </div>
                 <div className="flex items-center justify-between gap-4 pt-2">
                    <div className="flex items-center gap-3 min-h-[44px]">
                        {geminiSaveStatus === 'saved' && (
                            <div className="flex items-center gap-2 text-sm text-green-400">
                                <CheckCircle className="w-5 h-5" />
                                Key saved successfully!
                            </div>
                        )}
                    </div>
                    <Button variant="secondary" onClick={handleSaveGeminiKey}>
                        Save Gemini Key
                    </Button>
                 </div>
            </div>
        </Card>
    );
};

export default BackendConfiguration;