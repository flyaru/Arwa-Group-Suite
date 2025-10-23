import React, { useState, useEffect } from 'react';

interface ZatcaQRCodeProps {
    tlv: string;
}

const ZatcaQRCode: React.FC<ZatcaQRCodeProps> = ({ tlv }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (tlv) {
            setIsLoading(true);
            const url = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(tlv)}`;
            
            // Preload the image to check if it's loaded
            const img = new Image();
            img.src = url;
            img.onload = () => {
                setQrCodeUrl(url);
                setIsLoading(false);
            };
            img.onerror = () => {
                console.error("Failed to load QR code image.");
                setIsLoading(false);
            };
        }
    }, [tlv]);

    if (isLoading) {
        return <div className="w-[120px] h-[120px] bg-gray-200 animate-pulse rounded-md flex items-center justify-center text-xs text-gray-500">Loading QR...</div>;
    }

    if (!qrCodeUrl) {
        return <div className="w-[120px] h-[120px] bg-red-100 rounded-md flex items-center justify-center text-xs text-red-500 text-center p-2">Error generating QR Code</div>;
    }

    return (
        <img 
            src={qrCodeUrl} 
            alt="ZATCA QR Code" 
            className="w-[120px] h-[120px]" 
        />
    );
};

export default ZatcaQRCode;
