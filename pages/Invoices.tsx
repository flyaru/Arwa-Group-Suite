
import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import InvoiceTable from '../components/invoice/InvoiceTable';
import InvoiceDetailModal from '../components/invoice/InvoiceDetailModal';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import type { Invoice, Customer, DSR } from '../types';
import ExportButton from '../components/common/ExportButton';
import { Search, Trash2, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import ConfirmationModal from '../components/common/ConfirmationModal';

const InvoicesPage: React.FC = () => {
    // FIX: Added markInvoiceAsPaid to the destructuring from useApp.
    const { invoices, dsrs, handleInvoiceViewedAndLockDsr, markInvoiceAsPaid, customers, bulkMarkInvoicesAsPaid, bulkDeleteInvoices, logAction } = useApp();
    const { user } = useAuth();
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    // FIX: Explicitly typed the map to resolve type inference issues.
    const customerMap = useMemo(() => new Map<string, string>(customers.map(c => [c.id, c.name])), [customers]);

    const filteredInvoices = useMemo(() => {
        return invoices.filter(invoice => {
            const lowerSearchTerm = searchTerm.toLowerCase();
            const customerName = customerMap.get(invoice.customerId)?.toLowerCase() || '';

            const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
            const matchesSearch = searchTerm === '' ||
                customerName.includes(lowerSearchTerm) ||
                invoice.invoiceNo.toLowerCase().includes(lowerSearchTerm) ||
                invoice.dsrId.toLowerCase().includes(lowerSearchTerm);

            return matchesStatus && matchesSearch;
        });
    }, [invoices, searchTerm, statusFilter, customerMap]);


    // Data for export
    const invoiceExportData = useMemo(() => {
        return filteredInvoices.map(invoice => ({
            ...invoice,
            customerName: customerMap.get(invoice.customerId) || 'Unknown',
        }));
    }, [filteredInvoices, customerMap]);

    const invoiceExportColumns = [
        { Header: 'Invoice No', accessor: 'invoiceNo' as const },
        { Header: 'Date', accessor: 'date' as const },
        { Header: 'Customer', accessor: 'customerName' as const },
        { Header: 'DSR ID', accessor: 'dsrId' as const },
        { Header: 'Subtotal', accessor: 'subtotal' as const },
        { Header: 'VAT', accessor: 'vat' as const },
        { Header: 'Total', accessor: 'total' as const },
        { Header: 'Status', accessor: 'status' as const },
    ];
    
    const handleSelect = (id: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(new Set(filteredInvoices.map(i => i.id)));
        } else {
            setSelectedIds(new Set());
        }
    };
    
    const handleMarkSelectedAsPaid = () => {
        if (!user) return;
        const ids = Array.from(selectedIds);
        bulkMarkInvoicesAsPaid(ids);
        logAction({
            userId: user.id,
            userName: user.name,
            action: 'UPDATE_INVOICE_STATUS',
            details: `Bulk marked ${ids.length} invoices as paid.`,
            targetId: ids.join(', '),
        });
        setSelectedIds(new Set());
    };

    const handleDeleteSelected = () => {
        bulkDeleteInvoices(Array.from(selectedIds));
        setSelectedIds(new Set());
        setIsConfirmModalOpen(false);
    };

    const handleViewInvoice = (invoice: Invoice) => {
        if (!invoice.firstViewedAt) {
            handleInvoiceViewedAndLockDsr(invoice.id);
        }
        setSelectedInvoice(invoice);
        setIsDetailModalOpen(true);
    };

    const selectedCustomer = customers.find(c => c.id === selectedInvoice?.customerId);
    const selectedDsr = dsrs.find(d => d.id === selectedInvoice?.dsrId);

    return (
        <div className="space-y-6">
            <Card>
                <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white">All Invoices</h2>
                        <ExportButton data={invoiceExportData} columns={invoiceExportColumns} filename="invoices_report" />
                    </div>
                </div>
                <div className="p-4 sm:px-6 border-t border-slate-800 flex flex-col md:flex-row items-center gap-4">
                    {selectedIds.size > 0 ? (
                        <div className="flex items-center gap-4 w-full">
                            <span className="text-sm font-medium text-white">{selectedIds.size} selected</span>
                             <Button
                                variant="secondary"
                                className="!py-2 !px-3 text-xs border-green-600/50 text-green-400 hover:bg-green-900/40"
                                onClick={handleMarkSelectedAsPaid}
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Mark as Paid
                            </Button>
                            <Button
                                variant="secondary"
                                className="!py-2 !px-3 text-xs border-red-600/50 text-red-400 hover:bg-red-900/40"
                                onClick={() => setIsConfirmModalOpen(true)}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="relative w-full md:flex-grow">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by invoice #, customer, or DSR ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D10028]/80"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full md:w-48 px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#D10028]/80"
                            >
                                <option value="all">All Statuses</option>
                                <option value="draft">Draft</option>
                                <option value="ready">Ready</option>
                                <option value="paid">Paid</option>
                                <option value="void">Void</option>
                            </select>
                        </>
                    )}
                </div>
                <InvoiceTable 
                    invoices={filteredInvoices} 
                    customers={customers} 
                    onViewInvoice={handleViewInvoice}
                    selectedIds={selectedIds}
                    onSelect={handleSelect}
                    onSelectAll={handleSelectAll}
                />
            </Card>

            {selectedInvoice && selectedCustomer && selectedDsr && (
                <InvoiceDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    invoice={selectedInvoice}
                    customer={selectedCustomer}
                    dsr={selectedDsr}
                    onMarkAsPaid={markInvoiceAsPaid}
                />
            )}
            
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleDeleteSelected}
                title="Confirm Deletion"
                message={`Are you sure you want to delete ${selectedIds.size} invoice(s)? This action cannot be undone.`}
                confirmText="Delete"
            />
        </div>
    );
};

export default InvoicesPage;
