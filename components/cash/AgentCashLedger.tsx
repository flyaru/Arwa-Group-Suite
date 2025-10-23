
import React from 'react';

interface LedgerEntry {
    date: string;
    description: string;
    debit: number;
    credit: number;
    balance: number;
}

interface AgentCashLedgerProps {
    ledger: LedgerEntry[];
}

const AgentCashLedger: React.FC<AgentCashLedgerProps> = ({ ledger }) => {
    return (
        <div className="overflow-x-auto max-h-96">
            <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 sticky top-0">
                    <tr>
                        <th scope="col" className="px-6 py-3">Date</th>
                        <th scope="col" className="px-6 py-3">Description</th>
                        <th scope="col" className="px-6 py-3 text-right">Debit (In)</th>
                        <th scope="col" className="px-6 py-3 text-right">Credit (Out)</th>
                        <th scope="col" className="px-6 py-3 text-right">Balance</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {ledger.map((entry, index) => (
                        <tr key={index} className="hover:bg-slate-800/40">
                            <td className="px-6 py-4 whitespace-nowrap">{entry.date}</td>
                            <td className="px-6 py-4">{entry.description}</td>
                            <td className="px-6 py-4 text-right text-green-400">
                                {entry.debit > 0 ? entry.debit.toFixed(2) : '-'}
                            </td>
                            <td className="px-6 py-4 text-right text-red-400">
                                {entry.credit > 0 ? entry.credit.toFixed(2) : '-'}
                            </td>
                            <td className="px-6 py-4 text-right font-semibold text-white">
                                {entry.balance.toFixed(2)}
                            </td>
                        </tr>
                    ))}
                     {ledger.length === 0 && (
                        <tr>
                            <td colSpan={5} className="text-center py-8 text-slate-400">No cash transactions recorded.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AgentCashLedger;
