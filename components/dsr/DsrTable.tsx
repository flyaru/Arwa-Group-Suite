import React from 'react';
import type { DSR, Customer } from '../../types';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

interface DsrTableProps {
    dsrs: DSR[];
    customers: Customer[];
    onViewDsr: (dsr: DSR) => void;
    selectedIds: Set<string>;
    onSelect: (id: string) => void;
    onSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const DsrTable: React.FC<DsrTableProps> = ({ dsrs, customers, onViewDsr, selectedIds, onSelect, onSelectAll }) => {
    const customerMap = new Map(customers.map(c => [c.id, c.name]));

    const isAllSelected = dsrs.length > 0 && selectedIds.size === dsrs.length;
    const isIndeterminate = selectedIds.size > 0 && selectedIds.size < dsrs.length;

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                    <tr>
                         <th scope="col" className="px-4 py-3">
                            <input
                                type="checkbox"
                                className="w-4 h-4 text-red-600 bg-slate-700 border-slate-500 rounded focus:ring-red-500"
                                checked={isAllSelected}
                                // FIX: The ref callback for setting the indeterminate state was returning a boolean, which is not a valid Ref type. Wrapped in a block to ensure a void return.
                                ref={el => {
                                    if (el) {
                                        el.indeterminate = isIndeterminate;
                                    }
                                }}
                                onChange={onSelectAll}
                            />
                        </th>
                        <th scope="col" className="px-6 py-3">Date</th>
                        <th scope="col" className="px-6 py-3">Customer</th>
                        <th scope="col" className="px-6 py-3">PNR / Ticket No</th>
                        <th scope="col" className="px-6 py-3">Route</th>
                        <th scope="col" className="px-6 py-3">Fare (SAR)</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3">
                            <span className="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {dsrs.map((dsr) => (
                        <tr key={dsr.id} className={`border-b border-slate-800 hover:bg-slate-800/40 ${selectedIds.has(dsr.id) ? 'bg-slate-800' : ''}`}>
                             <td className="px-4 py-4">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 text-red-600 bg-slate-700 border-slate-500 rounded focus:ring-red-500"
                                    checked={selectedIds.has(dsr.id)}
                                    onChange={() => onSelect(dsr.id)}
                                />
                            </td>
                            <td className="px-6 py-4">{dsr.date}</td>
                            <td className="px-6 py-4 font-medium text-white">{customerMap.get(dsr.customerId) || 'Unknown'}</td>
                            <td className="px-6 py-4">{dsr.pnr}<br/><span className="text-xs text-slate-400">{dsr.ticketNo}</span></td>
                            <td className="px-6 py-4">{dsr.route}</td>
                            <td className="px-6 py-4 font-semibold">{dsr.sellingFare.toFixed(2)}</td>
                            <td className="px-6 py-4">
                                <Badge status={dsr.status} />
                            </td>
                            <td className="px-6 py-4 text-right">
                               <Button variant="secondary" className="py-1.5 px-3 text-xs" onClick={() => onViewDsr(dsr)}>
                                    View
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DsrTable;