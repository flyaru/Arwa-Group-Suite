
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import type { Traveler, Customer } from '../../types';

interface TravelerFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (traveler: Omit<Traveler, 'id'>) => void;
    customers: Customer[];
}

const TravelerFormModal: React.FC<TravelerFormModalProps> = ({ isOpen, onClose, onSave, customers }) => {
    const [name, setName] = useState('');
    const [passportNo, setPassportNo] = useState('');
    const [nationality, setNationality] = useState('');
    const [customerId, setCustomerId] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !passportNo || !customerId) return;
        onSave({ name, passportNo, nationality, customerId });
        onClose();
        // Reset form
        setName('');
        setPassportNo('');
        setNationality('');
        setCustomerId('');
    };
    
    const corporateCustomers = customers.filter(c => c.type === 'corporate');

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Traveler">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Full Name" id="name" value={name} onChange={e => setName(e.target.value)} required />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Passport Number" id="passportNo" value={passportNo} onChange={e => setPassportNo(e.target.value)} required />
                    <Input label="Nationality" id="nationality" value={nationality} onChange={e => setNationality(e.target.value)} />
                </div>
                <Select label="Associate with Customer" id="customer" value={customerId} onChange={e => setCustomerId(e.target.value)} required>
                    <option value="">Select a corporate customer</option>
                    {corporateCustomers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
                <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Traveler</Button>
                </div>
            </form>
        </Modal>
    );
};

export default TravelerFormModal;