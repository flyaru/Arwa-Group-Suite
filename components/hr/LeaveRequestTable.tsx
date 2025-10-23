
import React from 'react';
import { LeaveRequest, LeaveRequestStatus } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import { Check, X } from 'lucide-react';

interface LeaveRequestTableProps {
    requests: LeaveRequest[];
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
}

const statusStyles: Record<LeaveRequestStatus, string> = {
    pending: 'bg-sky-600/50 text-sky-300 border-sky-500',
    approved: 'bg-green-600/50 text-green-300 border-green-500',
    rejected: 'bg-red-800/50 text-red-300 border-red-700',
};

const LeaveRequestTable: React.FC<LeaveRequestTableProps> = ({ requests, onApprove, onReject }) => {
    const { user } = useAuth();
    const canManage = user?.role === 'admin' || user?.role === 'hr';

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Employee</th>
                        <th scope="col" className="px-6 py-3">Dates</th>
                        <th scope="col" className="px-6 py-3">Reason</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        {canManage && <th scope="col" className="px-6 py-3">Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {requests.map((req) => (
                        <tr key={req.id} className="border-b border-slate-800 hover:bg-slate-800/40">
                            <td className="px-6 py-4 font-medium text-white">{req.employeeName}</td>
                            <td className="px-6 py-4">{req.startDate} to {req.endDate}</td>
                            <td className="px-6 py-4 max-w-xs truncate">{req.reason}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 text-xs font-semibold capitalize rounded-full border ${statusStyles[req.status]}`}>
                                    {req.status}
                                </span>
                            </td>
                            {canManage && (
                                <td className="px-6 py-4">
                                    {req.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <Button onClick={() => onApprove(req.id)} className="!p-2 h-8 w-8 bg-green-700 hover:bg-green-600 focus:ring-green-500">
                                                <Check className="w-4 h-4" />
                                            </Button>
                                            <Button onClick={() => onReject(req.id)} className="!p-2 h-8 w-8 bg-red-800 hover:bg-red-700 focus:ring-red-600">
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default LeaveRequestTable;
