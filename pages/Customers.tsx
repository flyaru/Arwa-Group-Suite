import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import CustomerTable from '../components/customer/CustomerTable';
import { useApp } from '../contexts/AppContext';
import { Plus, Search, Trash2 } from 'lucide-react';
import ExportButton from '../components/common/ExportButton';
import ConfirmationModal from '../components/common/ConfirmationModal';

const customerExportColumns = [
    { Header: 'ID', accessor: 'id' as const },
    { Header: 'Name', accessor: 'name' as const },
    { Header: 'Phone', accessor: 'phone' as const },
    { Header: 'Email', accessor: 'email' as const },
    { Header: 'Type', accessor: 'type' as const },
    { Header: 'Total Spend (SAR)', accessor: 'totalSpend' as const },
];

const CustomersPage: React.FC = () => {
    const { customers, bulkDeleteCustomers } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const filteredCustomers = useMemo(() => {
        return customers.filter(customer => {
            const lowerSearchTerm = searchTerm.toLowerCase();
            const matchesType = typeFilter === 'all' || customer.type === typeFilter;
            const matchesSearch = searchTerm === '' ||
                customer.name.toLowerCase().includes(lowerSearchTerm) ||
                customer.phone.toLowerCase().includes(lowerSearchTerm) ||
                customer.email.toLowerCase().includes(lowerSearchTerm);

            return matchesType && matchesSearch;
        });
    }, [customers, searchTerm, typeFilter]);
    
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
            setSelectedIds(new Set(filteredCustomers.map(c => c.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleDeleteSelected = () => {
        bulkDeleteCustomers(Array.from(selectedIds));
        setSelectedIds(new Set());
        setIsConfirmModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <Card>
                <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white">All Customers</h2>
                        <div className="flex items-center gap-4">
                             <ExportButton data={filteredCustomers} columns={customerExportColumns} filename="customers_list" />
                             <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                New Customer
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
                                className="!py-2 !px-3 text-xs border-red-600/50 text-red-400 hover:bg-red-900/40"
                                onClick={() => setIsConfirmModalOpen(true)}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Selected
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="relative w-full md:flex-grow">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name, phone, or email..."
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
                                <option value="individual">Individual</option>
                                <option value="corporate">Corporate</option>
                            </select>
                        </>
                    )}
                </div>
                
                <CustomerTable 
                    customers={filteredCustomers}
                    selectedIds={selectedIds}
                    onSelect={handleSelect}
                    onSelectAll={handleSelectAll}
                />
            </Card>
            
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleDeleteSelected}
                title="Confirm Deletion"
                message={`Are you sure you want to delete ${selectedIds.size} customer(s)? This will also remove associated travelers and might affect historical data. This action cannot be undone.`}
                confirmText="Delete"
            />
        </div>
    );
};

export default CustomersPage;
