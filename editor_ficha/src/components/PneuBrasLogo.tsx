import React from 'react';
// O ../../ faz o código sair da pasta components, sair da pasta src e ir para a raiz buscar a imagem
import logoImg from '../../LogoOriginal.png'; 

interface PneuBrasLogoProps {
  className?: string;
  height?: number;
}

export const PneuBrasLogo: React.FC<PneuBrasLogoProps> = ({ className = '', height = 65 }) => {
  return (
    <img 
      src={logoImg} 
      alt="Logo Grupo PneuBras"
      style={{ height: `${height}px`, width: 'auto' }}
      className={`object-contain shrink-0 ${className}`}
    />
  );
};