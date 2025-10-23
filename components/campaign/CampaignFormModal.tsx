
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import type { Campaign } from '../../types';
import { Send } from 'lucide-react';

interface CampaignFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (campaignData: Omit<Campaign, 'id' | 'status' | 'sentDate' | 'recipients'>) => void;
}

const CampaignFormModal: React.FC<CampaignFormModalProps> = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [subject, setSubject] = useState('');
    const [recipientSegment, setRecipientSegment] = useState<'all' | 'corporate' | 'individual'>('all');
    const [body, setBody] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, subject, body, recipientSegment });
        onClose();
        // Reset form
        setName('');
        setSubject('');
        setRecipientSegment('all');
        setBody('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Email Campaign">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Campaign Name" id="campaignName" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g., Summer Sale 2024" />
                <Input label="Email Subject" id="subject" value={subject} onChange={e => setSubject(e.target.value)} required placeholder="Your next adventure starts here!" />
                <Select label="Recipient List" id="recipients" value={recipientSegment} onChange={e => setRecipientSegment(e.target.value as any)}>
                    <option value="all">All Customers</option>
                    <option value="corporate">Corporate Customers Only</option>
                    <option value="individual">Individual Customers Only</option>
                </Select>
                <div>
                    <label htmlFor="body" className="block text-sm font-medium text-slate-300 mb-1">Email Body</label>
                    <textarea
                        id="body"
                        rows={8}
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-800/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 border-slate-600 focus:ring-[#D10028]/80 resize-vertical"
                        placeholder="Dear Customer, ..."
                        required
                    />
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">
                        <Send className="w-4 h-4 mr-2" />
                        Send Campaign
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default CampaignFormModal;