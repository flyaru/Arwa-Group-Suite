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
            <img src="https://i.imgur.com/W85d6C4.png" alt="Arwa Logo" className="h-16 mx-auto" />
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
