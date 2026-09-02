import React from 'react';

interface PneuBrasLogoProps {
  className?: string;
  height?: number;
}

// Inline SVG serialized to Base64 to ensure 100% compatibility with html2canvas and other PDF conversion tools.
// This prevents crashes with SVG rendering engines and ensures texts/transforms render perfectly.
export const PneuBrasLogo: React.FC<PneuBrasLogoProps> = ({ className = '', height = 65 }) => {
  const width = Math.round(height * 2.8);

  return (
    <div className={`flex items-center select-none ${className}`} style={{ height: `${height}px`, width: `${width}px` }}>
      <svg 
        viewBox="0 0 520 180" 
        width="100%" 
        height="100%" 
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <g transform="translate(10, 0) skewX(-14)">
          <text 
            x="135" 
            y="42" 
            fontFamily="'Montserrat', 'Arial Black', sans-serif" 
            fontWeight="900" 
            fontStyle="italic" 
            fontSize="26" 
            fill="#000000" 
            textAnchor="start"
            letterSpacing="-0.5"
          >
            Grupo
          </text>
          <text 
            x="78" 
            y="96" 
            fontFamily="'Montserrat', 'Arial Black', sans-serif" 
            fontWeight="900" 
            fontStyle="italic" 
            fontSize="58" 
            fill="#E07A00" 
            textAnchor="start"
            letterSpacing="-1.5"
          >
            Pneu
          </text>
          <text 
            x="15" 
            y="166" 
            fontFamily="'Montserrat', 'Arial Black', sans-serif" 
            fontWeight="900" 
            fontStyle="italic" 
            fontSize="92" 
            fill="#000000" 
            textAnchor="start"
            letterSpacing="-3.5"
          >
            Bras
          </text>
        </g>
        <g>
          <path 
            d="M 210,115 C 235,165 315,155 400,75 C 320,115 265,110 210,115 Z" 
            fill="#000000" 
          />
          <path 
            d="M 210,115 C 235,165 315,155 400,75 C 320,115 265,110 210,115 Z" 
            transform="translate(42, -18)"
            fill="#000000" 
          />
          <path 
            d="M 210,115 C 235,165 315,155 400,75 C 320,115 265,110 210,115 Z" 
            transform="translate(84, -36)"
            fill="#E07A00" 
          />
        </g>
      </svg>
    </div>
  );
};



