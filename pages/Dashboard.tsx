
import React from 'react';
import { ArrowUp, Users, FileText, UserCheck } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import ActiveRoutes from '../components/dashboard/ActiveRoutes';

const Dashboard: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Revenue"
                    value="SAR 67,000.00"
                    change="+12.5% from last month"
                    icon={ArrowUp}
                    iconBgColor="bg-green-500/20 text-green-400"
                />
                <StatCard 
                    title="Commission Earned"
                    value="SAR 4,800.00"
                    change="+8.2% from last month"
                    icon={ArrowUp}
                    iconBgColor="bg-sky-500/20 text-sky-400"
                />
                <StatCard 
                    title="DSRs This Month"
                    value="142"
                    change="-0.5% from last month"
                    icon={FileText}
                    iconBgColor="bg-amber-500/20 text-amber-400"
                />
                <StatCard 
                    title="Active Customers"
                    value="89"
                    change="+7 from last month"
                    icon={Users}
                    iconBgColor="bg-red-500/20 text-red-400"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <RevenueChart />
                </div>
                <div>
                    <ActiveRoutes />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
