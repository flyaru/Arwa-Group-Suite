
import React from 'react';
import type { DSRStatus } from '../../types';

interface BadgeProps {
    status: DSRStatus;
}

const statusStyles: Record<DSRStatus, string> = {
    draft: 'bg-slate-600/50 text-slate-300 border-slate-500',
    submitted: 'bg-sky-600/50 text-sky-300 border-sky-500',
    approved: 'bg-amber-600/50 text-amber-300 border-amber-500',
    posted: 'bg-green-600/50 text-green-300 border-green-500',
};

const Badge: React.FC<BadgeProps> = ({ status }) => {
    return (
        <span
            className={`px-2.5 py-1 text-xs font-semibold capitalize rounded-full border ${statusStyles[status]}`}
        >
            {status}
        </span>
    );
};

export default Badge;
