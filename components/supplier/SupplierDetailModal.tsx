
import React, { useMemo } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import type { Supplier, SupplierBill } from '../../types';

interface SupplierDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    supplier: Supplier;
    bills: SupplierBill[];
}

const statusStyles = {
    unpaid: 'bg-amber-600/50 text-amber-300 border-amber-500',
    paid: 'bg-green-600/50 text-green-300 border-green-500',
    void: 'bg-red-800/50 text-red-300 border-red-700',
};

const SupplierDetailModal: React.FC<SupplierDetailModalProps> = ({ isOpen, onClose, supplier, bills }) => {
    
    const financialSummary = useMemo(() => {
        const validBills = bills.filter(b => b.status !== 'void');
        const totalBilled = validBills.reduce((sum, b) => sum + b.total, 0);
        const totalPaid = validBills.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.total, 0);
        const totalUnpaid = totalBilled - totalPaid;
        return { totalBilled, totalPaid, totalUnpaid };
    }, [bills]);

    const SummaryCard: React.FC<{ title: string; value: number; color: string }> = ({ title, value, color }) => (
        <div className={`p-3 rounded-lg bg-slate-800/50 border-l-4 ${color}`}>
            <p className="text-xs text-slate-400 font-medium">{title}</p>
            <p className="text-lg font-bold text-white mt-1">SAR {value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Supplier Details: ${supplier.name}`}>
            <div className="space-y-4">
                <div className="bg-slate-800/50 p-4 rounded-lg">
                    <p className="text-lg font-bold text-white">{supplier.name}</p>
                    <p className="text-sm text-slate-400 capitalize">{supplier.type}</p>
                </div>
                
                <div>
                    <h3 className="text-base font-bold text-white mb-2">Financial Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <SummaryCard title="Total Billed" value={financialSummary.totalBilled} color="border-sky-500" />
                        <SummaryCard title="Total Paid" value={financialSummary.totalPaid} color="border-green-500" />
                        <SummaryCard title="Total Unpaid" value={financialSummary.totalUnpaid} color="border-amber-500" />
                    </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-700">
                     <h3 className="text-base font-bold text-white mb-2">Bill History</h3>
                     <div className="overflow-y-auto max-h-60 border border-slate-800 rounded-lg">
                        <table className="w-full text-sm text-left text-slate-300">
                            <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2">Bill #</th>
                                    <th className="px-4 py-2">Date</th>
                                    <th className="px-4 py-2 text-right">Amount (SAR)</th>
                                    <th className="px-4 py-2 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {bills.map(bill => (
                                    <tr key={bill.id}>
                                        <td className="px-4 py-2 font-medium text-white">{bill.billNo}</td>
                                        <td className="px-4 py-2">{bill.date}</td>
                                        <td className="px-4 py-2 text-right font-semibold">{bill.total.toFixed(2)}</td>
                                        <td className="px-4 py-2 text-center">
                                            <span className={`px-2 py-0.5 text-xs font-semibold capitalize rounded-full border ${statusStyles[bill.status]}`}>
                                                {bill.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                     </div>
                </div>

                <div className="flex justify-end gap-4 pt-6">
                    <Button type="button" variant="secondary" onClick={onClose}>Close</Button>
                </div>
            </div>
        </Modal>
    );
};

export default SupplierDetailModal;
