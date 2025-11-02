import React, { useEffect } from 'react';

interface AdSenseProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  adStyle?: React.CSSProperties;
  className?: string;
  responsive?: boolean;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export const AdSense: React.FC<AdSenseProps> = ({
  adSlot,
  adFormat = 'auto',
  adStyle = { display: 'block' },
  className = '',
  responsive = true
}) => {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la publicité AdSense:', error);
    }
  }, []);

  return (
    <div className={`adsense-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={adStyle}
        data-ad-client="ca-pub-5343389597650456"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
};

// Composants spécialisés pour différents emplacements
export const HeaderAd: React.FC = () => (
  <div className="w-full max-w-4xl mx-auto my-4">
    <AdSense
      adSlot="1234567890"
      adFormat="horizontal"
      className="w-full"
      adStyle={{ display: 'block', width: '100%', height: '90px' }}
    />
  </div>
);

export const FooterAd: React.FC = () => (
  <div className="w-full max-w-4xl mx-auto my-4">
    <AdSense
      adSlot="1234567891"
      adFormat="horizontal"
      className="w-full"
      adStyle={{ display: 'block', width: '100%', height: '90px' }}
    />
  </div>
);

// Composants séparés pour gauche et droite
export const SidebarAdLeft: React.FC = () => {
  const adSlot = import.meta.env.VITE_ADSENSE_SLOT_LEFT || "1234567892";
  return (
    <div className="w-full max-w-[300px] mx-auto my-4">
      <AdSense
        adSlot={adSlot}
        adFormat="vertical"
        className="w-full"
        adStyle={{ display: 'block', width: '300px', height: '600px' }}
      />
    </div>
  );
};

export const SidebarAdRight: React.FC = () => {
  const adSlot = import.meta.env.VITE_ADSENSE_SLOT_RIGHT || "1234567893";
  return (
    <div className="w-full max-w-[300px] mx-auto my-4">
      <AdSense
        adSlot={adSlot}
        adFormat="vertical"
        className="w-full"
        adStyle={{ display: 'block', width: '300px', height: '600px' }}
      />
    </div>
  );
};

// Compatibilité : garder SidebarAd pour l'ancien code (utilise le slot gauche par défaut)
export const SidebarAd: React.FC = () => <SidebarAdLeft />;

export const MobileAd: React.FC = () => (
  <div className="w-full max-w-4xl mx-auto my-4">
    <AdSense
      adSlot="1234567893"
      adFormat="auto"
      className="w-full"
      adStyle={{ display: 'block', width: '100%', minHeight: '250px' }}
    />
  </div>
);
