
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ label, id, error, ...props }, ref) => {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
            <input
                id={id}
                ref={ref}
                className={`w-full px-4 py-2.5 bg-slate-800/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500/80' : 'border-slate-600 focus:ring-[#D10028]/80'}`}
                {...props}
            />
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>
    );
});


export default Input;
