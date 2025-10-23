
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Card from '../ui/Card';

const data = [
  { name: 'Jan', revenue: 45000, commission: 2400 },
  { name: 'Feb', revenue: 52000, commission: 3100 },
  { name: 'Mar', revenue: 48000, commission: 2800 },
  { name: 'Apr', revenue: 61000, commission: 3800 },
  { name: 'May', revenue: 55000, commission: 3300 },
  { name: 'Jun', revenue: 72000, commission: 4800 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800/80 backdrop-blur-sm p-3 rounded-lg border border-slate-700">
        <p className="label text-white font-bold">{`${label}`}</p>
        <p className="text-sky-400">{`Revenue : SAR ${payload[0].value.toLocaleString()}`}</p>
        <p className="text-red-400">{`Commission : SAR ${payload[1].value.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};

const RevenueChart: React.FC = () => {
  return (
    <Card className="p-6 h-[400px]">
      <h3 className="text-lg font-bold text-white mb-4">Revenue & Commission</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
          <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} tickFormatter={(value) => `${value / 1000}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ bottom: 0 }} />
          <Line type="monotone" dataKey="revenue" stroke="#38bdf8" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="commission" stroke="#D10028" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default RevenueChart;
