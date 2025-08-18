import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ className = "", size = 48 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Fond noir avec bordure violette fine */}
      <circle cx="50" cy="50" r="48" fill="black" stroke="#8b5cf6" strokeWidth="1" />
      
      {/* Rectangle vert (écran/appareil) en haut */}
      <rect x="28" y="18" width="16" height="10" fill="#22c55e" rx="1" />
      
      {/* Dollar sign vert dans un rectangle avec bordure */}
      <rect x="25" y="15" width="6" height="4" fill="none" stroke="#22c55e" strokeWidth="0.3" rx="0.3" />
      <text x="27.5" y="17.5" fontSize="2.5" fill="#22c55e" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">$</text>
      
      {/* 3 ondes de signal vertes courbes qui émanent du rectangle */}
      <path
        d="M 28 28 Q 32 26 36 28"
        stroke="#22c55e"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M 28 30 Q 32 28 36 30"
        stroke="#22c55e"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M 28 32 Q 32 30 36 32"
        stroke="#22c55e"
        strokeWidth="1"
        fill="none"
      />
      
      {/* Arc vert épais (jauge/affichage) en forme de courbe */}
      <path
        d="M 22 42 Q 50 37 78 42"
        stroke="#22c55e"
        strokeWidth="2.5"
        fill="none"
      />
      
      {/* Graphique en barres violet avec 3 barres de hauteur progressive */}
      <rect x="32" y="44" width="3" height="6" fill="#8b5cf6" />
      <rect x="38" y="42" width="3" height="8" fill="#8b5cf6" />
      <rect x="44" y="40" width="3" height="10" fill="#8b5cf6" />
      
      {/* Flèche diagonale violette pointant vers le haut et la droite */}
      <path
        d="M 34 52 L 40 46 L 38 44 L 44 38 L 46 40 L 40 46"
        stroke="#8b5cf6"
        strokeWidth="1.2"
        fill="none"
        markerEnd="url(#arrowhead)"
      />
      
      {/* Base du graphique - ligne horizontale violette fine */}
      <line x1="30" y1="54" x2="48" y2="54" stroke="#8b5cf6" strokeWidth="0.8" />
      
      {/* Support central vertical */}
      <line x1="39" y1="54" x2="39" y2="56" stroke="#8b5cf6" strokeWidth="0.8" />
      
      {/* Définition de la flèche */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="3"
          markerHeight="2.5"
          refX="2.5"
          refY="1.25"
          orient="auto"
        >
          <polygon
            points="0 0, 3 1.25, 0 2.5"
            fill="#8b5cf6"
          />
        </marker>
      </defs>
    </svg>
  );
};

export default Logo;
