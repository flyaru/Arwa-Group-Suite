
import React from 'react';
import type { Traveler, Customer } from '../../types';

interface TravelerTableProps {
    travelers: Traveler[];
    customers: Customer[];
}

const TravelerTable: React.FC<TravelerTableProps> = ({ travelers, customers }) => {
    const customerMap = new Map(customers.map(c => [c.id, c.name]));

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Name</th>
                        <th scope="col" className="px-6 py-3">Passport No.</th>
                        <th scope="col" className="px-6 py-3">Nationality</th>
                        <th scope="col" className="px-6 py-3">Associated Customer</th>
                        <th scope="col" className="px-6 py-3">
                            <span className="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {travelers.map((traveler) => (
                        <tr key={traveler.id} className="border-b border-slate-800 hover:bg-slate-800/40">
                            <td className="px-6 py-4 font-medium text-white">{traveler.name}</td>
                            <td className="px-6 py-4">{traveler.passportNo}</td>
                            <td className="px-6 py-4">{traveler.nationality}</td>
                            <td className="px-6 py-4">{customerMap.get(traveler.customerId) || 'N/A'}</td>
                            <td className="px-6 py-4 text-right">
                                <a href="#" className="font-medium text-red-500 hover:underline">Edit</a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TravelerTable;