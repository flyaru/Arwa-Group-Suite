
import React from 'react';
import AnimatedBackground from '../common/AnimatedBackground';
import Sidebar from './Sidebar';
import Header from './Header';
import { useApp } from '../../contexts/AppContext';
import { Loader2 } from 'lucide-react';

const GlobalLoader: React.FC = () => {
    const { backendError } = useApp();
    return (
        <div className="fixed inset-0 bg-[#0B2D48]/90 backdrop-blur-sm flex flex-col items-center justify-center z-[200]">
            {backendError ? (
                 <div className="text-center text-red-300 max-w-lg p-4 bg-red-900/40 border border-red-500/50 rounded-lg">
                    <h2 className="text-xl font-bold mb-2">Connection Error</h2>
                    <p className="text-sm">{backendError}</p>
                    <p className="text-xs mt-4">Please log in as admin and configure the backend URL in Settings.</p>
                </div>
            ) : (
                <>
                    <Loader2 className="w-12 h-12 text-white animate-spin mb-4" />
                    <p className="text-lg font-semibold text-white">Connecting to Arwa Group Backend...</p>
                    <p className="text-slate-400">Loading initial data.</p>
                </>
            )}
        </div>
    );
}

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isInitialLoading } = useApp();
    return (
        <div className="h-screen w-full flex bg-[#0B2D48]">
            <AnimatedBackground />
            {isInitialLoading && <GlobalLoader />}
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
