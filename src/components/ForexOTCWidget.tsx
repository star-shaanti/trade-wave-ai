// Composant pour intégrer Forex OTC sans API
// Utilise des widgets/iframes de brokers qui permettent l'intégration

import React, { useEffect, useRef } from 'react';

interface ForexOTCWidgetProps {
  symbol: string;
  height?: number;
  width?: number;
  theme?: 'light' | 'dark';
}

export const ForexOTCWidget: React.FC<ForexOTCWidgetProps> = ({
  symbol,
  height = 400,
  width = '100%',
  theme = 'dark',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';

    // Option 1: Utiliser TradingView pour Forex OTC (gratuit, sans API)
    // TradingView supporte les paires Forex OTC via OANDA
    const cleanSymbol = symbol.replace(' OTC', '').replace('/', '');
    const tradingViewSymbol = `OANDA:${cleanSymbol}`;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (window.TradingView && containerRef.current) {
        new window.TradingView.widget({
          autosize: true,
          symbol: tradingViewSymbol,
          interval: '1',
          timezone: 'Etc/UTC',
          theme: theme,
          style: '1',
          locale: 'en',
          toolbar_bg: theme === 'dark' ? '#1e1e1e' : '#ffffff',
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          container_id: containerRef.current.id,
          height: height,
          width: width,
          studies: [
            'RSI@tv-basicstudies',
            'MACD@tv-basicstudies',
            'Stochastic@tv-basicstudies',
            'BB@tv-basicstudies',
            'Volume@tv-basicstudies',
          ],
          show_volume: true,
        });
      }
    };

    const containerId = `forexotc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    containerRef.current.id = containerId;

    document.body.appendChild(script);

    return () => {
      const existingScript = document.querySelector(`script[src="https://s3.tradingview.com/tv.js"]`);
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, [symbol, height, width, theme]);

  return (
    <div 
      ref={containerRef} 
      className="forex-otc-widget-container"
      style={{ width: '100%', height: height }}
    />
  );
};

// Widget de prix Forex OTC en temps réel (utilise TradingView Mini Chart)
export const ForexOTCTicker: React.FC<{
  symbol: string;
  height?: number;
  width?: number;
  colorTheme?: 'light' | 'dark';
}> = ({
  symbol,
  height = 100,
  width = '100%',
  colorTheme = 'dark',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';

    const cleanSymbol = symbol.replace(' OTC', '').replace('/', '');
    const tradingViewSymbol = `OANDA:${cleanSymbol}`;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: tradingViewSymbol,
      width: width === '100%' ? 350 : parseInt(width.toString()),
      height: height,
      locale: 'en',
      dateRange: '1D',
      colorTheme: colorTheme,
      isTransparent: false,
      autosize: width === '100%',
      largeChartUrl: '',
    });

    containerRef.current.appendChild(script);
  }, [symbol, height, width, colorTheme]);

  return (
    <div 
      ref={containerRef} 
      className="forex-otc-ticker-container"
      style={{ width: '100%' }}
    />
  );
};

// Widget de liste de prix Forex OTC
export const ForexOTCPriceList: React.FC<{
  symbols: string[];
  colorTheme?: 'light' | 'dark';
}> = ({ symbols, colorTheme = 'dark' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';

    // Utiliser TradingView Ticker Tape pour afficher plusieurs paires
    const tradingViewSymbols = symbols.map(s => {
      const clean = s.replace(' OTC', '').replace('/', '');
      return { proName: `OANDA:${clean}`, title: s };
    });

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: tradingViewSymbols,
      showSymbolLogo: true,
      colorTheme: colorTheme,
      isTransparent: false,
      displayMode: 'adaptive',
      locale: 'en',
    });

    containerRef.current.appendChild(script);
  }, [symbols, colorTheme]);

  return (
    <div 
      ref={containerRef} 
      className="forex-otc-price-list-container"
      style={{ width: '100%', height: '46px' }}
    />
  );
};

// Alternative: Widget iframe pour un broker Forex OTC
// Note: Certains brokers permettent l'intégration via iframe
// Exemple avec un widget générique (à adapter selon le broker)
export const ForexOTCBrokerWidget: React.FC<{
  brokerUrl?: string;
  symbol: string;
  height?: number;
  width?: number;
}> = ({
  brokerUrl,
  symbol,
  height = 400,
  width = '100%',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !brokerUrl) return;

    containerRef.current.innerHTML = '';

    // Créer un iframe pour le widget du broker
    // IMPORTANT: Vérifier les conditions d'utilisation du broker avant d'utiliser
    const iframe = document.createElement('iframe');
    iframe.src = brokerUrl;
    iframe.width = width === '100%' ? '100%' : width.toString();
    iframe.height = height.toString();
    iframe.frameBorder = '0';
    iframe.scrolling = 'no';
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.title = `Forex OTC Widget for ${symbol}`;
    iframe.allow = 'clipboard-read; clipboard-write';
    
    containerRef.current.appendChild(iframe);
  }, [brokerUrl, symbol, height, width]);

  if (!brokerUrl) {
    // Fallback vers TradingView si pas de broker URL
    return <ForexOTCWidget symbol={symbol} height={height} width={width} />;
  }

  return (
    <div 
      ref={containerRef} 
      className="forex-otc-broker-widget-container"
      style={{ width: '100%', height: height }}
    />
  );
};

// Déclaration TypeScript pour window.TradingView
declare global {
  interface Window {
    TradingView: any;
  }
}

