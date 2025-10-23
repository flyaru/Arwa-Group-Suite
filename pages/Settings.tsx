
import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/ui/Card';
import { generateZatcaTlvBase64 } from '../lib/zatca';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import { CheckCircle, Link, Loader2, AlertTriangle } from 'lucide-react';

const BackendConfig: React.FC = () => {
    const { appsScriptUrl, setAppsScriptUrl, testBackendConnection } = useApp();
    const [url, setUrl] = useState(appsScriptUrl || '');
    const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [testMessage, setTestMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleTest = async () => {
        setTestStatus('testing');
        try {
            const response = await testBackendConnection(url);
            if (response.status === 'success') {
                setTestStatus('success');
                setTestMessage('Success! Connection is working.');
            } else {
                throw new Error(response.message || 'Unknown error');
            }
        } catch (error: any) {
            setTestStatus('error');
            setTestMessage(`Failed: ${error.message}`);
        }
    };
    
    const handleSave = async () => {
        setIsSaving(true);
        const success = await setAppsScriptUrl(url);
        if (!success) {
            setTestStatus('error');
            setTestMessage('Failed to save. The connection test may have failed.');
        }
        // On success, the app will reload automatically
        setIsSaving(false);
    };

    return (
        <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
                <Link className="w-6 h-6 text-sky-400" />
                <h2 className="text-xl font-bold text-white">Backend Configuration</h2>
            </div>
            <p className="text-slate-400 mb-4">
                Enter the deployed Google Apps Script Web App URL to connect the application to your Google Sheets backend.
            </p>
            <div className="space-y-4">
                <div>
                    <label htmlFor="appsScriptUrl" className="block text-sm font-medium text-slate-300 mb-1">Web App URL</label>
                    <input
                        id="appsScriptUrl"
                        type="url"
                        value={url}
                        onChange={(e) => { setUrl(e.target.value); setTestStatus('idle'); }}
                        placeholder="https://script.google.com/macros/s/..."
                        className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D10028]/80"
                    />
                </div>
                 {testStatus !== 'idle' && (
                    <div className={`flex items-center gap-2 text-sm p-2 rounded-md ${
                        testStatus === 'success' ? 'bg-green-900/50 text-green-300' 
                        : testStatus === 'error' ? 'bg-red-900/50 text-red-300' 
                        : 'bg-sky-900/50 text-sky-300'
                    }`}>
                        {testStatus === 'success' && <CheckCircle className="w-4 h-4" />}
                        {testStatus === 'error' && <AlertTriangle className="w-4 h-4" />}
                        {testStatus === 'testing' && <Loader2 className="w-4 h-4 animate-spin" />}
                        <span>{testMessage}</span>
                    </div>
                )}
                <div className="flex items-center gap-4">
                    <Button variant="secondary" onClick={handleTest} disabled={!url || testStatus === 'testing'}>
                        {testStatus === 'testing' ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Testing...</> : 'Test Connection'}
                    </Button>
                    <Button onClick={handleSave} disabled={!url || isSaving || testStatus !== 'success'}>
                         {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Save Connection'}
                    </Button>
                </div>
            </div>
        </Card>
    );
};


const SettingsPage: React.FC = () => {
    const { user } = useAuth();
    const [seller, setSeller] = useState(() => localStorage.getItem('zatca_seller') || 'Arwa Tech');
    const [vatNumber, setVatNumber] = useState(() => localStorage.getItem('zatca_vatNumber') || '310123456789013');
    const [invoiceTotal, setInvoiceTotal] = useState(() => localStorage.getItem('zatca_invoiceTotal') || '1150.00');
    const [vatTotal, setVatTotal] = useState(() => localStorage.getItem('zatca_vatTotal') || '150.00');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        localStorage.setItem('zatca_seller', seller);
        localStorage.setItem('zatca_vatNumber', vatNumber);
        localStorage.setItem('zatca_invoiceTotal', invoiceTotal);
        localStorage.setItem('zatca_vatTotal', vatTotal);
    }, [seller, vatNumber, invoiceTotal, vatTotal]);

    const validateFields = () => {
        const newErrors: { [key: string]: string } = {};
        if (!seller) newErrors.seller = "Seller name is required.";
        if (!vatNumber.match(/^\d{15}$/)) newErrors.vatNumber = "VAT number must be 15 digits.";
        if (isNaN(parseFloat(invoiceTotal))) newErrors.invoiceTotal = "Must be a valid number.";
        if (isNaN(parseFloat(vatTotal))) newErrors.vatTotal = "Must be a valid number.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const tlvBase64 = useMemo(() => {
        if (!validateFields()) return '';
        const timestamp = new Date().toISOString();
        try {
            return generateZatcaTlvBase64(seller, vatNumber, timestamp, invoiceTotal, vatTotal);
        } catch (e) {
            console.error("Error generating TLV:", e);
            return '';
        }
    }, [seller, vatNumber, invoiceTotal, vatTotal]);

    const qrCodeUrl = tlvBase64
        ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(tlvBase64)}`
        : '';
        
    const FormInput = ({ label, id, value, onChange, error, ...props }: any) => (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
            <input
                id={id}
                value={value}
                onChange={onChange}
                className={`w-full px-4 py-2.5 bg-slate-800/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500/80' : 'border-slate-600 focus:ring-[#D10028]/80'}`}
                {...props}
            />
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>
    );

    return (
        <div className="space-y-6">
            {user?.role === 'admin' && <BackendConfig />}

            <Card className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">Quick ZATCA Preview</h2>
                <p className="text-slate-400 mb-6">Enter sample data to generate a ZATCA-compliant QR code. Data is saved in your browser's local storage.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <FormInput label="Seller Name" id="seller" value={seller} onChange={(e: any) => setSeller(e.target.value)} error={errors.seller} />
                        <FormInput label="VAT Registration Number" id="vatNumber" value={vatNumber} onChange={(e: any) => setVatNumber(e.target.value)} error={errors.vatNumber} />
                        <FormInput label="Invoice Total (incl. VAT)" id="invoiceTotal" value={invoiceTotal} onChange={(e: any) => setInvoiceTotal(e.target.value)} error={errors.invoiceTotal} />
                        <FormInput label="VAT Total" id="vatTotal" value={vatTotal} onChange={(e: any) => setVatTotal(e.target.value)} error={errors.vatTotal} />
                    </div>
                    <div className="flex flex-col items-center justify-center bg-slate-900/50 rounded-lg p-4">
                        {qrCodeUrl ? (
                            <>
                                <img src={qrCodeUrl} alt="ZATCA QR Code" className="w-48 h-48 rounded-md bg-white p-2" />
                                <div className="mt-4 text-center w-full">
                                    <p className="text-sm font-medium text-slate-300">TLV Base64 String</p>
                                    <textarea
                                        readOnly
                                        value={tlvBase64}
                                        className="w-full h-24 mt-1 bg-slate-800 text-xs text-slate-400 rounded-md p-2 border border-slate-700 resize-none"
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="text-center text-slate-400">
                                <p>QR Code will appear here once all fields are valid.</p>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default SettingsPage;
