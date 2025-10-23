
import React from 'react';
import Card from '../components/ui/Card';
import { Users, Settings, Building } from 'lucide-react';
// FIX: Changed import path for mockUsers from AuthContext to data/mockData where it is properly exported.
import { useApp } from '../contexts/AppContext';
import Button from '../components/ui/Button';

const AdminPage: React.FC = () => {
    // FIX: Use employees from context instead of mockUsers
    const { employees } = useApp();
    
    const SettingToggle = ({ label, description }: {label: string, description: string}) => (
        <div className="flex items-center justify-between py-3 border-b border-slate-800">
            <div>
                <p className="font-medium text-white">{label}</p>
                <p className="text-sm text-slate-400">{description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" value="" className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
        </div>
    );

    return (
        <div className="space-y-6">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Users className="w-6 h-6 text-red-400" />
                        <h2 className="text-xl font-bold text-white">User Management</h2>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                        {employees.map(user => (
                            <div key={user.id} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg">
                                <div>
                                    <p className="font-semibold text-white">{user.name}</p>
                                    <p className="text-xs text-slate-400 capitalize">{user.role} - {user.branch}</p>
                                </div>
                                <Button variant="secondary" className="py-1 px-2 text-xs">Edit</Button>
                            </div>
                        ))}
                    </div>
                </Card>
                 <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Building className="w-6 h-6 text-sky-400" />
                        <h2 className="text-xl font-bold text-white">Branch Management</h2>
                    </div>
                     <div className="space-y-2">
                        {['Riyadh', 'Jeddah', 'Dammam'].map(branch => (
                             <div key={branch} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg">
                                <p className="font-semibold text-white">{branch} Branch</p>
                                <Button variant="secondary" className="py-1 px-2 text-xs">Manage</Button>
                            </div>
                        ))}
                     </div>
                </Card>
             </div>
             <Card className="p-6">
                 <div className="flex items-center gap-3 mb-4">
                    <Settings className="w-6 h-6 text-amber-400" />
                    <h2 className="text-xl font-bold text-white">System Settings</h2>
                </div>
                <div>
                    <SettingToggle label="Enable Maintenance Mode" description="Temporarily disable access for non-admins." />
                    <SettingToggle label="Automatic Invoice Generation" description="Generate invoices automatically upon DSR approval." />
                    <SettingToggle label="Enable Two-Factor Authentication" description="Enhance security for all user accounts." />
                </div>
             </Card>
        </div>
    );
};

export default AdminPage;
