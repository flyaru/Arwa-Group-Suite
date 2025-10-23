
import React from 'react';
import { AttendanceRecord } from '../../types';
import { Clock } from 'lucide-react';

interface AttendanceLogTableProps {
    records: AttendanceRecord[];
}

const AttendanceLogTable: React.FC<AttendanceLogTableProps> = ({ records }) => {
    
    const calculateDuration = (startTime: string, endTime?: string): string => {
        if (!endTime) return 'In Progress';
        const start = new Date(startTime);
        const end = new Date(endTime);
        const diffMs = end.getTime() - start.getTime();
        if (diffMs < 0) return 'Invalid';

        const hours = Math.floor(diffMs / 3600000);
        const minutes = Math.floor((diffMs % 3600000) / 60000);
        
        return `${hours}h ${minutes}m`;
    };

    return (
        <div className="overflow-x-auto max-h-[400px]">
            <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 sticky top-0">
                    <tr>
                        <th scope="col" className="px-6 py-3">Employee</th>
                        <th scope="col" className="px-6 py-3">Date</th>
                        <th scope="col" className="px-6 py-3">Clock In</th>
                        <th scope="col" className="px-6 py-3">Clock Out</th>
                        <th scope="col" className="px-6 py-3">Duration</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {records.map((record) => (
                        <tr key={record.id} className="hover:bg-slate-800/40">
                            <td className="px-6 py-4 font-medium text-white">{record.employeeName}</td>
                            <td className="px-6 py-4">{new Date(record.clockInTime).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-green-400">{new Date(record.clockInTime).toLocaleTimeString()}</td>
                            <td className="px-6 py-4 text-red-400">
                                {record.clockOutTime ? new Date(record.clockOutTime).toLocaleTimeString() : (
                                    <span className="flex items-center gap-2 text-amber-400">
                                        <Clock className="w-4 h-4 animate-pulse" />
                                        Clocked In
                                    </span>
                                )}
                            </td>
                             <td className="px-6 py-4 font-semibold">{calculateDuration(record.clockInTime, record.clockOutTime)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AttendanceLogTable;
