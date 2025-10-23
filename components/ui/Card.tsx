
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={`bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg transition-all duration-200 ease-in-out hover:shadow-2xl hover:scale-[1.01] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;