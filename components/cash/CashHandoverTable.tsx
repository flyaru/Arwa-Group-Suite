
import React from 'react';
import type { CashHandover, CashHandoverStatus } from '../../types';
import Button from '../ui/Button';
import { CheckCircle } from 'lucide-react';

interface CashHandoverTableProps {
    handovers: CashHandover[];
    canConfirm: boolean;
    onConfirm: (handoverId: string) => void;
}

const statusStyles: Record<CashHandoverStatus, string> = {
    pending: 'bg-sky-600/50 text-sky-300 border-sky-500',
    confirmed: 'bg-green-600/50 text-green-300 border-green-500',
};

const CashHandoverTable: React.FC<CashHandoverTableProps> = ({ handovers, canConfirm, onConfirm }) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Date</th>
                        <th scope="col" className="px-6 py-3">From Agent</th>
                        <th scope="col" className="px-6 py-3">Amount (SAR)</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3">Confirmed By</th>
                        <th scope="col" className="px-6 py-3">
                            <span className="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {handovers.map((h) => (
                        <tr key={h.id} className="border-b border-slate-800 hover:bg-slate-800/40">
                            <td className="px-6 py-4">{new Date(h.dateInitiated).toLocaleString()}</td>
                            <td className="px-6 py-4 font-medium text-white">{h.agentName}</td>
                            <td className="px-6 py-4 font-semibold">{h.amount.toFixed(2)}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 text-xs font-semibold capitalize rounded-full border ${statusStyles[h.status]}`}>
                                    {h.status}
                                </span>
                            </td>
                            <td className="px-6 py-4">{h.managerName || 'N/A'}</td>
                            <td className="px-6 py-4 text-right">
                                {canConfirm && h.status === 'pending' && (
                                    <Button 
                                        variant="secondary" 
                                        className="py-1.5 px-3 text-xs border-green-600 text-green-400 hover:bg-green-900/50"
                                        onClick={() => onConfirm(h.id)}
                                    >
                                        <CheckCircle className="w-4 h-4 mr-1.5" />
                                        Confirm
                                    </Button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CashHandoverTable;
