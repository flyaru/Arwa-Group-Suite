
import React, { useState } from 'react';
import type { Supplier } from '../../types';
import Button from '../ui/Button';
import { UploadCloud, FileText, Bot } from 'lucide-react';

interface StatementUploadProps {
    suppliers: Supplier[];
    onReconcile: (supplierId: string, statementContent: string) => void;
    isLoading: boolean;
}

const StatementUpload: React.FC<StatementUploadProps> = ({ suppliers, onReconcile, isLoading }) => {
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const uploadedFile = e.target.files[0];
            if (uploadedFile.type === 'text/plain' || uploadedFile.type === 'text/csv') {
                setFile(uploadedFile);
                setError('');
            } else {
                setFile(null);
                setError('Invalid file type. Please upload a .txt or .csv file.');
            }
        }
    };

    const handleSubmit = () => {
        if (!selectedSupplier || !file) {
            setError('Please select a supplier and upload a statement file.');
            return;
        }
        setError('');

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            onReconcile(selectedSupplier, content);
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="supplier" className="block text-sm font-medium text-slate-300 mb-1">1. Select Supplier</label>
                    <select
                        id="supplier"
                        value={selectedSupplier}
                        onChange={e => setSelectedSupplier(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-800/50 border rounded-lg text-white focus:outline-none focus:ring-2 border-slate-600 focus:ring-[#D10028]/80"
                    >
                        <option value="">-- Choose a supplier --</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="statement-upload" className="block text-sm font-medium text-slate-300 mb-1">2. Upload Statement</label>
                    <label
                        htmlFor="statement-upload"
                        className="flex items-center justify-center w-full px-4 py-2.5 bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-red-500 transition-colors"
                    >
                        {file ? (
                            <>
                                <FileText className="w-5 h-5 mr-2 text-green-400" />
                                <span className="text-sm text-slate-200">{file.name}</span>
                            </>
                        ) : (
                            <>
                                <UploadCloud className="w-5 h-5 mr-2 text-slate-400" />
                                <span className="text-sm text-slate-400">Choose a .txt or .csv file</span>
                            </>
                        )}
                    </label>
                    <input id="statement-upload" type="file" className="hidden" onChange={handleFileChange} accept=".txt,.csv" />
                </div>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <div className="pt-2">
                <Button onClick={handleSubmit} disabled={!selectedSupplier || !file || isLoading}>
                    <Bot className="w-4 h-4 mr-2" />
                    {isLoading ? 'Reconciling...' : 'Reconcile with AI'}
                </Button>
            </div>
        </div>
    );
};

export default StatementUpload;
