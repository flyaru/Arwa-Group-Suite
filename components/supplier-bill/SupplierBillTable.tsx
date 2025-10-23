import React from 'react';
import type { SupplierBill, Supplier } from '../../types';
import Button from '../ui/Button';

interface SupplierBillTableProps {
    bills: SupplierBill[];
    suppliers: Supplier[];
    onViewBill: (bill: SupplierBill) => void;
    selectedIds: Set<string>;
    onSelect: (id: string) => void;
    onSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const statusStyles = {
    unpaid: 'bg-amber-600/50 text-amber-300 border-amber-500',
    paid: 'bg-green-600/50 text-green-300 border-green-500',
    void: 'bg-red-800/50 text-red-300 border-red-700',
};

const SupplierBillTable: React.FC<SupplierBillTableProps> = ({ bills, suppliers, onViewBill, selectedIds, onSelect, onSelectAll }) => {
    const supplierMap = new Map(suppliers.map(s => [s.id, s.name]));
    
    const isAllSelected = bills.length > 0 && selectedIds.size === bills.length;
    const isIndeterminate = selectedIds.size > 0 && selectedIds.size < bills.length;

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
                        <th scope="col" className="px-6 py-3">Bill #</th>
                        <th scope="col" className="px-6 py-3">Date</th>
                        <th scope="col" className="px-6 py-3">Supplier</th>
                        <th scope="col" className="px-6 py-3">DSR Ref</th>
                        <th scope="col" className="px-6 py-3">Total (SAR)</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3">
                            <span className="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {bills.map((bill) => (
                        <tr key={bill.id} className={`border-b border-slate-800 hover:bg-slate-800/40 ${selectedIds.has(bill.id) ? 'bg-slate-800' : ''}`}>
                             <td className="px-4 py-4">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 text-red-600 bg-slate-700 border-slate-500 rounded focus:ring-red-500"
                                    checked={selectedIds.has(bill.id)}
                                    onChange={() => onSelect(bill.id)}
                                />
                            </td>
                            <td className="px-6 py-4 font-medium text-white">{bill.billNo}</td>
                            <td className="px-6 py-4">{bill.date}</td>
                            <td className="px-6 py-4">{supplierMap.get(bill.supplierId) || 'Unknown'}</td>
                            <td className="px-6 py-4 font-mono text-xs">{bill.dsrId}</td>
                            <td className="px-6 py-4 font-semibold">{bill.total.toFixed(2)}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 text-xs font-semibold capitalize rounded-full border ${statusStyles[bill.status]}`}>
                                    {bill.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                               <Button variant="secondary" className="py-1.5 px-3 text-xs" onClick={() => onViewBill(bill)}>
                                    Details
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SupplierBillTable;