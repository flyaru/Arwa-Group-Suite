
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import type { Supplier } from '../../types';

interface SupplierFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (supplier: Omit<Supplier, 'id'>) => void;
}

const SupplierFormModal: React.FC<SupplierFormModalProps> = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<Supplier['type']>('airline');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;
        onSave({ name, type });
        onClose();
        setName('');
        setType('airline');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Supplier">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Supplier Name" id="name" value={name} onChange={e => setName(e.target.value)} required />
                <Select label="Supplier Type" id="type" value={type} onChange={e => setType(e.target.value as Supplier['type'])}>
                    <option value="airline">Airline</option>
                    <option value="hotelier">Hotelier</option>
                    <option value="gds">GDS</option>
                    <option value="other">Other</option>
                </Select>
                <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Supplier</Button>
                </div>
            </form>
        </Modal>
    );
};

export default SupplierFormModal;