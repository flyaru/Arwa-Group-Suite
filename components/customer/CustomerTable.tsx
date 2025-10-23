import React from 'react';
import type { Customer } from '../../types';

interface CustomerTableProps {
    customers: Customer[];
    selectedIds: Set<string>;
    onSelect: (id: string) => void;
    onSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const CustomerTable: React.FC<CustomerTableProps> = ({ customers, selectedIds, onSelect, onSelectAll }) => {
    const isAllSelected = customers.length > 0 && selectedIds.size === customers.length;
    const isIndeterminate = selectedIds.size > 0 && selectedIds.size < customers.length;

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
                        <th scope="col" className="px-6 py-3">Name</th>
                        <th scope="col" className="px-6 py-3">Contact</th>
                        <th scope="col" className="px-6 py-3">Type</th>
                        <th scope="col" className="px-6 py-3">Total Spend (SAR)</th>
                        <th scope="col" className="px-6 py-3">
                            <span className="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {customers.map((customer) => (
                        <tr key={customer.id} className={`border-b border-slate-800 hover:bg-slate-800/40 ${selectedIds.has(customer.id) ? 'bg-slate-800' : ''}`}>
                             <td className="px-4 py-4">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 text-red-600 bg-slate-700 border-slate-500 rounded focus:ring-red-500"
                                    checked={selectedIds.has(customer.id)}
                                    onChange={() => onSelect(customer.id)}
                                />
                            </td>
                            <td className="px-6 py-4 font-medium text-white">{customer.name}</td>
                            <td className="px-6 py-4">{customer.phone}<br/><span className="text-xs text-slate-400">{customer.email}</span></td>
                            <td className="px-6 py-4 capitalize">{customer.type}</td>
                            <td className="px-6 py-4 font-semibold">{customer.totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="px-6 py-4 text-right">
                                <a href="#" className="font-medium text-red-500 hover:underline">View</a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CustomerTable;