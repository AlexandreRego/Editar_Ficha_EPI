import React from 'react';

interface PneuBrasLogoProps {
  className?: string;
  height?: number;
}

export const PneuBrasLogo: React.FC<PneuBrasLogoProps> = ({
  className = '',
  height = 65,
}) => {
  return (
    <img
      src="/LogoOriginal.png"
      alt="Logo Grupo PneuBras"
      style={{ height: `${height}px`, width: 'auto' }}
      className={`object-contain shrink-0 ${className}`}
    />
  );
};