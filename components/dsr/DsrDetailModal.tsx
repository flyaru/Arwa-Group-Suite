
import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import type { DSR, Customer } from '../../types';
import { Check, X, Send, Lock, ArrowUpCircle, Edit } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface DsrDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    dsr: DSR;
    customer?: Customer;
    onSubmitForApproval: () => void;
    onApprove: () => void;
    onReject: () => void;
    onPost: () => void;
}

const DetailRow: React.FC<{ label: string; value: React.ReactNode; className?: string }> = ({ label, value, className = '' }) => (
    <div className={`flex justify-between py-2 border-b border-slate-800 ${className}`}>
        <span className="text-sm text-slate-400">{label}</span>
        <span className="text-sm font-semibold text-white text-right">{value}</span>
    </div>
);

const DsrDetailModal: React.FC<DsrDetailModalProps> = ({ isOpen, onClose, dsr, customer, onSubmitForApproval, onApprove, onReject, onPost }) => {
    const { user } = useAuth();

    const isOwner = user && user.username === dsr.agentUsername;
    const canManage = user && ['admin', 'manager', 'supervisor'].includes(user.role);
    const canPost = user && ['admin', 'manager', 'accountant'].includes(user.role);
    const isAdmin = user && user.role === 'admin';
    const isLockedForAgent = dsr.status !== 'draft' && user?.role === 'agent';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`DSR Details: ${dsr.id}`}>
            <div className="space-y-4">
                <div className="bg-slate-800/50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-lg font-bold text-white">{customer?.name || 'Unknown Customer'}</p>
                            <p className="text-sm text-slate-400">{customer?.phone}</p>
                        </div>
                        <Badge status={dsr.status} />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    <DetailRow label="Date" value={dsr.date} />
                    <DetailRow label="Agent" value={dsr.agentName || dsr.agentUsername} />
                    <DetailRow label="Service Type" value={<span className="capitalize">{dsr.serviceType}</span>} />
                    <DetailRow label="PNR / Ref" value={dsr.pnr} />
                    <DetailRow label="Ticket No" value={dsr.ticketNo || 'N/A'} />
                    <DetailRow label="Route / Description" value={dsr.route} />
                </div>
                
                <div className="pt-4 border-t border-slate-700">
                    <h3 className="font-bold text-white mb-2">Financials</h3>
                    <div className="space-y-1">
                        <DetailRow label="Base Fare" value={`SAR ${dsr.baseFare.toFixed(2)}`} />
                        <DetailRow label="Taxes" value={`SAR ${dsr.taxes.toFixed(2)}`} />
                        <DetailRow label="Discount" value={`SAR ${dsr.discount.toFixed(2)}`} />
                        <DetailRow label="Net Fare" value={`SAR ${dsr.netFare.toFixed(2)}`} />
                        <DetailRow label="Commission" value={`SAR ${dsr.commission.toFixed(2)}`} />
                        <DetailRow label="VAT on Commission" value={`SAR ${dsr.vatOnCommission.toFixed(2)}`} />
                        <DetailRow label="Selling Fare" value={`SAR ${dsr.sellingFare.toFixed(2)}`} className="!border-slate-600 bg-slate-800/30 px-2 rounded-md" />
                    </div>
                </div>
                
                {dsr.remarks && (
                     <div className="pt-4 border-t border-slate-700">
                        <h3 className="font-bold text-white mb-2">Remarks</h3>
                        <p className="text-sm text-slate-300 bg-slate-800/50 p-3 rounded-md">{dsr.remarks}</p>
                    </div>
                )}

                {(dsr.status === 'posted' || isLockedForAgent) && (
                    <div className="pt-4 border-t border-slate-700">
                        <div className={`flex items-center gap-3 bg-slate-800/50 p-3 rounded-md ${dsr.status === 'posted' ? 'text-amber-400' : 'text-sky-400'}`}>
                            <Lock className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm font-semibold">
                                {dsr.status === 'posted' 
                                    ? "This DSR is posted and permanently locked." 
                                    : "This DSR has been submitted and is locked. Please contact an admin for any amendments."}
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-4 pt-6">
                    <Button type="button" variant="secondary" onClick={onClose}>Close</Button>
                    
                    {isOwner && dsr.status === 'draft' && (
                        <Button type="button" onClick={onSubmitForApproval} className="bg-sky-600 hover:bg-sky-500 focus:ring-sky-500">
                            <ArrowUpCircle className="w-4 h-4 mr-2" />
                            Submit for Approval
                        </Button>
                    )}
                    
                    {isAdmin && dsr.status !== 'draft' && dsr.status !== 'posted' && (
                         <Button type="button" variant="secondary" onClick={() => alert('Admin amendment UI not implemented.')}>
                            <Edit className="w-4 h-4 mr-2" />
                            Amend (Admin)
                        </Button>
                    )}

                    {canManage && dsr.status === 'submitted' && (
                        <>
                            <Button type="button" className="bg-red-800 hover:bg-red-700 focus:ring-red-600" onClick={onReject}>
                                <X className="w-4 h-4 mr-2" />
                                Reject
                            </Button>
                             <Button type="button" className="bg-green-700 hover:bg-green-600 focus:ring-green-500" onClick={onApprove}>
                                <Check className="w-4 h-4 mr-2" />
                                Approve
                            </Button>
                        </>
                    )}
                     {canPost && dsr.status === 'approved' && (
                        <Button type="button" className="bg-sky-600 hover:bg-sky-500 focus:ring-sky-500" onClick={onPost}>
                            <Send className="w-4 h-4 mr-2" />
                            Post to Ledger
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default DsrDetailModal;
