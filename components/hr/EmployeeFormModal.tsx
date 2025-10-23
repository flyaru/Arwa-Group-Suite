
import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import type { User } from '../../types';
import { ALL_ROLES } from '../../constants';

interface EmployeeFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (employeeData: Omit<User, 'id'>, id?: string) => void;
    employee: User | null;
}

const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({ isOpen, onClose, onSave, employee }) => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<User['role']>('agent');
    const [branch, setBranch] = useState('Riyadh');

    useEffect(() => {
        if (employee) {
            setName(employee.name);
            setUsername(employee.username);
            setEmail(employee.email);
            setRole(employee.role);
            setBranch(employee.branch);
        } else {
            // Reset form for new employee
            setName('');
            setUsername('');
            setEmail('');
            setRole('agent');
            setBranch('Riyadh');
        }
    }, [employee, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !username || !email) {
            alert('Please fill all required fields');
            return;
        }
        
        onSave({ name, username, email, role, branch }, employee?.id);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={employee ? 'Edit Employee' : 'Add New Employee'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Full Name" id="employeeName" value={name} onChange={e => setName(e.target.value)} required />
                    <Input label="Username" id="username" value={username} onChange={e => setUsername(e.target.value)} required />
                </div>
                <Input label="Email Address" id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select label="Role" id="role" value={role} onChange={e => setRole(e.target.value as User['role'])} required>
                        {ALL_ROLES.map(r => (
                            <option key={r} value={r} className="capitalize">{r}</option>
                        ))}
                    </Select>
                     <Select label="Branch" id="branch" value={branch} onChange={e => setBranch(e.target.value)} required>
                        <option value="Riyadh">Riyadh</option>
                        <option value="Jeddah">Jeddah</option>
                        <option value="Dammam">Dammam</option>
                    </Select>
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Changes</Button>
                </div>
            </form>
        </Modal>
    );
};

export default EmployeeFormModal;
