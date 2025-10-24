import React from 'react';

const ArwaLogoFull: React.FC = () => (
    <div className="flex justify-between items-start">
        {/* English Details */}
        <div className="text-xs">
            <h2 className="font-bold text-lg mb-1">ARWA TRAVEL & EVENTS</h2>
            <p>3140 Al Mutalla St, Al Rawdah, Jazan 82723, Saudi Arabia</p>
            <p>VAT Reg: 310263881300003</p>
            <p>CR No: 441112285137</p>
        </div>

        {/* Logo */}
        <div className="flex-shrink-0 mx-4 text-center">
            <svg
              className="h-16 w-auto mx-auto"
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
            <p className="text-xs mt-1 font-bold">ARWA GROUP</p>
        </div>

        {/* Arabic Details */}
        <div className="text-xs text-right" dir="rtl">
            <h2 className="font-bold text-lg mb-1 font-['Tajawal']">أروى للسفر والفعاليات</h2>
            <p>٣١٤٠ شارع المطلة ، حي الروضة، جازان ٨٢٧٢٣، المملكة العربية السعودية</p>
            <p>الرقم الضريبي: 310263881300003</p>
            <p>س.ت: 441112285137</p>
        </div>
    </div>
);

export default ArwaLogoFull;