
import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface CashHandoverFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (amount: number) => void;
    maxAmount: number;
}

const CashHandoverFormModal: React.FC<CashHandoverFormModalProps> = ({ isOpen, onClose, onSubmit, maxAmount }) => {
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setAmount(String(maxAmount > 0 ? maxAmount : ''));
            setError('');
        }
    }, [isOpen, maxAmount]);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const numValue = parseFloat(value);
        setAmount(value);

        if (numValue > maxAmount) {
            setError(`Amount cannot exceed your cash-in-hand of ${maxAmount.toFixed(2)}`);
        } else if (numValue <= 0) {
            setError('Amount must be positive.');
        } else {
            setError('');
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numValue = parseFloat(amount);
        if (!error && numValue > 0) {
            onSubmit(numValue);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Initiate Cash Handover">
            <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-slate-300">
                    You are about to declare a cash handover. Enter the amount you are handing over to your manager or the accounting department.
                </p>
                <Input 
                    label="Amount to Handover (SAR)"
                    id="amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={handleAmountChange}
                    error={error}
                    required
                    max={maxAmount}
                />
                 <div className="text-sm text-slate-400 bg-slate-800/50 p-3 rounded-lg">
                    Your current cash-in-hand is <span className="font-bold text-white">SAR {maxAmount.toFixed(2)}</span>.
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={!!error || !amount}>Submit Handover</Button>
                </div>
            </form>
        </Modal>
    );
};

export default CashHandoverFormModal;
