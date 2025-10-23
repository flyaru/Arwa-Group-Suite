
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AgentPerformanceData {
    agentName: string;
    totalSales: number;
    commission: number;
    dsrCount: number;
}

interface AgentPerformanceReportProps {
    data: AgentPerformanceData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800/80 backdrop-blur-sm p-3 rounded-lg border border-slate-700">
        <p className="label text-white font-bold">{`${label}`}</p>
        <p className="text-sky-400">{`Total Sales : SAR ${payload[0].value.toLocaleString()}`}</p>
        <p className="text-red-400">{`Commission : SAR ${payload[1].value.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};

const AgentPerformanceReport: React.FC<AgentPerformanceReportProps> = ({ data }) => {
    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-md font-bold text-white mb-2">Performance Chart</h4>
                 <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                            <XAxis dataKey="agentName" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} tickFormatter={(value) => `${value / 1000}k`} />
                            <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                            <Legend />
                            <Bar dataKey="totalSales" name="Total Sales" fill="#38bdf8" />
                            <Bar dataKey="commission" name="Commission" fill="#D10028" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div>
                <h4 className="text-md font-bold text-white mb-2">Detailed Data</h4>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Agent Name</th>
                                <th scope="col" className="px-6 py-3">Total Sales (SAR)</th>
                                <th scope="col" className="px-6 py-3">Commission Earned (SAR)</th>
                                <th scope="col" className="px-6 py-3">DSRs Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((agent) => (
                                <tr key={agent.agentName} className="border-b border-slate-800 hover:bg-slate-800/40">
                                    <td className="px-6 py-4 font-medium text-white">{agent.agentName}</td>
                                    <td className="px-6 py-4">{agent.totalSales.toFixed(2)}</td>
                                    <td className="px-6 py-4">{agent.commission.toFixed(2)}</td>
                                    <td className="px-6 py-4">{agent.dsrCount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AgentPerformanceReport;