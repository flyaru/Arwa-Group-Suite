
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import type { Supplier, SupplierBill } from '../../types';

interface SupplierBillFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (bill: Omit<SupplierBill, 'id' | 'status'>) => void;
    suppliers: Supplier[];
}

const SupplierBillFormModal: React.FC<SupplierBillFormModalProps> = ({ isOpen, onClose, onSave, suppliers }) => {
    const [supplierId, setSupplierId] = useState('');
    const [billNo, setBillNo] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [total, setTotal] = useState('');
    const [remarks, setRemarks] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!supplierId || !billNo || !date || !total) return;
        onSave({ 
            supplierId, 
            billNo, 
            date, 
            total: parseFloat(total),
            dsrId: `MANUAL-${Date.now()}` // Use a unique identifier for manual bills
        });
        onClose();
        // Reset form
        setSupplierId('');
        setBillNo('');
        setDate(new Date().toISOString().split('T')[0]);
        setTotal('');
        setRemarks('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Supplier Bill">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Select label="Supplier" id="supplier" value={supplierId} onChange={e => setSupplierId(e.target.value)} required>
                    <option value="">Select a supplier</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Select>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Bill / Invoice #" id="billNo" value={billNo} onChange={e => setBillNo(e.target.value)} required />
                    <Input label="Bill Date" id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                </div>
                 <Input label="Total Amount (SAR)" id="total" type="number" step="0.01" value={total} onChange={e => setTotal(e.target.value)} required />
                <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Bill</Button>
                </div>
            </form>
        </Modal>
    );
};

export default SupplierBillFormModal;
