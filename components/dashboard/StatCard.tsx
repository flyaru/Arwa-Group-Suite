
import React from 'react';
import type { LucideProps } from 'lucide-react';
import Card from '../ui/Card';

interface StatCardProps {
    title: string;
    value: string;
    change: string;
    icon: React.ElementType<LucideProps>;
    iconBgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon: Icon, iconBgColor }) => {
    return (
        <Card className="p-5 flex items-center justify-between">
            <div>
                <p className="text-sm text-slate-400 font-medium">{title}</p>
                <p className="text-2xl font-bold text-white mt-1">{value}</p>
                <p className="text-xs text-slate-400 mt-2">{change}</p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBgColor}`}>
                <Icon className="w-6 h-6" />
            </div>
        </Card>
    );
};

export default StatCard;
