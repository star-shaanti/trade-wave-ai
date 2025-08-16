import React from "react";

interface SatelliteIconProps {
  className?: string;
}

export const SatelliteIcon: React.FC<SatelliteIconProps> = ({ className = "" }) => {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Solar panels */}
      <rect x="8" y="24" width="12" height="16" rx="1" fill="currentColor" opacity="0.8"/>
      <rect x="44" y="24" width="12" height="16" rx="1" fill="currentColor" opacity="0.8"/>
      
      {/* Main satellite body */}
      <rect x="22" y="26" width="20" height="12" rx="2" fill="currentColor"/>
      
      {/* Antenna/dish */}
      <circle cx="32" cy="20" r="4" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="32" cy="20" r="2" fill="currentColor"/>
      
      {/* Signal waves */}
      <path d="M45 15 Q50 20 45 25" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.7"/>
      <path d="M48 12 Q55 20 48 28" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
      <path d="M51 9 Q60 20 51 31" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
      
      {/* Grid lines on solar panels */}
      <line x1="10" y1="26" x2="10" y2="38" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
      <line x1="12" y1="26" x2="12" y2="38" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
      <line x1="14" y1="26" x2="14" y2="38" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
      <line x1="16" y1="26" x2="16" y2="38" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
      <line x1="18" y1="26" x2="18" y2="38" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
      
      <line x1="46" y1="26" x2="46" y2="38" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
      <line x1="48" y1="26" x2="48" y2="38" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
      <line x1="50" y1="26" x2="50" y2="38" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
      <line x1="52" y1="26" x2="52" y2="38" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
      <line x1="54" y1="26" x2="54" y2="38" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
      
      <line x1="8" y1="28" x2="20" y2="28" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
      <line x1="8" y1="30" x2="20" y2="30" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
      <line x1="8" y1="32" x2="20" y2="32" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
      <line x1="8" y1="34" x2="20" y2="34" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
      <line x1="8" y1="36" x2="20" y2="36" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
      
      <line x1="44" y1="28" x2="56" y2="28" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
      <line x1="44" y1="30" x2="56" y2="30" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
      <line x1="44" y1="32" x2="56" y2="32" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
      <line x1="44" y1="34" x2="56" y2="34" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
      <line x1="44" y1="36" x2="56" y2="36" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
    </svg>
  );
};