
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface RejectReasonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reason: string) => void;
}

const RejectReasonModal: React.FC<RejectReasonModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [reason, setReason] = useState('');

    const handleSubmit = () => {
        if (reason.trim()) {
            onSubmit(reason);
        } else {
            alert('Please provide a reason for rejection.');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Reason for Rejection">
            <div className="space-y-4">
                <p className="text-slate-300">Please provide a clear reason for rejecting this DSR. The agent will see this remark.</p>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2.5 bg-slate-800/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 border-slate-600 focus:ring-[#D10028]/80 resize-none"
                    placeholder="e.g., Missing required attachments, incorrect fare calculation..."
                />
                <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="button" onClick={handleSubmit} className="bg-red-800 hover:bg-red-700 focus:ring-red-600">
                        Confirm Rejection
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default RejectReasonModal;
