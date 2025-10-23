
import React, { useState } from 'react';
import type { ReconciliationResult } from '../../types';
import Card from '../ui/Card';
import { Check, AlertTriangle, HelpCircle } from 'lucide-react';

interface ReconciliationResultsProps {
    results: ReconciliationResult;
}

type Tab = 'matched' | 'unmatchedStatement' | 'unmatchedDSRs';

const ResultCard: React.FC<{ title: string; count: number; icon: React.ElementType; color: string }> = ({ title, count, icon: Icon, color }) => (
    <div className={`p-4 rounded-lg bg-slate-800/50 border-l-4 ${color}`}>
        <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400 font-medium">{title}</p>
            <Icon className="w-5 h-5 text-slate-500" />
        </div>
        <p className="text-2xl font-bold text-white mt-1">{count}</p>
    </div>
);

const ReconciliationResults: React.FC<ReconciliationResultsProps> = ({ results }) => {
    const [activeTab, setActiveTab] = useState<Tab>('matched');

    const renderTable = () => {
        switch (activeTab) {
            case 'matched':
                return (
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-3">Statement Line</th>
                                <th className="px-6 py-3">Matched DSR ID</th>
                                <th className="px-6 py-3">PNR</th>
                                <th className="px-6 py-3 text-right">Amount (SAR)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.matched.map((item, i) => (
                                <tr key={i} className="border-b border-slate-800">
                                    <td className="px-6 py-4 font-mono text-xs">{item.statementLine}</td>
                                    <td className="px-6 py-4 font-mono text-xs text-green-400">{item.dsrId}</td>
                                    <td className="px-6 py-4">{item.pnr}</td>
                                    <td className="px-6 py-4 text-right font-semibold">{item.amount.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'unmatchedStatement':
                return (
                    <table className="w-full text-sm text-left text-slate-300">
                         <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-3">Unmatched Line from Statement</th>
                                <th className="px-6 py-3">AI Reason</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.unmatchedInStatement.map((item, i) => (
                                <tr key={i} className="border-b border-slate-800">
                                    <td className="px-6 py-4 font-mono text-xs">{item.line}</td>
                                    <td className="px-6 py-4 text-amber-400">{item.reason}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'unmatchedDSRs':
                return (
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-3">Unmatched DSR in System</th>
                                <th className="px-6 py-3">AI Reason</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.unmatchedInDSRs.map((item, i) => (
                                <tr key={i} className="border-b border-slate-800">
                                    <td className="px-6 py-4 font-mono text-xs">{item.line}</td>
                                    <td className="px-6 py-4 text-sky-400">{item.reason}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
        }
    };

    const TabButton: React.FC<{ tab: Tab; label: string }> = ({ tab, label }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab ? 'bg-red-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
        >
            {label}
        </button>
    );

    return (
        <Card className="animate-fade-in">
            <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-4">Reconciliation Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ResultCard title="Matched Transactions" count={results.matched.length} icon={Check} color="border-green-500" />
                    <ResultCard title="Unmatched in Statement" count={results.unmatchedInStatement.length} icon={AlertTriangle} color="border-amber-500" />
                    <ResultCard title="Unmatched in DSRs" count={results.unmatchedInDSRs.length} icon={HelpCircle} color="border-sky-500" />
                </div>
            </div>

            <div className="px-6 py-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                    <TabButton tab="matched" label="Matched" />
                    <TabButton tab="unmatchedStatement" label="Unmatched (Statement)" />
                    <TabButton tab="unmatchedDSRs" label="Unmatched (DSRs)" />
                </div>
            </div>

            <div className="overflow-x-auto">
                {renderTable()}
            </div>
             <style>{`
                @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
            `}</style>
        </Card>
    );
};

export default ReconciliationResults;
