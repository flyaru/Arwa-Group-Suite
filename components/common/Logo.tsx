import React from 'react';

const ArwaLogo = ({ className = '' }: { className?: string }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <svg
      className="h-8 w-auto"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2L2 22H22L12 2Z"
        fill="#D10028"
      />
      <path
        d="M12 9L7 22H17L12 9Z"
        fill="#0B2D48"
        fillOpacity="0.5"
      />
      <path
        d="M12 12.5L10.5 14.5L11 12L9.5 11L11.5 10.8L12 9L12.5 10.8L14.5 11L13 12L13.5 14.5L12 12.5Z"
        fill="white"
      />
    </svg>
    <span className="font-bold text-xl text-white">Arwa Group</span>
  </div>
);

export default ArwaLogo;