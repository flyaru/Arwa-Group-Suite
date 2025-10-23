
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    children: React.ReactNode;
    error?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ label, id, children, error, ...props }, ref) => {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
            <select
                id={id}
                ref={ref}
                className={`w-full px-4 py-2.5 bg-slate-800/50 border rounded-lg text-white focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500/80' : 'border-slate-600 focus:ring-[#D10028]/80'}`}
                {...props}
            >
                {children}
            </select>
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>
    );
});

export default Select;
