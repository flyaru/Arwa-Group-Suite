
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface LeaveRequestFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { startDate: string, endDate: string, reason: string }) => void;
}

const LeaveRequestFormModal: React.FC<LeaveRequestFormModalProps> = ({ isOpen, onClose, onSave }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!startDate || !endDate || !reason) {
            alert('Please fill all fields');
            return;
        }
        onSave({ startDate, endDate, reason });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Request Leave">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Start Date" id="startDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                    <Input label="End Date" id="endDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
                </div>
                <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-slate-300 mb-1">Reason for Leave</label>
                    <textarea
                        id="reason"
                        rows={4}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-800/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 border-slate-600 focus:ring-[#D10028]/80 resize-vertical"
                        placeholder="Please provide a brief reason..."
                        required
                    />
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Submit Request</Button>
                </div>
            </form>
        </Modal>
    );
};

export default LeaveRequestFormModal;
