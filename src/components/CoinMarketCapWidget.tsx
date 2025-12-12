// Composant pour intégrer CoinMarketCap sans API
// Utilise les widgets officiels de CoinMarketCap

import React, { useEffect, useRef } from 'react';

interface CoinMarketCapWidgetProps {
  symbol: string;
  height?: number;
  width?: number;
  theme?: 'light' | 'dark';
}

export const CoinMarketCapWidget: React.FC<CoinMarketCapWidgetProps> = ({
  symbol,
  height = 300,
  width = 100,
  theme = 'dark',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Mapping des symboles vers les slugs CoinMarketCap
    const symbolMap: Record<string, string> = {
      'BTC/USD': 'bitcoin',
      'ETH/USD': 'ethereum',
      'BNB/USD': 'binancecoin',
      'SOL/USD': 'solana',
      'ADA/USD': 'cardano',
      'XRP/USD': 'ripple',
      'DOT/USD': 'polkadot',
      'DOGE/USD': 'dogecoin',
      'AVAX/USD': 'avalanche-2',
      'MATIC/USD': 'matic-network',
      'LINK/USD': 'chainlink',
      'UNI/USD': 'uniswap',
      'ATOM/USD': 'cosmos',
      'LTC/USD': 'litecoin',
      'BCH/USD': 'bitcoin-cash',
      'XLM/USD': 'stellar',
      'VET/USD': 'vechain',
      'FIL/USD': 'filecoin',
      'TRX/USD': 'tron',
      'ETC/USD': 'ethereum-classic',
      'ALGO/USD': 'algorand',
      'ICP/USD': 'internet-computer',
      'NEAR/USD': 'near',
      'FTM/USD': 'fantom',
      'TON/USD': 'the-open-network',
    };

    const coinSlug = symbolMap[symbol.replace('/USD', '')] || symbol.toLowerCase().replace('/usd', '');
    
    if (!containerRef.current) return;

    // Nettoyer le contenu précédent
    containerRef.current.innerHTML = '';

    // Utiliser le widget CoinMarketCap officiel (sans API)
    // CoinMarketCap fournit des widgets gratuits via script
    const script = document.createElement('script');
    script.src = 'https://files.coinmarketcap.com/static/widget/currency.js';
    script.async = true;
    
    // Créer le conteneur du widget
    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'coinmarketcap-currency-widget';
    
    // Mapping des IDs CoinMarketCap pour les principales cryptos
    const coinIdMap: Record<string, string> = {
      'BTC/USD': '1',
      'ETH/USD': '2',
      'BNB/USD': '1839',
      'SOL/USD': '5426',
      'ADA/USD': '2010',
      'XRP/USD': '52',
      'DOT/USD': '6636',
      'DOGE/USD': '5',
      'AVAX/USD': '5805',
      'MATIC/USD': '3890',
      'LINK/USD': '1975',
      'UNI/USD': '7083',
      'ATOM/USD': '3794',
      'LTC/USD': '2',
      'BCH/USD': '1831',
      'XLM/USD': '512',
      'VET/USD': '3077',
      'FIL/USD': '2280',
      'TRX/USD': '1958',
      'ETC/USD': '1321',
      'ALGO/USD': '4030',
      'ICP/USD': '8916',
      'NEAR/USD': '6535',
      'FTM/USD': '3513',
      'TON/USD': '11419',
    };
    
    const coinId = coinIdMap[symbol] || '1'; // BTC par défaut
    
    widgetDiv.setAttribute('data-currencyid', coinId);
    widgetDiv.setAttribute('data-base', 'USD');
    widgetDiv.setAttribute('data-secondary', '');
    widgetDiv.setAttribute('data-ticker', 'true');
    widgetDiv.setAttribute('data-rank', 'true');
    widgetDiv.setAttribute('data-marketcap', 'true');
    widgetDiv.setAttribute('data-volume', 'true');
    widgetDiv.setAttribute('data-statsticker', 'true');
    widgetDiv.setAttribute('data-stats', 'USD');
    widgetDiv.style.width = '100%';
    widgetDiv.style.height = `${height}px`;
    
    containerRef.current.appendChild(widgetDiv);
    containerRef.current.appendChild(script);
  }, [symbol, height]);

  return (
    <div 
      ref={containerRef} 
      className="coinmarketcap-widget"
      style={{ width: '100%', minHeight: height }}
    />
  );
};

// Widget pour afficher plusieurs cryptos en liste
export const CoinMarketCapListWidget: React.FC<{
  limit?: number;
  height?: number;
}> = ({ limit = 10, height = 400 }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';

    // Widget de liste CoinMarketCap
    const script = document.createElement('script');
    script.src = 'https://files.coinmarketcap.com/static/widget/currency.js';
    script.async = true;
    
    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'coinmarketcap-currency-widget';
    widgetDiv.setAttribute('data-currencyid', '1,2,52,2010,1027,1839'); // BTC, ETH, XRP, ADA, ETH, BNB
    widgetDiv.setAttribute('data-base', 'USD');
    widgetDiv.setAttribute('data-secondary', '');
    widgetDiv.setAttribute('data-ticker', 'true');
    widgetDiv.setAttribute('data-rank', 'true');
    widgetDiv.setAttribute('data-marketcap', 'true');
    widgetDiv.setAttribute('data-volume', 'true');
    widgetDiv.setAttribute('data-statsticker', 'true');
    widgetDiv.setAttribute('data-stats', 'USD');
    widgetDiv.style.height = `${height}px`;
    
    containerRef.current.appendChild(widgetDiv);
    containerRef.current.appendChild(script);
  }, [limit, height]);

  return (
    <div 
      ref={containerRef} 
      className="coinmarketcap-list-widget"
      style={{ width: '100%', minHeight: height }}
    />
  );
};

// Widget de conversion de prix
export const CoinMarketCapConverterWidget: React.FC<{
  from?: string;
  to?: string;
}> = ({ from = 'BTC', to = 'USD' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://files.coinmarketcap.com/static/widget/currency.js';
    script.async = true;
    
    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'coinmarketcap-currency-widget';
    widgetDiv.setAttribute('data-currencyid', from);
    widgetDiv.setAttribute('data-base', to);
    widgetDiv.setAttribute('data-secondary', '');
    widgetDiv.setAttribute('data-ticker', 'true');
    widgetDiv.setAttribute('data-rank', 'false');
    widgetDiv.setAttribute('data-marketcap', 'false');
    widgetDiv.setAttribute('data-volume', 'false');
    widgetDiv.setAttribute('data-statsticker', 'true');
    widgetDiv.setAttribute('data-stats', to);
    
    containerRef.current.appendChild(widgetDiv);
    containerRef.current.appendChild(script);
  }, [from, to]);

  return (
    <div 
      ref={containerRef} 
      className="coinmarketcap-converter-widget"
      style={{ width: '100%', minHeight: 200 }}
    />
  );
};

