
import React from 'react';

const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#0B2D48]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B2D48] via-transparent to-[#d10028]/50 opacity-80"></div>
      <svg
        className="absolute inset-0 w-full h-full opacity-10"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <style>
            {`
              .route-line {
                stroke-dasharray: 400;
                stroke-dashoffset: 400;
                animation: draw-line 60s linear infinite;
              }
              @keyframes draw-line {
                to {
                  stroke-dashoffset: 0;
                }
              }
              .route-line-2 {
                stroke-dasharray: 500;
                stroke-dashoffset: 500;
                animation: draw-line-2 80s linear infinite;
              }
               @keyframes draw-line-2 {
                to {
                  stroke-dashoffset: 0;
                }
              }
            `}
          </style>
        </defs>
        <path
          className="route-line"
          d="M -100 300 Q 400 100, 800 400 T 1600 200"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
          fill="none"
        />
        <path
          className="route-line-2"
          d="M 2000 600 Q 1500 800, 1000 500 T 200 700"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
          fill="none"
        />
         <path
          className="route-line"
          d="M 500 1000 Q 800 800, 1200 900 T 2000 700"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1"
          fill="none"
          style={{animationDuration: '70s'}}
        />
      </svg>
    </div>
  );
};

export default AnimatedBackground;
