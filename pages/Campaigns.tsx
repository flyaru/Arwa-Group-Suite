
import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Plus } from 'lucide-react';
import type { Campaign } from '../types';
import CampaignFormModal from '../components/campaign/CampaignFormModal';
import { useApp } from '../contexts/AppContext';

const mockCampaigns: Campaign[] = [
    { id: '1', name: 'Eid Holiday Offers', subject: 'Special Discounts for Eid!', body: 'Dear Customer...', recipientSegment: 'all', status: 'sent', sentDate: '2024-07-15', recipients: 89 },
    { id: '2', name: 'Summer Vacation Packages', subject: 'Your dream summer getaway awaits', body: 'Dear Customer...', recipientSegment: 'individual', status: 'sent', sentDate: '2024-06-20', recipients: 75 },
    { id: '3', name: 'New Corporate Rates', subject: 'Exclusive new rates for our business partners', body: 'Dear Valued Partner...', recipientSegment: 'corporate', status: 'draft', sentDate: '', recipients: 0 },
];

const CampaignsPage: React.FC = () => {
    const { customers } = useApp();
    const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSaveCampaign = (campaignData: Omit<Campaign, 'id' | 'status' | 'sentDate' | 'recipients'>) => {
        // 1. Filter customers based on the selected segment
        const targetedCustomers = customers.filter(c => {
            if (campaignData.recipientSegment === 'all') return true;
            return c.type === campaignData.recipientSegment;
        });

        // 2. Mock sending email by logging to the console
        console.group(`🚀 Sending Campaign: "${campaignData.name}"`);
        console.log(`Subject: ${campaignData.subject}`);
        console.log(`Body: ${campaignData.body}`);
        console.log(`Segment: ${campaignData.recipientSegment}`);
        console.log(`Sent to ${targetedCustomers.length} recipients:`);
        targetedCustomers.forEach(c => console.log(` - ${c.name} <${c.email}>`));
        console.groupEnd();

        // 3. Create and save the new campaign object
        const newCampaign: Campaign = {
            ...campaignData,
            id: `CAMP-${Date.now()}`,
            status: 'sent',
            sentDate: new Date().toISOString().split('T')[0],
            recipients: targetedCustomers.length
        };
        setCampaigns(prev => [newCampaign, ...prev]);
        alert(`Campaign "${newCampaign.name}" has been sent! Check the browser console for details.`);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Email Campaigns</h1>
                    <p className="text-sm text-slate-400">Engage with your customers through targeted email campaigns.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Campaign
                </Button>
            </div>
            
            <Card>
                <div className="p-4 sm:p-6">
                    <h2 className="text-lg font-bold text-white">Campaign History</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Campaign Name</th>
                                <th scope="col" className="px-6 py-3">Subject</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Sent Date</th>
                                <th scope="col" className="px-6 py-3">Recipients</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.map((campaign) => (
                                <tr key={campaign.id} className="border-b border-slate-800 hover:bg-slate-800/40">
                                    <td className="px-6 py-4 font-medium text-white">{campaign.name}</td>
                                    <td className="px-6 py-4">{campaign.subject}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 text-xs font-semibold capitalize rounded-full ${campaign.status === 'sent' ? 'bg-green-600/50 text-green-300' : 'bg-slate-600/50 text-slate-300'}`}>
                                            {campaign.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{campaign.sentDate || 'N/A'}</td>
                                    <td className="px-6 py-4">{campaign.recipients}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <CampaignFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveCampaign}
            />
        </div>
    );
};

export default CampaignsPage;