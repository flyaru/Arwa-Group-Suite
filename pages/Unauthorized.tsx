import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import { ShieldAlert } from 'lucide-react';
import Button from '../components/ui/Button';

const UnauthorizedPage: React.FC = () => {
    return (
        <div className="flex items-center justify-center h-full">
            <Card className="text-center p-8 max-w-md">
                <ShieldAlert className="w-16 h-16 mx-auto text-red-500 mb-4" />
                <h1 className="text-3xl font-bold text-white mb-2">Access Denied</h1>
                <p className="text-slate-300 mb-6">
                    You do not have the necessary permissions to view this page. Please contact your administrator if you believe this is an error.
                </p>
                <Button>
                   <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
            </Card>
        </div>
    );
};

export default UnauthorizedPage;
