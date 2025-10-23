
import React from 'react';

interface CommissionData {
    agentName: string;
    flight: number;
    hotel: number;
    visa: number;
    other: number;
    total: number;
}

interface CommissionReportProps {
    data: CommissionData[];
}

const CommissionReport: React.FC<CommissionReportProps> = ({ data }) => {
    return (
        <div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-300">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Agent Name</th>
                            <th scope="col" className="px-6 py-3 text-right">Flight (SAR)</th>
                            <th scope="col" className="px-6 py-3 text-right">Hotel (SAR)</th>
                            <th scope="col" className="px-6 py-3 text-right">Visa (SAR)</th>
                            <th scope="col" className="px-6 py-3 text-right">Other (SAR)</th>
                            <th scope="col" className="px-6 py-3 text-right">Total (SAR)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((agent) => (
                            <tr key={agent.agentName} className="border-b border-slate-800 hover:bg-slate-800/40">
                                <td className="px-6 py-4 font-medium text-white">{agent.agentName}</td>
                                <td className="px-6 py-4 text-right">{agent.flight.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right">{agent.hotel.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right">{agent.visa.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right">{agent.other.toFixed(2)}</td>
                                <td className="px-6 py-4 font-bold text-white text-right">{agent.total.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CommissionReport;