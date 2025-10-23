
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import StatCard from '../dashboard/StatCard';
import { FileText, ArrowUp, Tag } from 'lucide-react';

interface SalesSummaryData {
    totalSales: number;
    totalCommission: number;
    totalVat: number;
    dsrCount: number;
    salesByService: { name: string; value: number }[];
}

interface SalesSummaryReportProps {
    data: SalesSummaryData;
}

const COLORS = ['#38bdf8', '#fb923c', '#4ade80', '#a78bfa'];

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800/80 backdrop-blur-sm p-3 rounded-lg border border-slate-700">
          <p className="label text-white font-bold">{`${payload[0].name}`}</p>
          <p style={{ color: payload[0].payload.fill }}>
            {`Sales : SAR ${payload[0].value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
          </p>
        </div>
      );
    }
    return null;
  };

const SalesSummaryReport: React.FC<SalesSummaryReportProps> = ({ data }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <StatCard 
                    title="Total Sales"
                    value={`SAR ${data.totalSales.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
                    change=""
                    icon={ArrowUp}
                    iconBgColor="bg-green-500/20 text-green-400"
                />
                 <StatCard 
                    title="Total Commission"
                    value={`SAR ${data.totalCommission.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
                    change=""
                    icon={Tag}
                    iconBgColor="bg-sky-500/20 text-sky-400"
                />
                 <StatCard 
                    title="DSRs Created"
                    value={String(data.dsrCount)}
                    change=""
                    icon={FileText}
                    iconBgColor="bg-amber-500/20 text-amber-400"
                />
                 <StatCard 
                    title="VAT on Commission"
                    value={`SAR ${data.totalVat.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
                    change=""
                    icon={Tag}
                    iconBgColor="bg-red-500/20 text-red-400"
                />
            </div>

            <div>
                <h4 className="text-md font-bold text-white mb-2">Sales by Service Type</h4>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data.salesByService.filter(item => item.value > 0)}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                    const RADIAN = Math.PI / 180;
                                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                    return (
                                        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                                            {`${(percent * 100).toFixed(0)}%`}
                                        </text>
                                    );
                                }}
                            >
                                {data.salesByService.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default SalesSummaryReport;
