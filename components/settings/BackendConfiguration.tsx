
import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useApp } from '../../contexts/AppContext';
import { CheckCircle, AlertTriangle, XCircle, ExternalLink } from 'lucide-react';

const BackendConfiguration: React.FC = () => {
    const { isLiveMode, backendUrl, setBackendAndSwitchToLive, switchToDemoMode, isLoading } = useApp();
    const [urlInput, setUrlInput] = useState(backendUrl || '');
    const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [testMessage, setTestMessage] = useState('');

    useEffect(() => {
        setUrlInput(backendUrl || '');
    }, [backendUrl]);

    const handleTestConnection = async () => {
        if (!urlInput) {
            setTestStatus('error');
            setTestMessage('URL cannot be empty.');
            return;
        }
        setTestStatus('testing');
        setTestMessage('Pinging backend...');
        try {
            const response = await fetch(urlInput, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: 'testConnection' }),
                redirect: 'follow',
            });
            if (!response.ok) throw new Error('Network response was not OK.');
            const result = await response.json();
            if (result.status === 'success') {
                setTestStatus('success');
                setTestMessage('Success! Connection is working.');
            } else {
                throw new Error(result.message || 'Backend responded with an error.');
            }
        } catch (err) {
            setTestStatus('error');
            setTestMessage('Connection failed. Check URL, CORS, and deployment settings.');
            console.error(err);
        }
    };
    
    const handleSaveAndSwitch = async () => {
        const success = await setBackendAndSwitchToLive(urlInput);
        if(!success) {
            setTestStatus('error');
            setTestMessage('Failed to save. Please test the connection first.');
        }
        // On success, the app will reload via the context function
    };

    return (
        <Card className="p-6">
            <h2 className="text-xl font-bold text-white mb-1">Backend Configuration</h2>
            <p className="text-slate-400 mb-4">Switch between offline demo mode and live production mode connected to your Google Sheet.</p>
            
            <a href="https://github.com/MAlthaf-dev/arwa-app-suite/blob/main/SETUP_GUIDE.md" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-sky-400 hover:text-sky-300 mb-4">
                <ExternalLink className="w-4 h-4" />
                View Full Setup Guide on GitHub
            </a>


            {isLiveMode ? (
                 <div className="bg-green-900/40 border border-green-700/60 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-green-400" />
                        <div>
                            <p className="font-bold text-white">Live Mode is Active</p>
                            <p className="text-sm text-green-300">App is connected to your Google Sheet backend.</p>
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
            
            <div className="mt-4 space-y-3">
                 <div>
                    <label htmlFor="backendUrl" className="block text-sm font-medium text-slate-300 mb-1">
                        Google Apps Script URL
                    </label>
                    <input
                        id="backendUrl"
                        type="url"
                        value={urlInput}
                        onChange={(e) => {
                            setUrlInput(e.target.value);
                            setTestStatus('idle');
                        }}
                        placeholder="https://script.google.com/macros/s/..."
                        className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D10028]/80"
                        disabled={isLoading}
                    />
                </div>
                 <div className="flex items-center justify-between gap-4">
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
        </Card>
    );
};

export default BackendConfiguration;
