import React from 'react';
import type { Invoice, Customer } from '../../types';
import Button from '../ui/Button';

interface InvoiceTableProps {
    invoices: Invoice[];
    customers: Customer[];
    onViewInvoice: (invoice: Invoice) => void;
    selectedIds: Set<string>;
    onSelect: (id: string) => void;
    onSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const statusStyles = {
    draft: 'bg-slate-600/50 text-slate-300 border-slate-500',
    ready: 'bg-sky-600/50 text-sky-300 border-sky-500',
    paid: 'bg-green-600/50 text-green-300 border-green-500',
    void: 'bg-red-800/50 text-red-300 border-red-700',
};

const InvoiceTable: React.FC<InvoiceTableProps> = ({ invoices, customers, onViewInvoice, selectedIds, onSelect, onSelectAll }) => {
    const customerMap = new Map(customers.map(c => [c.id, c.name]));
    
    const isAllSelected = invoices.length > 0 && selectedIds.size === invoices.length;
    const isIndeterminate = selectedIds.size > 0 && selectedIds.size < invoices.length;

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
                        <th scope="col" className="px-6 py-3">Invoice #</th>
                        <th scope="col" className="px-6 py-3">Date</th>
                        <th scope="col" className="px-6 py-3">Customer</th>
                        <th scope="col" className="px-6 py-3">Total (SAR)</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3">
                            <span className="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {invoices.map((invoice) => (
                        <tr key={invoice.id} className={`border-b border-slate-800 hover:bg-slate-800/40 ${selectedIds.has(invoice.id) ? 'bg-slate-800' : ''}`}>
                             <td className="px-4 py-4">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 text-red-600 bg-slate-700 border-slate-500 rounded focus:ring-red-500"
                                    checked={selectedIds.has(invoice.id)}
                                    onChange={() => onSelect(invoice.id)}
                                />
                            </td>
                            <td className="px-6 py-4 font-medium text-white">{invoice.invoiceNo}</td>
                            <td className="px-6 py-4">{invoice.date}</td>
                            <td className="px-6 py-4">{customerMap.get(invoice.customerId) || 'Unknown'}</td>
                            <td className="px-6 py-4 font-semibold">{invoice.total.toFixed(2)}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 text-xs font-semibold capitalize rounded-full border ${statusStyles[invoice.status]}`}>
                                    {invoice.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                               <Button variant="secondary" className="py-1.5 px-3 text-xs" onClick={() => onViewInvoice(invoice)}>
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

export default InvoiceTable;