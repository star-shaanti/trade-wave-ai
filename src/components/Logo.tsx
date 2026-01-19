import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ className = "", size = 48 }) => {
  return (
    <div 
      className={`flex items-center justify-center font-black ${className}`}
      style={{ 
        fontSize: `${size}px`,
        letterSpacing: `${size * 0.1}px`,
        lineHeight: 1,
        fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
        fontWeight: 900
      }}
    >
      <span 
        className="bg-gradient-to-br from-[#00d4aa] via-[#0095ff] to-[#00d4aa] bg-clip-text text-transparent"
        style={{
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 0 30px rgba(0, 212, 170, 0.4)',
          filter: 'drop-shadow(0 2px 8px rgba(0, 212, 170, 0.3))',
        }}
      >
        RTS
      </span>
    </div>
  );
};

// Fonction pour générer le favicon SVG avec RTS
export const generateFavicon = () => {
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#00d4aa;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#0095ff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#00d4aa;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" fill="#0a0e1a" rx="80"/>
      <text x="256" y="340" font-family="system-ui, -apple-system, sans-serif" font-size="280" font-weight="900" fill="url(#grad)" text-anchor="middle" dominant-baseline="middle" letter-spacing="-10">RTS</text>
    </svg>
  `)}`;
};

export default Logo;
