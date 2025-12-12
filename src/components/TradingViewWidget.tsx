// Composant pour intégrer TradingView sans API
// Utilise les widgets officiels gratuits de TradingView

import React, { useEffect, useRef } from 'react';

interface TradingViewWidgetProps {
  symbol: string;
  category: 'forex' | 'forex_otc' | 'cryptos' | 'indices';
  height?: number;
  width?: number;
  theme?: 'light' | 'dark';
  interval?: '1' | '3' | '5' | '15' | '30' | '60' | '240' | 'D';
  showVolume?: boolean;
  hideTopToolbar?: boolean;
  hideSideToolbar?: boolean;
}

export const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({
  symbol,
  category,
  height = 400,
  width = '100%',
  theme = 'dark',
  interval = '5',
  showVolume = true,
  hideTopToolbar = false,
  hideSideToolbar = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Nettoyer le contenu précédent
    containerRef.current.innerHTML = '';

    // Convertir le symbole pour TradingView
    const tradingViewSymbol = convertSymbolToTradingView(symbol, category);

    // Créer le script TradingView
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (window.TradingView && containerRef.current) {
        new window.TradingView.widget({
          autosize: true,
          symbol: tradingViewSymbol,
          interval: interval,
          timezone: 'Etc/UTC',
          theme: theme,
          style: '1',
          locale: 'en',
          toolbar_bg: theme === 'dark' ? '#1e1e1e' : '#ffffff',
          enable_publishing: false,
          hide_top_toolbar: hideTopToolbar,
          hide_side_toolbar: hideSideToolbar,
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
          show_volume: showVolume,
        });
      }
    };

    // Créer un conteneur avec ID unique
    const containerId = `tradingview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    containerRef.current.id = containerId;

    document.body.appendChild(script);

    return () => {
      // Nettoyer le script lors du démontage
      const existingScript = document.querySelector(`script[src="${script.src}"]`);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [symbol, category, height, width, theme, interval, showVolume, hideTopToolbar, hideSideToolbar]);

  return (
    <div 
      ref={containerRef} 
      className="tradingview-widget-container"
      style={{ width: '100%', height: height }}
    />
  );
};

// Widget de ticker TradingView (prix en temps réel)
export const TradingViewTicker: React.FC<{
  symbols: string[];
  category: 'forex' | 'forex_otc' | 'cryptos' | 'indices';
  colorTheme?: 'light' | 'dark';
  isTransparent?: boolean;
  locale?: string;
}> = ({ 
  symbols, 
  category, 
  colorTheme = 'dark',
  isTransparent = false,
  locale = 'en'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';

    // Convertir les symboles pour TradingView
    const tradingViewSymbols = symbols.map(s => convertSymbolToTradingView(s, category));

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: tradingViewSymbols.map(s => ({ proName: s, title: s })),
      showSymbolLogo: true,
      colorTheme: colorTheme,
      isTransparent: isTransparent,
      displayMode: 'adaptive',
      locale: locale,
    });

    containerRef.current.appendChild(script);
  }, [symbols, category, colorTheme, isTransparent, locale]);

  return (
    <div 
      ref={containerRef} 
      className="tradingview-widget-container__widget"
      style={{ width: '100%', height: '46px' }}
    />
  );
};

// Widget de mini graphique
export const TradingViewMiniChart: React.FC<{
  symbol: string;
  category: 'forex' | 'forex_otc' | 'cryptos' | 'indices';
  width?: number;
  height?: number;
  colorTheme?: 'light' | 'dark';
  dateRange?: '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | 'ALL';
}> = ({
  symbol,
  category,
  width = 350,
  height = 220,
  colorTheme = 'dark',
  dateRange = '1D',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';

    const tradingViewSymbol = convertSymbolToTradingView(symbol, category);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: tradingViewSymbol,
      width: width,
      height: height,
      locale: 'en',
      dateRange: dateRange,
      colorTheme: colorTheme,
      isTransparent: false,
      autosize: false,
      largeChartUrl: '',
    });

    containerRef.current.appendChild(script);
  }, [symbol, category, width, height, colorTheme, dateRange]);

  return (
    <div 
      ref={containerRef} 
      className="tradingview-widget-container__widget"
      style={{ width: '100%' }}
    />
  );
};

// Fonction pour convertir les symboles vers le format TradingView
function convertSymbolToTradingView(symbol: string, category: string): string {
  // Nettoyer le symbole
  let cleanSymbol = symbol.replace(' OTC', '').replace('/', '').toUpperCase();

  switch (category) {
    case 'cryptos':
      // TradingView utilise le format: EXCHANGE:SYMBOL
      // Pour les cryptos, utiliser BINANCE, COINBASE, etc.
      if (cleanSymbol.includes('BTC')) return 'BINANCE:BTCUSDT';
      if (cleanSymbol.includes('ETH')) return 'BINANCE:ETHUSDT';
      if (cleanSymbol.includes('BNB')) return 'BINANCE:BNBUSDT';
      if (cleanSymbol.includes('SOL')) return 'BINANCE:SOLUSDT';
      if (cleanSymbol.includes('ADA')) return 'BINANCE:ADAUSDT';
      if (cleanSymbol.includes('XRP')) return 'BINANCE:XRPUSDT';
      if (cleanSymbol.includes('DOT')) return 'BINANCE:DOTUSDT';
      if (cleanSymbol.includes('DOGE')) return 'BINANCE:DOGEUSDT';
      if (cleanSymbol.includes('AVAX')) return 'BINANCE:AVAXUSDT';
      if (cleanSymbol.includes('MATIC')) return 'BINANCE:MATICUSDT';
      if (cleanSymbol.includes('LINK')) return 'BINANCE:LINKUSDT';
      if (cleanSymbol.includes('UNI')) return 'BINANCE:UNIUSDT';
      if (cleanSymbol.includes('ATOM')) return 'BINANCE:ATOMUSDT';
      if (cleanSymbol.includes('LTC')) return 'BINANCE:LTCUSDT';
      if (cleanSymbol.includes('BCH')) return 'BINANCE:BCHUSDT';
      if (cleanSymbol.includes('XLM')) return 'BINANCE:XLMUSDT';
      if (cleanSymbol.includes('VET')) return 'BINANCE:VETUSDT';
      if (cleanSymbol.includes('FIL')) return 'BINANCE:FILUSDT';
      if (cleanSymbol.includes('TRX')) return 'BINANCE:TRXUSDT';
      if (cleanSymbol.includes('ETC')) return 'BINANCE:ETCUSDT';
      if (cleanSymbol.includes('ALGO')) return 'BINANCE:ALGOUSDT';
      if (cleanSymbol.includes('ICP')) return 'BINANCE:ICPUSDT';
      if (cleanSymbol.includes('NEAR')) return 'BINANCE:NEARUSDT';
      if (cleanSymbol.includes('FTM')) return 'BINANCE:FTMUSDT';
      if (cleanSymbol.includes('TON')) return 'BINANCE:TONUSDT';
      return `BINANCE:${cleanSymbol}USDT`;

    case 'forex':
    case 'forex_otc':
      // TradingView utilise OANDA pour Forex
      // Format: OANDA:EURUSD
      const forexSymbol = cleanSymbol.replace('USD', 'USD');
      return `OANDA:${forexSymbol}`;

    case 'indices':
      // TradingView utilise différents exchanges pour les indices
      if (cleanSymbol.includes('S&P') || cleanSymbol.includes('SPX')) return 'SP:SPX';
      if (cleanSymbol.includes('NASDAQ')) return 'NASDAQ:NDX';
      if (cleanSymbol.includes('DOW')) return 'DJ:DJI';
      if (cleanSymbol.includes('FTSE')) return 'LSE:UKX';
      if (cleanSymbol.includes('DAX')) return 'XETR:DAX';
      if (cleanSymbol.includes('CAC')) return 'EURONEXT:CAC';
      if (cleanSymbol.includes('NIKKEI')) return 'TSE:NK225';
      if (cleanSymbol.includes('HANG SENG')) return 'HKEX:HSI';
      return cleanSymbol;

    default:
      return cleanSymbol;
  }
}

// Déclaration TypeScript pour window.TradingView
declare global {
  interface Window {
    TradingView: any;
  }
}

