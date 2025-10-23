
import React from 'react';
import Card from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import BackendConfiguration from '../components/settings/BackendConfiguration';


const SettingsPage: React.FC = () => {
    const { user } = useAuth();
    
    return (
        <div className="space-y-6">
           {user?.role === 'admin' && <BackendConfiguration />}
            
            <Card className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">Application Settings</h2>
                <p className="text-slate-400">
                    More application-wide settings and user preferences will be available here in a future update.
                </p>
            </Card>
        </div>
    );
};

export default SettingsPage;
