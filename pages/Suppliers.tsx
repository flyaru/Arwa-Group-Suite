
import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import SupplierTable from '../components/supplier/SupplierTable';
import SupplierFormModal from '../components/supplier/SupplierFormModal';
import SupplierDetailModal from '../components/supplier/SupplierDetailModal';
import { useApp } from '../contexts/AppContext';
import { Plus, Search } from 'lucide-react';
import type { Supplier } from '../types';
import ExportButton from '../components/common/ExportButton';

const supplierExportColumns = [
    { Header: 'ID', accessor: 'id' as const },
    { Header: 'Name', accessor: 'name' as const },
    { Header: 'Type', accessor: 'type' as const },
    { Header: 'Total Billed (SAR)', accessor: 'totalBilled' as const },
];

const SuppliersPage: React.FC = () => {
    const { suppliers, supplierBills, addSupplier } = useApp();
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    const filteredSuppliers = useMemo(() => {
        return suppliers.filter(supplier => {
            const lowerSearchTerm = searchTerm.toLowerCase();
            const matchesType = typeFilter === 'all' || supplier.type === typeFilter;
            const matchesSearch = searchTerm === '' ||
                supplier.name.toLowerCase().includes(lowerSearchTerm);

            return matchesType && matchesSearch;
        });
    }, [suppliers, searchTerm, typeFilter]);

    const supplierExportData = useMemo(() => {
        return filteredSuppliers.map(supplier => {
            const totalBilled = supplierBills
                .filter(b => b.supplierId === supplier.id && b.status !== 'void')
                .reduce((sum, b) => sum + b.total, 0);
            return {
                ...supplier,
                totalBilled: totalBilled.toFixed(2),
            };
        });
    }, [filteredSuppliers, supplierBills]);

    const handleSaveSupplier = (newSupplierData: Omit<Supplier, 'id'>) => {
        // FIX: Corrected an issue where `addSupplier` was called with an incomplete `Supplier` object by adding the mandatory `id` property before saving.
        addSupplier({ ...newSupplierData, id: `SUP-${Date.now()}` });
        setIsFormModalOpen(false);
    };

    const handleViewSupplier = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setIsDetailModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <Card>
                <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white">All Suppliers</h2>
                         <div className="flex items-center gap-4">
                            <ExportButton data={supplierExportData} columns={supplierExportColumns} filename="suppliers_list" />
                            <Button onClick={() => setIsFormModalOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                New Supplier
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="p-4 sm:px-6 border-t border-slate-800 flex flex-col md:flex-row items-center gap-4">
                    <div className="relative w-full md:flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by supplier name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D10028]/80"
                        />
                    </div>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="w-full md:w-48 px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#D10028]/80"
                    >
                        <option value="all">All Types</option>
                        <option value="airline">Airline</option>
                        <option value="hotelier">Hotelier</option>
                        <option value="gds">GDS</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <SupplierTable suppliers={filteredSuppliers} bills={supplierBills} onView={handleViewSupplier} />
            </Card>
            
            <SupplierFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSave={handleSaveSupplier}
            />
            {selectedSupplier && (
                 <SupplierDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    supplier={selectedSupplier}
                    bills={supplierBills.filter(b => b.supplierId === selectedSupplier.id)}
                />
            )}
        </div>
    );
};

export default SuppliersPage;