
import React from 'react';

const ChiLogo: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* A stylized Chi (χ) symbol that looks like a statistical 'X' */}
      <path 
        d="M20 20 L80 80 M80 20 C60 40, 40 60, 20 80" 
        stroke="currentColor" 
        strokeWidth="12" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <circle cx="50" cy="50" r="8" fill="currentColor" className="opacity-50" />
    </svg>
  );
};

export default ChiLogo;
