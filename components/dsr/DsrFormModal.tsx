
import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import type { Customer, DSR, Supplier } from '../../types';
import { Loader2 } from 'lucide-react';

interface DsrFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (
        dsrData: Omit<DSR, 'id' | 'status' | 'date' | 'agentUsername' | 'agentName' | 'customerId'>,
        customerData: { name: string; phone: string; email: string; type: Customer['type'] }
    ) => Promise<void>;
    customers: Customer[];
    suppliers: Supplier[];
}

const DsrFormModal: React.FC<DsrFormModalProps> = ({ isOpen, onClose, onSave, customers, suppliers }) => {
    // Customer state
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerType, setCustomerType] = useState<Customer['type']>('individual');
    
    // DSR state
    const [supplierId, setSupplierId] = useState('');
    const [serviceType, setServiceType] = useState<DSR['serviceType']>('flight');
    const [paymentMethod, setPaymentMethod] = useState<DSR['paymentMethod']>('cash');
    const [pnr, setPnr] = useState('');
    const [ticketNo, setTicketNo] = useState('');
    const [route, setRoute] = useState('');
    const [baseFare, setBaseFare] = useState(0);
    const [taxes, setTaxes] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [netFare, setNetFare] = useState(0);
    const [isSaving, setIsSaving] = useState(false);


    const { sellingFare, commission, vatOnCommission } = useMemo(() => {
        const calculatedSellingFare = (baseFare || 0) + (taxes || 0) - (discount || 0);
        const calculatedCommission = calculatedSellingFare - (netFare || 0);
        const calculatedVatOnCommission = calculatedCommission * 0.15;
        return {
            sellingFare: calculatedSellingFare,
            commission: calculatedCommission,
            vatOnCommission: calculatedVatOnCommission,
        };
    }, [baseFare, taxes, discount, netFare]);

    const resetForm = () => {
        setCustomerName('');
        setCustomerPhone('');
        setCustomerEmail('');
        setCustomerType('individual');
        setSupplierId('');
        setServiceType('flight');
        setPaymentMethod('cash');
        setPnr('');
        setTicketNo('');
        setRoute('');
        setBaseFare(0);
        setTaxes(0);
        setDiscount(0);
        setNetFare(0);
        setIsSaving(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customerName || !customerPhone || !pnr || !route) {
            alert('Please fill all required fields');
            return;
        }
        
        setIsSaving(true);
        try {
            await onSave(
                {
                    supplierId: supplierId || undefined,
                    serviceType,
                    pnr,
                    ticketNo,
                    route,
                    paymentMethod,
                    baseFare,
                    taxes,
                    discount,
                    netFare,
                    sellingFare,
                    commission,
                    vatOnCommission,
                },
                {
                    name: customerName,
                    phone: customerPhone,
                    email: customerEmail,
                    type: customerType,
                }
            );
            onClose();
            resetForm();
        } catch (error) {
            console.error("Failed to save DSR:", error);
            alert("Failed to save DSR. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New DSR">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700">
                    <h3 className="text-base font-semibold text-white mb-3">Customer Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Customer Name" id="customerName" value={customerName} onChange={e => setCustomerName(e.target.value)} required />
                        <Input label="Customer Phone" id="customerPhone" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} required placeholder="+966..." />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <Input label="Customer Email (Optional)" id="customerEmail" type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} />
                        <Select label="Customer Type" id="customerType" value={customerType} onChange={e => setCustomerType(e.target.value as Customer['type'])}>
                            <option value="individual">Individual</option>
                            <option value="corporate">Corporate</option>
                        </Select>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-700 mt-4">
                     <h3 className="text-base font-semibold text-white mb-3">Service Details</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Select label="Service Type" id="serviceType" value={serviceType} onChange={e => setServiceType(e.target.value as DSR['serviceType'])}>
                            <option value="flight">Flight</option>
                            <option value="hotel">Hotel</option>
                            <option value="visa">Visa</option>
                            <option value="other">Other</option>
                        </Select>
                        <Input label="PNR / Booking Ref" id="pnr" value={pnr} onChange={e => setPnr(e.target.value)} required />
                        <Select label="Payment Method" id="paymentMethod" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as DSR['paymentMethod'])} required>
                            <option value="cash">Cash</option>
                            <option value="card">Card</option>
                            <option value="credit">Credit</option>
                        </Select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <Select label="Supplier (Optional)" id="supplier" value={supplierId} onChange={e => setSupplierId(e.target.value)}>
                            <option value="">Select a supplier</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </Select>
                        <Input label="Ticket Number" id="ticketNo" value={ticketNo} onChange={e => setTicketNo(e.target.value)} />
                    </div>
                    <Input label="Route / Description" id="route" value={route} onChange={e => setRoute(e.target.value)} required className="mt-4" />
                </div>
                

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-700">
                    <Input label="Base Fare" id="baseFare" type="number" step="0.01" value={baseFare} onChange={e => setBaseFare(parseFloat(e.target.value) || 0)} />
                    <Input label="Taxes" id="taxes" type="number" step="0.01" value={taxes} onChange={e => setTaxes(parseFloat(e.target.value) || 0)} />
                    <Input label="Discount" id="discount" type="number" step="0.01" value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} />
                    <Input label="Net Fare" id="netFare" type="number" step="0.01" value={netFare} onChange={e => setNetFare(parseFloat(e.target.value) || 0)} />
                </div>
                
                <div className="bg-slate-800/50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">Commission:</span>
                        <span className="font-semibold text-white">SAR {commission.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">VAT on Commission (15%):</span>
                        <span className="font-semibold text-white">SAR {vatOnCommission.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between items-center border-t border-slate-700 pt-2 mt-2">
                        <span className="text-slate-300 font-bold">Selling Fare:</span>
                        <span className="font-bold text-xl text-white">SAR {sellingFare.toFixed(2)}</span>
                    </div>
                </div>


                <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>Cancel</Button>
                    <Button type="submit" disabled={isSaving}>
                        {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {isSaving ? 'Saving...' : 'Save DSR'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default DsrFormModal;
