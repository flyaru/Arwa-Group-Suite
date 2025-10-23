
import React from 'react';
import type { Supplier, SupplierBill } from '../../types';
import Button from '../ui/Button';

interface SupplierTableProps {
    suppliers: Supplier[];
    bills: SupplierBill[];
    onView: (supplier: Supplier) => void;
}

const SupplierTable: React.FC<SupplierTableProps> = ({ suppliers, bills, onView }) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Name</th>
                        <th scope="col" className="px-6 py-3">Type</th>
                        <th scope="col" className="px-6 py-3">Total Billed (SAR)</th>
                        <th scope="col" className="px-6 py-3">
                            <span className="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {suppliers.map((supplier) => {
                        const totalBilled = bills
                            .filter(b => b.supplierId === supplier.id && b.status !== 'void')
                            .reduce((sum, b) => sum + b.total, 0);

                        return (
                            <tr key={supplier.id} className="border-b border-slate-800 hover:bg-slate-800/40">
                                <td className="px-6 py-4 font-medium text-white">{supplier.name}</td>
                                <td className="px-6 py-4 capitalize">{supplier.type}</td>
                                <td className="px-6 py-4 font-semibold">{totalBilled.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td className="px-6 py-4 text-right">
                                    <Button variant="secondary" className="py-1.5 px-3 text-xs" onClick={() => onView(supplier)}>
                                        View
                                    </Button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default SupplierTable;
