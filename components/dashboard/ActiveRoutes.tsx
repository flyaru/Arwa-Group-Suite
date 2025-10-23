
import React from 'react';
import Card from '../ui/Card';
import { useApp } from '../../contexts/AppContext';

const ActiveRoutes: React.FC = () => {
    const { airports, activeRoutes } = useApp();
    
    // Create a map for quick airport lookup by code
    const airportMap = new Map(airports.map(a => [a.code, a]));

    const getPathD = (fromX: number, fromY: number, toX: number, toY: number) => {
        const midX = (fromX + toX) / 2;
        const midY = (fromY + toY) / 2;
        // Add some curve
        const controlX = midX + (toY - fromY) * 0.2;
        const controlY = midY - (toX - fromX) * 0.2;
        return `M ${fromX} ${fromY} Q ${controlX} ${controlY}, ${toX} ${toY}`;
    };

    return (
        <Card className="p-6 h-[400px] flex flex-col relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-t from-[#D10028]/40 to-transparent z-0"></div>
            <h3 className="text-lg font-bold text-white mb-4 z-10">Active Routes</h3>
            <div className="flex-grow flex items-center justify-center z-10">
                <svg viewBox="0 0 300 180" className="w-full h-full">
                    <defs>
                        <style>
                            {`
                                .route-path {
                                    stroke-dasharray: 400;
                                    stroke-dashoffset: 400;
                                    animation: draw-route 3s ease-out forwards;
                                }
                                @keyframes draw-route {
                                    to { stroke-dashoffset: 0; }
                                }
                                .city-dot {
                                    animation: pulse 2.5s infinite;
                                }
                                @keyframes pulse {
                                    0% { r: 2.5; opacity: 1; }
                                    50% { r: 5; opacity: 0.7; }
                                    100% { r: 2.5; opacity: 1; }
                                }
                                .city-label {
                                    font-size: 8px;
                                    fill: #fff;
                                    text-anchor: middle;
                                }
                            `}
                        </style>
                    </defs>
                    
                    {/* Render Routes */}
                    {activeRoutes.map((route, index) => {
                        const fromAirport = airportMap.get(route.from);
                        const toAirport = airportMap.get(route.to);
                        if (!fromAirport || !toAirport) return null;

                        return (
                            <path
                                key={`${route.from}-${route.to}`}
                                className="route-path"
                                d={getPathD(fromAirport.x, fromAirport.y, toAirport.x, toAirport.y)}
                                stroke="rgba(255,255,255,0.5)"
                                strokeWidth="1.5"
                                fill="none"
                                style={{ animationDelay: `${index * 0.5}s` }}
                            />
                        );
                    })}
                    
                    {/* Render Airports */}
                    {airports.map(airport => (
                        <g key={airport.code}>
                            <circle cx={airport.x} cy={airport.y} r="2.5" fill="#fff" className="city-dot" />
                            <text x={airport.x} y={airport.y + 12} className="city-label">{airport.code}</text>
                        </g>
                    ))}

                </svg>
            </div>
        </Card>
    );
};

export default ActiveRoutes;
