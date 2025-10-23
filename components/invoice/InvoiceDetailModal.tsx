
import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import ArwaLogoFull from '../common/ArwaLogoFull';
import ZatcaQRCode from './ZatcaQRCode';
import type { Invoice, Customer, DSR } from '../../types';
import { CheckCircle } from 'lucide-react';

interface InvoiceDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: Invoice;
    customer: Customer;
    dsr: DSR;
    onMarkAsPaid: (invoiceId: string) => void;
}

const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({ isOpen, onClose, invoice, customer, dsr, onMarkAsPaid }) => {
    
    const handlePrint = () => {
        const printContent = document.getElementById('invoice-print-area');
        if (printContent) {
            const printWindow = window.open('', '', 'height=800,width=800');
            printWindow?.document.write('<html><head><title>Print Invoice</title>');
            printWindow?.document.write('<script src="https://cdn.tailwindcss.com"></script>');
            printWindow?.document.write(`<style>
                body { font-family: 'Inter', sans-serif; -webkit-print-color-adjust: exact; } 
                .font-tajawal { font-family: 'Tajawal', sans-serif; }
            </style>`);
            printWindow?.document.write('</head><body class="bg-white text-black">');
            printWindow?.document.write(printContent.innerHTML);
            printWindow?.document.write('</body></html>');
            printWindow?.document.close();
            setTimeout(() => {
                printWindow?.print();
            }, 500);
        }
    };

    const handleMarkAsPaid = () => {
        onMarkAsPaid(invoice.id);
        onClose();
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Invoice: ${invoice.invoiceNo}`}>
            <div className="bg-white text-black p-6 rounded-md font-sans" id="invoice-print-area">
                <ArwaLogoFull />

                <div className="text-center my-4 py-1 border-y-2 border-black">
                    <h1 className="font-bold text-lg">TAX INVOICE / <span className="font-['Tajawal']">فاتورة ضريبية</span></h1>
                </div>

                <div className="flex justify-between text-xs mb-4">
                    <div className="flex-1 space-y-1">
                        <p><span className="font-bold">Invoice To:</span> {customer.name}</p>
                        <p><span className="font-bold">Date:</span> {new Date(invoice.date).toLocaleDateString('en-GB')}</p>
                        <p><span className="font-bold">Invoice No:</span> {invoice.invoiceNo}</p>
                        <p><span className="font-bold">Agent:</span> {dsr.agentName || 'N/A'}</p>
                    </div>
                    <div className="flex-1 space-y-1 text-right" dir="rtl">
                        <p><span className="font-bold font-['Tajawal']">فاتورة إلى:</span> {customer.name}</p>
                        <p><span className="font-bold font-['Tajawal']">التاريخ:</span> {new Date(invoice.date).toLocaleDateString('ar-SA-u-nu-arab')}</p>
                        <p><span className="font-bold font-['Tajawal']">رقم الفاتورة:</span> {invoice.invoiceNo}</p>
                        <p><span className="font-bold font-['Tajawal']">الموظف:</span> {dsr.agentName || 'غير متاح'}</p>
                    </div>
                </div>

                <table className="w-full border-collapse border-2 border-black text-xs">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border-2 border-black p-2 text-left font-bold">Description / <span className="font-['Tajawal']">الوصف</span></th>
                            <th className="border-2 border-black p-2 font-bold">Qty / <span className="font-['Tajawal']">الكمية</span></th>
                            <th className="border-2 border-black p-2 font-bold">Unit Price / <span className="font-['Tajawal']">سعر الوحدة</span></th>
                            <th className="border-2 border-black p-2 font-bold">Total / <span className="font-['Tajawal']">المجموع</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items.map(item => (
                            <tr key={item.id}>
                                <td className="border-2 border-black p-2">{item.description}</td>
                                <td className="border-2 border-black p-2 text-center">{item.qty}</td>
                                <td className="border-2 border-black p-2 text-right">{item.unitPrice.toFixed(2)}</td>
                                <td className="border-2 border-black p-2 text-right">{item.lineTotal.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-between mt-4 text-xs">
                    <div>
                        {invoice.qrCodeTlv && <ZatcaQRCode tlv={invoice.qrCodeTlv} />}
                    </div>
                    <div className="w-1/2 space-y-1">
                        <div className="flex justify-between">
                            <span>Subtotal (Excl. VAT)</span>
                            <span dir="rtl" className="font-['Tajawal']">المجموع الفرعي (غير شامل ضريبة القيمة المضافة)</span>
                            <span>SAR {invoice.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>VAT (15%)</span>
                            <span dir="rtl" className="font-['Tajawal']">ضريبة القيمة المضافة (١٥٪)</span>
                            <span>SAR {invoice.vat.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-sm border-t-2 border-black pt-1">
                            <span>Total Amount</span>
                            <span dir="rtl" className="font-['Tajawal']">المبلغ الإجمالي</span>
                            <span>SAR {invoice.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="text-center text-xs mt-4 pt-2 border-t-2 border-black" dir="rtl">
                    <p className="font-['Tajawal']">
                        ترخيص سياحة: 73103024 • إياتا: 71240282
                    </p>
                    <p className="font-sans">
                        اتصل بنا: 00966532004264 • https://flyaru.com • contactus@arwatravelksa.com
                    </p>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-6">
                <Button type="button" variant="secondary" onClick={onClose}>Close</Button>
                {invoice.status !== 'paid' && (
                     <Button 
                        type="button" 
                        onClick={handleMarkAsPaid} 
                        className="bg-green-700 hover:bg-green-600 focus:ring-green-500"
                    >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark as Paid
                    </Button>
                )}
                <Button type="button" onClick={handlePrint}>Print</Button>
            </div>
        </Modal>
    );
};

export default InvoiceDetailModal;
