
import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import type { SupplierBill, Supplier, DSR } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle } from 'lucide-react';

interface SupplierBillDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    bill: SupplierBill;
    supplier?: Supplier;
    dsr?: DSR;
    onUpdateStatus: (billId: string, status: SupplierBill['status']) => void;
}

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b border-slate-800">
        <span className="text-sm text-slate-400">{label}</span>
        <span className="text-sm font-semibold text-white text-right">{value}</span>
    </div>
);

const SupplierBillDetailModal: React.FC<SupplierBillDetailModalProps> = ({ isOpen, onClose, bill, supplier, dsr, onUpdateStatus }) => {
    const { user } = useAuth();
    const canPay = user && ['admin', 'manager', 'accountant'].includes(user.role);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Bill Details: ${bill.billNo}`}>
            <div className="space-y-4">
                <div className="bg-slate-800/50 p-4 rounded-lg">
                    <p className="text-lg font-bold text-white">{supplier?.name || 'Unknown Supplier'}</p>
                    <p className="text-sm text-slate-400 capitalize">{supplier?.type}</p>
                </div>
                
                <div className="space-y-2">
                    <DetailRow label="Bill Number" value={bill.billNo} />
                    <DetailRow label="Date" value={bill.date} />
                    <DetailRow label="Status" value={<span className="capitalize">{bill.status}</span>} />
                    <DetailRow label="Total Amount" value={`SAR ${bill.total.toFixed(2)}`} />
                </div>

                {dsr && (
                    <div className="pt-4 mt-4 border-t border-slate-700">
                        <h3 className="text-base font-bold text-white mb-2">Related DSR Details</h3>
                         <div className="space-y-2">
                            <DetailRow label="DSR ID" value={<span className="font-mono text-xs">{dsr.id}</span>} />
                            <DetailRow label="DSR PNR" value={dsr.pnr} />
                            <DetailRow label="DSR Route" value={dsr.route} />
                            <DetailRow label="DSR Net Fare" value={`SAR ${dsr.netFare.toFixed(2)}`} />
                        </div>
                    </div>
                )}


                <div className="flex justify-end gap-4 pt-6">
                    <Button type="button" variant="secondary" onClick={onClose}>Close</Button>
                    {canPay && bill.status === 'unpaid' && (
                        <Button
                            type="button"
                            onClick={() => onUpdateStatus(bill.id, 'paid')}
                            className="bg-green-700 hover:bg-green-600 focus:ring-green-500"
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark as Paid
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default SupplierBillDetailModal;
