import React, { useState, useRef, useEffect } from 'react';
import { FileDown, FileType, Printer } from 'lucide-react';
import Button from '../ui/Button';
import { exportToCsv, exportToPdf } from '../../lib/exportUtils';

type DataObject = { [key: string]: any };

interface Column<T> {
    accessor: keyof T;
    Header: string;
}

interface ExportButtonProps<T extends DataObject> {
    data: T[];
    columns: Column<T>[];
    filename: string; // Filename without extension
}

const ExportButton = <T extends DataObject>({ data, columns, filename }: ExportButtonProps<T>) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleExportCsv = () => {
        exportToCsv(data, columns, filename);
        setIsOpen(false);
    };

    const handleExportPdf = () => {
        exportToPdf(data, columns, filename.replace(/_/g, ' '));
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <Button variant="secondary" onClick={() => setIsOpen(!isOpen)}>
                <FileDown className="w-4 h-4 mr-2" />
                Export
            </Button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-20 animate-fade-in-up">
                    <ul className="py-1">
                        <li>
                            <button
                                onClick={handleExportCsv}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                            >
                                <FileType className="w-4 h-4" />
                                <span>Export as CSV</span>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={handleExportPdf}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                            >
                                <Printer className="w-4 h-4" />
                                <span>Export as PDF</span>
                            </button>
                        </li>
                    </ul>
                </div>
            )}
            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default ExportButton;
