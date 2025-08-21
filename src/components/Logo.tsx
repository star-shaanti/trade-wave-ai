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
      {/* Cercle violet épais avec bordure blanche */}
      <circle cx="50" cy="50" r="45" fill="white" stroke="#8b5cf6" strokeWidth="8" />
      
      {/* Rectangle vert avec symbole dollar en haut */}
      <rect x="35" y="20" width="8" height="5" fill="#22c55e" rx="0.5" />
      <text x="39" y="22.5" fontSize="3" fill="white" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">$</text>
      
      {/* Triangle vert à droite du rectangle dollar */}
      <polygon points="43,20 45,22.5 43,25" fill="#22c55e" />
      
      {/* Carré vert central */}
      <rect x="38" y="30" width="12" height="12" fill="#22c55e" rx="1" />
      
      {/* Trois ondes de signal vertes courbes sous le carré */}
      <path
        d="M 38 42 Q 44 40 50 42"
        stroke="#22c55e"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M 38 44 Q 44 42 50 44"
        stroke="#22c55e"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M 38 46 Q 44 44 50 46"
        stroke="#22c55e"
        strokeWidth="1.5"
        fill="none"
      />
      
      {/* Arc vert épais en forme de courbe inversée */}
      <path
        d="M 30 55 Q 50 50 70 55"
        stroke="#22c55e"
        strokeWidth="3"
        fill="none"
      />
      
      {/* Graphique en barres violet avec 3 barres de hauteur croissante */}
      <rect x="40" y="58" width="4" height="6" fill="#8b5cf6" />
      <rect x="47" y="56" width="4" height="8" fill="#8b5cf6" />
      <rect x="54" y="54" width="4" height="10" fill="#8b5cf6" />
      
      {/* Flèche diagonale violette pointant vers le haut et la droite */}
      <path
        d="M 42 66 L 50 58 L 48 56 L 56 48 L 58 50 L 50 58"
        stroke="#8b5cf6"
        strokeWidth="1.5"
        fill="none"
        markerEnd="url(#arrowhead)"
      />
      
      {/* Ligne horizontale verte à la base */}
      <line x1="38" y1="70" x2="62" y2="70" stroke="#22c55e" strokeWidth="1.5" />
      
      {/* Définition de la flèche */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="4"
          markerHeight="3"
          refX="3"
          refY="1.5"
          orient="auto"
        >
          <polygon
            points="0 0, 4 1.5, 0 3"
            fill="#8b5cf6"
          />
        </marker>
      </defs>
    </svg>
  );
};

// Fonction pour générer le favicon SVG
export const generateFavicon = () => {
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="32" height="32" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="white" stroke="#8b5cf6" stroke-width="8" />
      <rect x="35" y="20" width="8" height="5" fill="#22c55e" rx="0.5" />
      <text x="39" y="22.5" font-size="3" fill="white" font-weight="bold" text-anchor="middle" dominant-baseline="middle">$</text>
      <polygon points="43,20 45,22.5 43,25" fill="#22c55e" />
      <rect x="38" y="30" width="12" height="12" fill="#22c55e" rx="1" />
      <path d="M 38 42 Q 44 40 50 42" stroke="#22c55e" stroke-width="1.5" fill="none" />
      <path d="M 38 44 Q 44 42 50 44" stroke="#22c55e" stroke-width="1.5" fill="none" />
      <path d="M 38 46 Q 44 44 50 46" stroke="#22c55e" stroke-width="1.5" fill="none" />
      <path d="M 30 55 Q 50 50 70 55" stroke="#22c55e" stroke-width="3" fill="none" />
      <rect x="40" y="58" width="4" height="6" fill="#8b5cf6" />
      <rect x="47" y="56" width="4" height="8" fill="#8b5cf6" />
      <rect x="54" y="54" width="4" height="10" fill="#8b5cf6" />
      <path d="M 42 66 L 50 58 L 48 56 L 56 48 L 58 50 L 50 58" stroke="#8b5cf6" stroke-width="1.5" fill="none" />
      <line x1="38" y1="70" x2="62" y2="70" stroke="#22c55e" stroke-width="1.5" />
    </svg>
  `)}`;
};

export default Logo;
