
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { Search, Users, FileText, Receipt, CornerDownLeft } from 'lucide-react';
import type { Customer, DSR, Invoice } from '../../types';

// Debounce hook
function useDebounce(value: string, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

interface SearchResults {
    customers: Customer[];
    dsrs: DSR[];
    invoices: Invoice[];
}

const GlobalSearchModal: React.FC = () => {
    const { 
        isSearchModalOpen, 
        setIsSearchModalOpen, 
        customers, 
        dsrs, 
        invoices,
        setGlobalDetailView 
    } = useApp();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResults>({ customers: [], dsrs: [], invoices: [] });
    const debouncedQuery = useDebounce(query, 300);

    // FIX: Explicitly typed the map with `useMemo` to resolve type inference issues, preventing `unknown` type on `get()`.
    const customerMap = useMemo(() => new Map<string, string>(customers.map(c => [c.id, c.name])), [customers]);

    useEffect(() => {
        if (debouncedQuery.length < 2) {
            setResults({ customers: [], dsrs: [], invoices: [] });
            return;
        }

        const lowerQuery = debouncedQuery.toLowerCase();

        const foundCustomers = customers.filter(c => 
            c.name.toLowerCase().includes(lowerQuery) ||
            c.phone.includes(lowerQuery) ||
            c.email.toLowerCase().includes(lowerQuery)
        ).slice(0, 5);

        const foundDsrs = dsrs.filter(d => 
            d.pnr.toLowerCase().includes(lowerQuery) ||
            d.ticketNo.toLowerCase().includes(lowerQuery) ||
            d.route.toLowerCase().includes(lowerQuery) ||
            (customerMap.get(d.customerId) || '').toLowerCase().includes(lowerQuery)
        ).slice(0, 5);

        const foundInvoices = invoices.filter(i => 
            i.invoiceNo.toLowerCase().includes(lowerQuery) ||
            (customerMap.get(i.customerId) || '').toLowerCase().includes(lowerQuery)
        ).slice(0, 5);

        setResults({ customers: foundCustomers, dsrs: foundDsrs, invoices: foundInvoices });

    }, [debouncedQuery, customers, dsrs, invoices, customerMap]);
    
    const handleClose = useCallback(() => {
        setIsSearchModalOpen(false);
    }, [setIsSearchModalOpen]);
    
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleClose();
            }
        };
        if (isSearchModalOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isSearchModalOpen, handleClose]);

    useEffect(() => {
        if (!isSearchModalOpen) {
            setTimeout(() => setQuery(''), 200); // Clear query after fade out
        }
    }, [isSearchModalOpen]);

    const handleCustomerClick = (customer: Customer) => {
        navigate('/customers');
        handleClose();
    };
    
    const handleDsrClick = (dsr: DSR) => {
        setGlobalDetailView({ type: 'dsr', id: dsr.id });
        navigate('/dsrs');
        handleClose();
    };

    const handleInvoiceClick = (invoice: Invoice) => {
        setGlobalDetailView({ type: 'invoice', id: invoice.id });
        navigate('/invoices');
        handleClose();
    };

    if (!isSearchModalOpen) return null;

    const hasResults = results.customers.length > 0 || results.dsrs.length > 0 || results.invoices.length > 0;

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center z-50 pt-[15vh] p-4"
            onClick={handleClose}
        >
            <div
                className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-lg w-full max-w-2xl max-h-[70vh] flex flex-col animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-4 p-4 border-b border-white/10">
                    <Search className="w-6 h-6 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Search for customers, DSRs, invoices..."
                        className="w-full bg-transparent text-lg text-white placeholder-slate-500 focus:outline-none"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />
                     <button onClick={handleClose} className="text-sm text-slate-400 border border-slate-600 rounded-md px-2 py-1">Esc</button>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    {debouncedQuery.length > 1 && !hasResults && (
                        <div className="text-center py-12">
                            <p className="text-slate-400">No results found for "{debouncedQuery}"</p>
                        </div>
                    )}
                    
                    {results.customers.length > 0 && (
                        <ResultSection icon={Users} title="Customers">
                            {results.customers.map(customer => (
                                <ResultItem key={customer.id} onClick={() => handleCustomerClick(customer)}>
                                    <p className="font-semibold text-white truncate">{customer.name}</p>
                                    <p className="text-xs text-slate-400 truncate">{customer.phone} • {customer.email}</p>
                                </ResultItem>
                            ))}
                        </ResultSection>
                    )}
                    {results.dsrs.length > 0 && (
                         <ResultSection icon={FileText} title="DSRs">
                            {results.dsrs.map(dsr => (
                                <ResultItem key={dsr.id} onClick={() => handleDsrClick(dsr)}>
                                    <p className="font-semibold text-white truncate">PNR: {dsr.pnr} / {dsr.route}</p>
                                    <p className="text-xs text-slate-400 truncate">Customer: {customerMap.get(dsr.customerId)} • Fare: SAR {dsr.sellingFare.toFixed(2)}</p>
                                </ResultItem>
                            ))}
                        </ResultSection>
                    )}
                     {results.invoices.length > 0 && (
                         <ResultSection icon={Receipt} title="Invoices">
                            {results.invoices.map(invoice => (
                                <ResultItem key={invoice.id} onClick={() => handleInvoiceClick(invoice)}>
                                    <p className="font-semibold text-white truncate">Invoice #{invoice.invoiceNo}</p>
                                    <p className="text-xs text-slate-400 truncate">Customer: {customerMap.get(invoice.customerId)} • Total: SAR {invoice.total.toFixed(2)}</p>
                                </ResultItem>
                            ))}
                        </ResultSection>
                    )}

                </div>
                 {query.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        <p>Search for anything across the application.</p>
                    </div>
                 )}
                 <footer className="p-2 border-t border-white/10 text-xs text-slate-400 flex justify-end">
                    <span>Powered by ArwaTech AI Search</span>
                 </footer>
            </div>
             <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(-20px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

const ResultSection: React.FC<{ icon: React.ElementType; title: string; children: React.ReactNode }> = ({ icon: Icon, title, children }) => (
    <div className="mb-2">
        <h3 className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-400">
            <Icon className="w-4 h-4" /> {title}
        </h3>
        <ul className="space-y-1">{children}</ul>
    </div>
);

const ResultItem: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
    <li>
        <button
            onClick={onClick}
            className="w-full text-left p-3 rounded-lg hover:bg-white/10 transition-colors flex justify-between items-center"
        >
            <div className="flex-1 min-w-0">{children}</div>
            <CornerDownLeft className="w-4 h-4 text-slate-500 ml-4 flex-shrink-0" />
        </button>
    </li>
);

export default GlobalSearchModal;