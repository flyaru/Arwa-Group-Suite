
import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import { useApp } from '../contexts/AppContext';
import { Search, PlusCircle, Edit, Trash2, LogIn, LogOut, CheckCircle, XCircle } from 'lucide-react';
import { AuditLogAction } from '../types';

const actionIcons: Record<AuditLogAction, React.ElementType> = {
    USER_LOGIN: LogIn,
    USER_LOGOUT: LogOut,
    CREATE_DSR: PlusCircle,
    UPDATE_DSR_STATUS: Edit,
    DELETE_DSR: Trash2,
    CREATE_INVOICE: PlusCircle,
    UPDATE_INVOICE_STATUS: CheckCircle,
    DELETE_INVOICE: Trash2,
    CREATE_CUSTOMER: PlusCircle,
    DELETE_CUSTOMER: Trash2,
};

const actionColors: Record<AuditLogAction, string> = {
    USER_LOGIN: 'text-green-400',
    USER_LOGOUT: 'text-red-400',
    CREATE_DSR: 'text-green-400',
    UPDATE_DSR_STATUS: 'text-sky-400',
    DELETE_DSR: 'text-red-400',
    CREATE_INVOICE: 'text-green-400',
    UPDATE_INVOICE_STATUS: 'text-amber-400',
    DELETE_INVOICE: 'text-red-400',
    CREATE_CUSTOMER: 'text-green-400',
    DELETE_CUSTOMER: 'text-red-400',
};


const AuditLogPage: React.FC = () => {
    // FIX: Use employees from context instead of mockUsers for the filter.
    const { auditLog, employees } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [userFilter, setUserFilter] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const filteredLogs = useMemo(() => {
        return auditLog.filter(log => {
            const logDate = new Date(log.timestamp);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;
            if (end) end.setHours(23, 59, 59, 999);

            const matchesSearch = log.details.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesUser = userFilter === 'all' || log.userId === userFilter;
            const matchesDate = (!start || logDate >= start) && (!end || logDate <= end);

            return matchesSearch && matchesUser && matchesDate;
        });
    }, [auditLog, searchTerm, userFilter, startDate, endDate]);

    return (
        <div className="space-y-6">
            <Card>
                <div className="p-4 sm:p-6">
                    <h2 className="text-lg font-bold text-white">Audit Log</h2>
                </div>
                <div className="p-4 sm:px-6 border-t border-slate-800 flex flex-col md:flex-row items-center gap-4">
                     <div className="relative w-full md:flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search log details..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D10028]/80"
                        />
                    </div>
                    <select
                        value={userFilter}
                        onChange={(e) => setUserFilter(e.target.value)}
                        className="w-full md:w-48 px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#D10028]/80"
                    >
                        <option value="all">All Users</option>
                        {employees.map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                    </select>
                    <input
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="w-full md:w-auto px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white"
                    />
                    <input
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="w-full md:w-auto px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white"
                    />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 w-12"></th>
                                <th scope="col" className="px-6 py-3">Timestamp</th>
                                <th scope="col" className="px-6 py-3">User</th>
                                <th scope="col" className="px-6 py-3">Action</th>
                                <th scope="col" className="px-6 py-3">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map((log) => {
                                const Icon = actionIcons[log.action] || CheckCircle;
                                const color = actionColors[log.action] || 'text-slate-400';
                                return (
                                    <tr key={log.id} className="border-b border-slate-800 hover:bg-slate-800/40">
                                        <td className="px-6 py-4">
                                            <Icon className={`w-5 h-5 ${color}`} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                                        <td className="px-6 py-4 font-medium text-white">{log.userName}</td>
                                        <td className="px-6 py-4 font-mono text-xs">{log.action}</td>
                                        <td className="px-6 py-4">{log.details}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default AuditLogPage;
