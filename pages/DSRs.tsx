
import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import DsrTable from '../components/dsr/DsrTable';
import DsrFormModal from '../components/dsr/DsrFormModal';
import DsrDetailModal from '../components/dsr/DsrDetailModal';
import RejectReasonModal from '../components/dsr/RejectReasonModal';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import type { DSR, Invoice, InvoiceItem, SupplierBill, Customer } from '../types';
import { Plus, Search, Trash2 } from 'lucide-react';
import { generateZatcaTlvBase64 } from '../lib/zatca';
import { generateNextInvoiceNumber } from '../lib/invoiceUtils';
import ExportButton from '../components/common/ExportButton';
import ConfirmationModal from '../components/common/ConfirmationModal';

const DSRsPage: React.FC = () => {
    const { dsrs, addDsr, updateDsr, addInvoice, invoices, updateInvoice, addSupplierBill, customers, suppliers, addCustomer, bulkDeleteDsrs, logAction } = useApp();
    const { user } = useAuth();
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [selectedDsr, setSelectedDsr] = useState<DSR | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [serviceTypeFilter, setServiceTypeFilter] = useState('all');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const canCreateDsr = user && ['admin', 'manager', 'supervisor', 'agent'].includes(user.role);

    // FIX: Explicitly typed the map to resolve type inference issues.
    const customerMap = useMemo(() => new Map<string, string>(customers.map(c => [c.id, c.name])), [customers]);

    const filteredDsrs = useMemo(() => {
        let baseDsrs = dsrs;
        if (user?.role === 'agent') {
            baseDsrs = dsrs.filter(dsr => dsr.agentUsername === user.username);
        }

        return baseDsrs.filter(dsr => {
            const lowerSearchTerm = searchTerm.toLowerCase();
            const customerName = customerMap.get(dsr.customerId)?.toLowerCase() || '';

            const matchesStatus = statusFilter === 'all' || dsr.status === statusFilter;
            const matchesServiceType = serviceTypeFilter === 'all' || dsr.serviceType === serviceTypeFilter;
            const matchesSearch = searchTerm === '' ||
                customerName.includes(lowerSearchTerm) ||
                dsr.pnr.toLowerCase().includes(lowerSearchTerm) ||
                dsr.ticketNo.toLowerCase().includes(lowerSearchTerm) ||
                dsr.route.toLowerCase().includes(lowerSearchTerm);

            return matchesStatus && matchesServiceType && matchesSearch;
        });
    }, [dsrs, user, searchTerm, statusFilter, serviceTypeFilter, customerMap]);


    // Data for export needs to be flattened
    const dsrExportData = useMemo(() => {
        const customerMap = new Map(customers.map(c => [c.id, c.name]));
        const supplierMap = new Map(suppliers.map(s => [s.id, s.name]));
        // FIX: Now uses filtered DSRs for export.
        return filteredDsrs.map(dsr => ({
            ...dsr,
            customerName: customerMap.get(dsr.customerId) || 'Unknown',
            supplierName: dsr.supplierId ? supplierMap.get(dsr.supplierId) || 'Unknown' : 'N/A',
        }));
    }, [filteredDsrs, customers, suppliers]);

    const dsrExportColumns = [
        { Header: 'ID', accessor: 'id' as const },
        { Header: 'Date', accessor: 'date' as const },
        { Header: 'Agent', accessor: 'agentName' as const },
        { Header: 'Customer', accessor: 'customerName' as const },
        { Header: 'Supplier', accessor: 'supplierName' as const },
        { Header: 'Service Type', accessor: 'serviceType' as const },
        { Header: 'PNR', accessor: 'pnr' as const },
        { Header: 'Ticket No', accessor: 'ticketNo' as const },
        { Header: 'Route', accessor: 'route' as const },
        { Header: 'Selling Fare', accessor: 'sellingFare' as const },
        { Header: 'Net Fare', accessor: 'netFare' as const },
        { Header: 'Commission', accessor: 'commission' as const },
        { Header: 'Status', accessor: 'status' as const },
        { Header: 'Payment Method', accessor: 'paymentMethod' as const },
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
            setSelectedIds(new Set(filteredDsrs.map(d => d.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleDeleteSelected = async () => {
        await bulkDeleteDsrs(Array.from(selectedIds));
        setSelectedIds(new Set());
        setIsConfirmModalOpen(false);
    };


    const handleSaveDsr = async (
        dsrData: Omit<DSR, 'id' | 'status' | 'date' | 'agentUsername' | 'agentName' | 'customerId'>,
        customerData: { name: string; phone: string; email: string; type: Customer['type'] }
    ) => {
        if (!user) return;

        // 1. Find or create customer
        let customer = customers.find(c => c.phone === customerData.phone);
        if (!customer) {
            customer = await addCustomer(customerData);
        }

        // 2. Create DSR with 'draft' status
        const dsrId = `DSR-${Date.now()}`;
        const dsrToAdd: DSR = {
            id: dsrId,
            date: new Date().toISOString().split('T')[0],
            agentUsername: user.username,
            agentName: user.name,
            status: 'draft',
            customerId: customer.id,
            ...dsrData,
        };

        await addDsr(dsrToAdd);
        // addRouteFromDsr(dsrToAdd); This logic is frontend only, can be re-enabled if needed
        await logAction({
            userId: user.id,
            userName: user.name,
            action: 'CREATE_DSR',
            details: `Created DSR (${dsrToAdd.id}) for PNR ${dsrToAdd.pnr}`,
            targetId: dsrToAdd.id,
        });
    };


    const handleViewDsr = (dsr: DSR) => {
        setSelectedDsr(dsr);
        setIsDetailModalOpen(true);
    };

    const handleSubmitForApproval = async () => {
        if (!selectedDsr || selectedDsr.status !== 'draft' || !user) return;
        const dsrToSubmit = selectedDsr;

        // 1. Create ZATCA Invoice
        const invoiceItems: InvoiceItem[] = [{
            id: '1',
            description: `${dsrToSubmit.serviceType.charAt(0).toUpperCase() + dsrToSubmit.serviceType.slice(1)} - ${dsrToSubmit.route} (PNR: ${dsrToSubmit.pnr})`,
            qty: 1,
            unitPrice: dsrToSubmit.sellingFare,
            lineTotal: dsrToSubmit.sellingFare
        }];
        
        const subtotal = dsrToSubmit.sellingFare;
        const vat = dsrToSubmit.vatOnCommission;
        const total = subtotal + vat;

        const sellerName = "ARWA TRAVEL & EVENTS";
        const vatNumber = "310263881300003";
        const timestamp = new Date().toISOString();
        const tlv = generateZatcaTlvBase64(sellerName, vatNumber, timestamp, total.toFixed(2), vat.toFixed(2));

        const newInvoice: Invoice = {
            id: `INV-${Date.now()}`,
            invoiceNo: generateNextInvoiceNumber(),
            date: new Date().toISOString().split('T')[0],
            customerId: dsrToSubmit.customerId,
            dsrId: dsrToSubmit.id,
            items: invoiceItems,
            subtotal,
            vat,
            total,
            status: 'ready',
            qrCodeTlv: tlv,
        };
        await addInvoice(newInvoice);
        
        // 2. Create an unpaid supplier bill if a supplier is linked
        if (dsrToSubmit.supplierId) {
            const newBill: Omit<SupplierBill, 'id'> = {
                billNo: `B-${dsrToSubmit.pnr || dsrToSubmit.id.slice(-4)}`,
                supplierId: dsrToSubmit.supplierId,
                dsrId: dsrToSubmit.id,
                date: new Date().toISOString().split('T')[0],
                total: dsrToSubmit.netFare,
                status: 'unpaid',
            };
            await addSupplierBill(newBill);
        }

        // 3. Update DSR status to 'submitted'
        const updatedDsr = { ...dsrToSubmit, status: 'submitted' as 'submitted', remarks: 'Submitted for approval.' };
        await updateDsr(updatedDsr);
        await logAction({
            userId: user.id,
            userName: user.name,
            action: 'UPDATE_DSR_STATUS',
            details: `Submitted DSR (${updatedDsr.id}) for approval. Status changed to ${updatedDsr.status}`,
            targetId: updatedDsr.id,
        });

        setIsDetailModalOpen(false);
        setSelectedDsr(null);
    };

    const handleApproveDsr = async () => {
        if (!selectedDsr || !user) return;

        // 1. Update DSR status
        const updatedDsr = { ...selectedDsr, status: 'approved' as 'approved', remarks: 'DSR Approved.' };
        await updateDsr(updatedDsr);

        // 2. Find associated draft invoice and update its status
        const associatedInvoice = invoices.find(inv => inv.dsrId === selectedDsr.id);
        if (associatedInvoice) {
            await updateInvoice({ ...associatedInvoice, status: 'ready' });
        }
        
        await logAction({
            userId: user.id,
            userName: user.name,
            action: 'UPDATE_DSR_STATUS',
            details: `Approved DSR (${updatedDsr.id}). Status changed to ${updatedDsr.status}`,
            targetId: updatedDsr.id,
        });

        // 3. Close modal
        setIsDetailModalOpen(false);
        setSelectedDsr(null);
    };
    
    const handleStartReject = () => {
        setIsDetailModalOpen(false);
        setIsRejectModalOpen(true);
    };

    const handleConfirmReject = async (reason: string) => {
        if (!selectedDsr || !user) return;
        const updatedDsr = { ...selectedDsr, status: 'draft' as 'draft', remarks: reason };
        await updateDsr(updatedDsr);
        await logAction({
            userId: user.id,
            userName: user.name,
            action: 'UPDATE_DSR_STATUS',
            details: `Rejected DSR (${updatedDsr.id}). Status changed to ${updatedDsr.status}. Reason: ${reason}`,
            targetId: updatedDsr.id,
        });

        setIsRejectModalOpen(false);
        setSelectedDsr(null);
    };
    
    const handlePostDsr = async () => {
        if (!selectedDsr || !user) return;
        const updatedDsr = { ...selectedDsr, status: 'posted' as 'posted' };
        await updateDsr(updatedDsr);
        await logAction({
            userId: user.id,
            userName: user.name,
            action: 'UPDATE_DSR_STATUS',
            details: `Posted DSR (${updatedDsr.id}) to ledger. Status changed to ${updatedDsr.status}`,
            targetId: updatedDsr.id,
        });
        setIsDetailModalOpen(false);
        setSelectedDsr(null);
    };


    return (
        <div className="space-y-6">
            <Card>
                <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <h2 className="text-lg font-bold text-white">All DSRs</h2>
                        <div className="flex items-center gap-2 sm:gap-4">
                            <ExportButton data={dsrExportData} columns={dsrExportColumns} filename="dsr_report" />
                            {canCreateDsr && (
                                <Button onClick={() => setIsFormModalOpen(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create DSR
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 sm:px-6 border-t border-slate-800 flex flex-col md:flex-row items-center gap-4 flex-wrap">
                    {selectedIds.size > 0 ? (
                        <div className="flex items-center gap-4 w-full">
                            <span className="text-sm font-medium text-white">{selectedIds.size} selected</span>
                            <Button
                                variant="secondary"
                                className="!py-2 !px-3 text-xs border-red-600/50 text-red-400 hover:bg-red-900/40"
                                onClick={() => setIsConfirmModalOpen(true)}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Selected
                            </Button>
                        </div>
                    ) : (
                        <>
                             <div className="relative w-full flex-grow">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by customer, PNR, ticket..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D10028]/80"
                                />
                            </div>
                            <div className="flex w-full sm:w-auto gap-4">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full sm:w-40 px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#D10028]/80"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="draft">Draft</option>
                                    <option value="submitted">Submitted</option>
                                    <option value="approved">Approved</option>
                                    <option value="posted">Posted</option>
                                </select>
                                <select
                                    value={serviceTypeFilter}
                                    onChange={(e) => setServiceTypeFilter(e.target.value)}
                                    className="w-full sm:w-40 px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#D10028]/80"
                                >
                                    <option value="all">All Services</option>
                                    <option value="flight">Flight</option>
                                    <option value="hotel">Hotel</option>
                                    <option value="visa">Visa</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </>
                    )}
                </div>

                <DsrTable 
                    dsrs={filteredDsrs} 
                    customers={customers} 
                    onViewDsr={handleViewDsr}
                    selectedIds={selectedIds}
                    onSelect={handleSelect}
                    onSelectAll={handleSelectAll}
                />
            </Card>

            <DsrFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSave={handleSaveDsr}
                customers={customers}
                suppliers={suppliers}
            />
            
            {selectedDsr && (
                <DsrDetailModal
                    dsr={selectedDsr}
                    customer={customers.find(c => c.id === selectedDsr.customerId)}
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    onSubmitForApproval={handleSubmitForApproval}
                    onApprove={handleApproveDsr}
                    onReject={handleStartReject}
                    onPost={handlePostDsr}
                />
            )}

            {selectedDsr && (
                <RejectReasonModal
                    isOpen={isRejectModalOpen}
                    onClose={() => setIsRejectModalOpen(false)}
                    onSubmit={handleConfirmReject}
                />
            )}
            
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleDeleteSelected}
                title="Confirm Deletion"
                message={`Are you sure you want to delete ${selectedIds.size} DSR(s)? This action cannot be undone.`}
                confirmText="Delete"
            />
        </div>
    );
};

export default DSRsPage;