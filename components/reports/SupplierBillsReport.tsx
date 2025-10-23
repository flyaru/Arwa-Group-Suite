
import React from 'react';

interface SupplierBillReportData {
    supplierName: string;
    totalBilled: number;
    totalPaid: number;
    totalUnpaid: number;
    billCount: number;
}

interface SupplierBillsReportProps {
    data: SupplierBillReportData[];
}

const SupplierBillsReport: React.FC<SupplierBillsReportProps> = ({ data }) => {
    const totals = data.reduce((acc, supplier) => {
        acc.billed += supplier.totalBilled;
        acc.paid += supplier.totalPaid;
        acc.unpaid += supplier.totalUnpaid;
        return acc;
    }, { billed: 0, paid: 0, unpaid: 0 });

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Supplier Name</th>
                        <th scope="col" className="px-6 py-3 text-right">Total Billed (SAR)</th>
                        <th scope="col" className="px-6 py-3 text-right">Total Paid (SAR)</th>
                        <th scope="col" className="px-6 py-3 text-right">Total Unpaid (SAR)</th>
                        <th scope="col" className="px-6 py-3 text-center">Bill Count</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((supplier) => (
                        <tr key={supplier.supplierName} className="border-b border-slate-800 hover:bg-slate-800/40">
                            <td className="px-6 py-4 font-medium text-white">{supplier.supplierName}</td>
                            <td className="px-6 py-4 text-right">{supplier.totalBilled.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            <td className="px-6 py-4 text-right text-green-400">{supplier.totalPaid.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            <td className="px-6 py-4 text-right text-amber-400">{supplier.totalUnpaid.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            <td className="px-6 py-4 text-center">{supplier.billCount}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot className="text-sm font-bold text-white bg-slate-800">
                    <tr>
                        <td className="px-6 py-3">Grand Total</td>
                        <td className="px-6 py-3 text-right">{totals.billed.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        <td className="px-6 py-3 text-right text-green-400">{totals.paid.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        <td className="px-6 py-3 text-right text-amber-400">{totals.unpaid.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        <td className="px-6 py-3 text-center">-</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};

export default SupplierBillsReport;
