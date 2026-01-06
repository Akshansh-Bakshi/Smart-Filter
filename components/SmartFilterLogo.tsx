
import React from 'react';

const SmartFilterLogo: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Diagonal Table Background Grid - Low visibility */}
      <g transform="rotate(-15 50 50)" opacity="0.15">
        <rect x="15" y="15" width="70" height="70" rx="4" stroke="currentColor" strokeWidth="4" />
        <line x1="15" y1="38" x2="85" y2="38" stroke="currentColor" strokeWidth="2" />
        <line x1="15" y1="62" x2="85" y2="62" stroke="currentColor" strokeWidth="2" />
        <line x1="38" y1="15" x2="38" y2="85" stroke="currentColor" strokeWidth="2" />
        <line x1="62" y1="15" x2="62" y2="85" stroke="currentColor" strokeWidth="2" />
      </g>
      
      {/* Stylish SF Text */}
      <text 
        x="50" 
        y="62" 
        textAnchor="middle" 
        fill="currentColor" 
        style={{ 
          fontSize: '48px', 
          fontWeight: '900', 
          fontFamily: "'Inter', sans-serif",
          letterSpacing: '-4px',
          fontStyle: 'italic'
        }}
      >
        SF
      </text>
      
      {/* Decorative dots for a 'tech' feel */}
      <circle cx="20" cy="20" r="3" fill="currentColor" opacity="0.4" />
      <circle cx="80" cy="80" r="3" fill="currentColor" opacity="0.4" />
    </svg>
  );
};

export default SmartFilterLogo;
