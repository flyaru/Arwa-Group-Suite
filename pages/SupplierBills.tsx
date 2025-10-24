
import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import SupplierBillTable from '../components/supplier-bill/SupplierBillTable';
import SupplierBillDetailModal from '../components/supplier-bill/SupplierBillDetailModal';
import { useApp } from '../contexts/AppContext';
import type { DSR, SupplierBill } from '../types';
import ExportButton from '../components/common/ExportButton';
import { Search, CheckCircle, Trash2, Plus } from 'lucide-react';
import Button from '../components/ui/Button';
import ConfirmationModal from '../components/common/ConfirmationModal';
import SupplierBillFormModal from '../components/supplier-bill/SupplierBillFormModal';


const SupplierBillsPage: React.FC = () => {
    const { supplierBills, updateSupplierBillStatus, suppliers, dsrs, addSupplierBill, bulkMarkSupplierBillsAsPaid, bulkDeleteSupplierBills } = useApp();
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedBill, setSelectedBill] = useState<SupplierBill | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    // FIX: Explicitly typed the maps to resolve type inference issues.
    const supplierMap = useMemo(() => new Map<string, string>(suppliers.map(s => [s.id, s.name])), [suppliers]);
    const dsrMap = useMemo(() => new Map<string, DSR>(dsrs.map(d => [d.id, d])), [dsrs]);

    const filteredBills = useMemo(() => {
        return supplierBills.filter(bill => {
            const lowerSearchTerm = searchTerm.toLowerCase();
            const supplierName = supplierMap.get(bill.supplierId)?.toLowerCase() || '';

            const matchesStatus = statusFilter === 'all' || bill.status === statusFilter;
            const matchesSearch = searchTerm === '' ||
                supplierName.includes(lowerSearchTerm) ||
                bill.billNo.toLowerCase().includes(lowerSearchTerm) ||
                bill.dsrId.toLowerCase().includes(lowerSearchTerm);

            return matchesStatus && matchesSearch;
        });
    }, [supplierBills, searchTerm, statusFilter, supplierMap]);

    const billExportData = useMemo(() => {
        return filteredBills.map(bill => ({
            ...bill,
            supplierName: supplierMap.get(bill.supplierId) || 'Unknown',
        }));
    }, [filteredBills, supplierMap]);

    const billExportColumns = [
        { Header: 'Bill No', accessor: 'billNo' as const },
        { Header: 'Date', accessor: 'date' as const },
        { Header: 'Supplier', accessor: 'supplierName' as const },
        { Header: 'DSR ID', accessor: 'dsrId' as const },
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
            setSelectedIds(new Set(filteredBills.map(b => b.id)));
        } else {
            setSelectedIds(new Set());
        }
    };
    
    const handleMarkSelectedAsPaid = () => {
        bulkMarkSupplierBillsAsPaid(Array.from(selectedIds));
        setSelectedIds(new Set());
    };

    const handleDeleteSelected = () => {
        bulkDeleteSupplierBills(Array.from(selectedIds));
        setSelectedIds(new Set());
        setIsConfirmModalOpen(false);
    };

    const handleViewBill = (bill: SupplierBill) => {
        setSelectedBill(bill);
        setIsDetailModalOpen(true);
    };

    const handleUpdateStatus = (billId: string, status: SupplierBill['status']) => {
        updateSupplierBillStatus(billId, status);
        setIsDetailModalOpen(false);
    };

    const handleSaveBill = (billData: Omit<SupplierBill, 'id' | 'status'>) => {
        // FIX: Resolved an error where `addSupplierBill` was called with an incomplete `SupplierBill` object by adding the required `id` property before saving.
        addSupplierBill({ id: `BILL-${Date.now()}`, ...billData, status: 'unpaid' });
        setIsFormModalOpen(false);
    };
    
    const relatedDsr = selectedBill ? dsrMap.get(selectedBill.dsrId) : undefined;

    return (
        <div className="space-y-6">
            <Card>
                <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white">All Supplier Bills</h2>
                        <div className="flex items-center gap-4">
                            <ExportButton data={billExportData} columns={billExportColumns} filename="supplier_bills_report" />
                             <Button onClick={() => setIsFormModalOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                New Bill
                            </Button>
                        </div>
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
                                    placeholder="Search by bill #, supplier, or DSR ID..."
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
                                <option value="unpaid">Unpaid</option>
                                <option value="paid">Paid</option>
                                <option value="void">Void</option>
                            </select>
                        </>
                    )}
                </div>
                <SupplierBillTable
                    bills={filteredBills}
                    suppliers={suppliers}
                    onViewBill={handleViewBill}
                    selectedIds={selectedIds}
                    onSelect={handleSelect}
                    onSelectAll={handleSelectAll}
                />
            </Card>

            {selectedBill && (
                <SupplierBillDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    bill={selectedBill}
                    supplier={suppliers.find(s => s.id === selectedBill.supplierId)}
                    dsr={relatedDsr}
                    onUpdateStatus={handleUpdateStatus}
                />
            )}
            
             <SupplierBillFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSave={handleSaveBill}
                suppliers={suppliers}
            />
            
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleDeleteSelected}
                title="Confirm Deletion"
                message={`Are you sure you want to delete ${selectedIds.size} supplier bill(s)? This action cannot be undone.`}
                confirmText="Delete"
            />
        </div>
    );
};

export default SupplierBillsPage;