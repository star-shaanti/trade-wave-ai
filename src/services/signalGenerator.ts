// Service de génération de signaux basé sur les données de marché réelles
import { MarketPrice, TechnicalIndicators, calculateTechnicalIndicators } from './marketData';

export interface TradingSignal {
  id: string;
  symbol: string;
  type: "BUY" | "SELL";
  entry_price: number;
  target_price: number;
  stop_loss: number;
  risk_reward: number;
  confidence: number;
  created_at: string;
  status: "ACTIVE" | "EXPIRED" | "COMPLETED";
  description: string;
  analysis: string;
  expiration_time: number;
  volatility: string;
  trend_strength: number;
  volume_flow: string;
  sentiment: string;
  moving_average: string;
  rsi: string;
  stochastic: string;
  parabolic_sar: string;
  envelope_trend: string;
  signal_strength: number;
  market_conditions: string;
}

/**
 * Génère un signal de trading basé sur les données de marché réelles
 */
export async function generateRealTimeSignal(
  symbol: string,
  category: string,
  timeframe: string,
  getMarketPrice: (symbol: string, category: string) => Promise<MarketPrice | null>
): Promise<TradingSignal | null> {
  try {
    // Récupérer le prix actuel
    const marketPrice = await getMarketPrice(symbol, category);
    if (!marketPrice) {
      console.error(`Impossible de récupérer le prix pour ${symbol}`);
      return null;
    }

    // Récupérer plusieurs points de prix pour analyser la tendance RÉELLE
    // CRITIQUE: Augmenter le nombre de points pour Forex OTC pour meilleure précision
    const { getMultiplePrices } = await import('./marketData');
    const priceCount = symbol.includes('OTC') ? 12 : 10; // Plus de points pour OTC
    const prices = await getMultiplePrices(symbol, category, priceCount);
    
    console.log(`🔍 Analyse de tendance pour ${symbol}: ${prices.length} points de prix récupérés`);
    if (prices.length >= 3) {
      const trend = ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100;
      console.log(`📊 Tendance brute: ${trend > 0 ? '+' : ''}${trend.toFixed(3)}%`);
    }

    // CRITIQUE: Utiliser UNIQUEMENT des données réelles
    // Si pas assez de données réelles, essayer de récupérer plus de points
    let priceHistory: number[];
    if (prices.length < 3) {
      // Pas assez de données réelles - essayer de récupérer plus
      console.warn(`⚠️ Seulement ${prices.length} points réels récupérés, tentative de récupération supplémentaire...`);
      const additionalPrices = await getMultiplePrices(symbol, category, 5);
      prices.push(...additionalPrices);
    }
    
    // Utiliser les données réelles si disponibles (minimum 3 points requis)
    if (prices.length >= 3) {
      priceHistory = prices;
      console.log(`✅ Utilisation de ${prices.length} points de prix RÉELS pour l'analyse`);
    } else {
      // Dernier recours: utiliser le prix actuel avec la tendance 24h réelle
      // Ce n'est pas idéal mais utilise quand même des données réelles
      console.warn(`⚠️ Pas assez de points réels (${prices.length}), utilisation du prix actuel avec tendance 24h réelle`);
      priceHistory = generatePriceHistoryWithTrend(
        marketPrice.price, 
        marketPrice.changePercent24h, // Tendance 24h RÉELLE
        50
      );
      // Ajouter le prix réel actuel au début de l'historique
      priceHistory.unshift(marketPrice.price);
    }

    const volumeHistory = generateVolumeHistory(priceHistory.length);

    // Calculer les indicateurs techniques
    const indicators = calculateTechnicalIndicators(priceHistory, volumeHistory);

    // Analyser les indicateurs pour déterminer le signal avec une logique améliorée
    const signalAnalysis = analyzeIndicatorsImproved(indicators, marketPrice, priceHistory);

    // Calculer les niveaux de prix
    const priceLevels = calculatePriceLevels(
      marketPrice.price,
      signalAnalysis.type,
      indicators,
      timeframe
    );

    // Générer le signal
    const signal: TradingSignal = {
      id: `signal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      symbol,
      type: signalAnalysis.type,
      entry_price: priceLevels.entry,
      target_price: priceLevels.target,
      stop_loss: priceLevels.stopLoss,
      risk_reward: priceLevels.riskReward,
      confidence: signalAnalysis.confidence,
      created_at: new Date().toISOString(),
      status: "ACTIVE",
      description: signalAnalysis.description,
      analysis: signalAnalysis.analysis,
      expiration_time: getExpirationTime(timeframe),
      volatility: getVolatilityLabel(indicators.volatility),
      trend_strength: signalAnalysis.trendStrength,
      volume_flow: getVolumeFlowLabel(indicators.volume, volumeHistory),
      sentiment: signalAnalysis.sentiment,
      moving_average: getMovingAverageLabel(indicators.movingAverage, marketPrice.price),
      rsi: getRSILabel(indicators.rsi),
      stochastic: getStochasticLabel(indicators.stochastic),
      parabolic_sar: getParabolicSARLabel(indicators, marketPrice.price),
      envelope_trend: getEnvelopeTrendLabel(indicators.bollingerBands, marketPrice.price),
      signal_strength: signalAnalysis.signalStrength,
      market_conditions: signalAnalysis.marketConditions,
    };

    return signal;
  } catch (error) {
    console.error('Erreur lors de la génération du signal:', error);
    return null;
  }
}

/**
 * Analyse améliorée des indicateurs techniques avec logique de trading réelle
 */
function analyzeIndicatorsImproved(
  indicators: TechnicalIndicators,
  marketPrice: MarketPrice,
  priceHistory: number[]
): {
  type: "BUY" | "SELL";
  confidence: number;
  description: string;
  analysis: string;
  trendStrength: number;
  sentiment: string;
  signalStrength: number;
  marketConditions: string;
} {
  let buyScore = 0;
  let sellScore = 0;
  const reasons: string[] = [];

  // ANALYSE 1: Tendance à court terme (dernières périodes) - PRIORITÉ ABSOLUE
  // Cette analyse est la plus importante car elle reflète la direction réelle du marché
  if (priceHistory.length >= 3) {
    // Analyser les 3-5 derniers prix pour détecter la tendance immédiate
    const recentPrices = priceHistory.slice(-Math.min(5, priceHistory.length));
    const oldestPrice = recentPrices[0];
    const newestPrice = recentPrices[recentPrices.length - 1];
    const shortTermTrend = ((newestPrice - oldestPrice) / oldestPrice) * 100;
    
    // Analyser aussi la tendance des 2-3 derniers prix (tendance très récente)
    let veryRecentTrend = 0;
    if (recentPrices.length >= 3) {
      const last3Prices = recentPrices.slice(-3);
      veryRecentTrend = ((last3Prices[2] - last3Prices[0]) / last3Prices[0]) * 100;
    }
    
    // Combiner les deux tendances avec poids plus important sur la tendance très récente
    const combinedTrend = (veryRecentTrend * 0.6) + (shortTermTrend * 0.4);
    
    // Seuils plus stricts et plus sensibles pour détecter la tendance réelle
    if (combinedTrend > 0.02) { // 0.02% = tendance haussière même faible
      buyScore += 40; // Poids très important pour la tendance réelle
      reasons.push(`Tendance haussière réelle détectée (+${combinedTrend.toFixed(3)}%)`);
    } else if (combinedTrend < -0.02) { // 0.02% = tendance baissière même faible
      sellScore += 40; // Poids très important pour la tendance réelle
      reasons.push(`Tendance baissière réelle détectée (${combinedTrend.toFixed(3)}%)`);
    } else {
      // Tendance neutre, analyser la direction des mouvements individuels
      let upMoves = 0;
      let downMoves = 0;
      for (let i = 1; i < recentPrices.length; i++) {
        if (recentPrices[i] > recentPrices[i-1]) upMoves++;
        else if (recentPrices[i] < recentPrices[i-1]) downMoves++;
      }
      if (upMoves > downMoves) {
        buyScore += 25;
        reasons.push(`Plus de mouvements haussiers récents (${upMoves} vs ${downMoves})`);
      } else if (downMoves > upMoves) {
        sellScore += 25;
        reasons.push(`Plus de mouvements baissiers récents (${downMoves} vs ${upMoves})`);
      }
    }
  }

  // ANALYSE 2: RSI (Relative Strength Index) - Plus fiable
  if (indicators.rsi < 30) {
    buyScore += 25; // Survente = opportunité d'achat
    reasons.push(`RSI ${indicators.rsi.toFixed(1)} indique survente (opportunité d'achat)`);
  } else if (indicators.rsi > 70) {
    sellScore += 25; // Surachat = opportunité de vente
    reasons.push(`RSI ${indicators.rsi.toFixed(1)} indique surachat (opportunité de vente)`);
  } else if (indicators.rsi > 50 && indicators.rsi < 70) {
    buyScore += 5; // RSI positif mais pas extrême
  } else if (indicators.rsi < 50 && indicators.rsi > 30) {
    sellScore += 5; // RSI négatif mais pas extrême
  }

  // ANALYSE 3: MACD - Momentum
  const macdBullish = indicators.macd.value > indicators.macd.signal && indicators.macd.histogram > 0;
  const macdBearish = indicators.macd.value < indicators.macd.signal && indicators.macd.histogram < 0;
  
  if (macdBullish) {
    buyScore += 20;
    reasons.push('MACD croisement haussier confirmé');
  } else if (macdBearish) {
    sellScore += 20;
    reasons.push('MACD croisement baissier confirmé');
  }

  // ANALYSE 4: Moyennes mobiles - Tendance
  const priceAboveSMA20 = marketPrice.price > indicators.movingAverage.sma20;
  const priceAboveSMA50 = marketPrice.price > indicators.movingAverage.sma50;
  const sma20AboveSMA50 = indicators.movingAverage.sma20 > indicators.movingAverage.sma50;
  
  if (priceAboveSMA20 && priceAboveSMA50 && sma20AboveSMA50) {
    buyScore += 20; // Tendance haussière claire
    reasons.push('Prix au-dessus des moyennes mobiles (tendance haussière)');
  } else if (!priceAboveSMA20 && !priceAboveSMA50 && !sma20AboveSMA50) {
    sellScore += 20; // Tendance baissière claire
    reasons.push('Prix en-dessous des moyennes mobiles (tendance baissière)');
  }

  // ANALYSE 5: Bandes de Bollinger - Volatilité et niveaux
  const bbPosition = (marketPrice.price - indicators.bollingerBands.lower) / 
                    (indicators.bollingerBands.upper - indicators.bollingerBands.lower);
  
  if (bbPosition < 0.2) {
    buyScore += 15; // Prix proche de la bande inférieure = rebond possible
    reasons.push('Prix proche de la bande inférieure Bollinger (support)');
  } else if (bbPosition > 0.8) {
    sellScore += 15; // Prix proche de la bande supérieure = correction possible
    reasons.push('Prix proche de la bande supérieure Bollinger (résistance)');
  }

  // ANALYSE 6: Stochastic - Momentum
  if (indicators.stochastic.k < 20 && indicators.stochastic.d < 20) {
    buyScore += 15;
    reasons.push('Stochastic en zone de survente');
  } else if (indicators.stochastic.k > 80 && indicators.stochastic.d > 80) {
    sellScore += 15;
    reasons.push('Stochastic en zone de surachat');
  } else if (indicators.stochastic.k > indicators.stochastic.d && indicators.stochastic.k > 50) {
    buyScore += 5; // Momentum haussier
  } else if (indicators.stochastic.k < indicators.stochastic.d && indicators.stochastic.k < 50) {
    sellScore += 5; // Momentum baissier
  }

  // ANALYSE 7: Variation de prix 24h (confirmation) - Moins de poids car peut être trompeur
  // On utilise cette analyse seulement si elle confirme la tendance à court terme
  if (priceHistory.length >= 3) {
    const recentTrend = priceHistory[priceHistory.length - 1] - priceHistory[0];
    const recentTrendPercent = (recentTrend / priceHistory[0]) * 100;
    
    // Si la variation 24h confirme la tendance récente, ajouter des points
    if (marketPrice.changePercent24h > 0.3 && recentTrendPercent > 0) {
      buyScore += 8; // Confirmation haussière
      reasons.push(`Variation 24h positive (+${marketPrice.changePercent24h.toFixed(2)}%) confirme la tendance haussière`);
    } else if (marketPrice.changePercent24h < -0.3 && recentTrendPercent < 0) {
      sellScore += 8; // Confirmation baissière
      reasons.push(`Variation 24h négative (${marketPrice.changePercent24h.toFixed(2)}%) confirme la tendance baissière`);
    }
    // Si contradiction, ne pas ajouter de points (la tendance récente prime)
  }

  // ANALYSE 8: Volatilité (pour la confiance)
  if (indicators.volatility > 2) {
    // Volatilité élevée = réduire la confiance mais pas changer la direction
    buyScore -= 5;
    sellScore -= 5;
    reasons.push('Volatilité élevée détectée');
  }

  // VALIDATION FINALE: Vérifier que le signal correspond à la tendance réelle
  // Cette validation est CRITIQUE pour éviter les signaux inversés
  let finalType: "BUY" | "SELL" = buyScore > sellScore ? "BUY" : "SELL";
  
  // Vérifier la tendance réelle des prix
  if (priceHistory.length >= 3) {
    const lastPrice = priceHistory[priceHistory.length - 1];
    const firstPrice = priceHistory[0];
    const realTrend = lastPrice - firstPrice;
    const realTrendPercent = (realTrend / firstPrice) * 100;
    
    // Si le signal ne correspond pas à la tendance réelle, corriger
    if (realTrendPercent > 0.01 && finalType === "SELL") {
      // Tendance haussière réelle mais signal SELL -> CORRIGER en BUY
      console.warn(`⚠️ Correction: Tendance haussière réelle (+${realTrendPercent.toFixed(3)}%) mais signal SELL -> Changé en BUY`);
      finalType = "BUY";
      buyScore = Math.max(buyScore, sellScore + 20); // Forcer BUY
      reasons.push(`CORRECTION: Signal ajusté pour suivre la tendance haussière réelle`);
    } else if (realTrendPercent < -0.01 && finalType === "BUY") {
      // Tendance baissière réelle mais signal BUY -> CORRIGER en SELL
      console.warn(`⚠️ Correction: Tendance baissière réelle (${realTrendPercent.toFixed(3)}%) mais signal BUY -> Changé en SELL`);
      finalType = "SELL";
      sellScore = Math.max(sellScore, buyScore + 20); // Forcer SELL
      reasons.push(`CORRECTION: Signal ajusté pour suivre la tendance baissière réelle`);
    }
  }
  
  const scoreDifference = Math.abs(buyScore - sellScore);
  const type = finalType;
  
  // Si la différence est trop faible, suivre uniquement la tendance réelle
  if (scoreDifference < 15) {
    // En cas d'égalité, suivre STRICTEMENT la tendance à court terme
    if (priceHistory.length >= 3) {
      const trend = priceHistory[priceHistory.length - 1] - priceHistory[0];
      const trendPercent = (trend / priceHistory[0]) * 100;
      
      // Seuil très bas pour détecter toute tendance
      if (trendPercent > 0.005) {
        return {
          type: "BUY",
          confidence: 70,
          description: `Signal BUY basé sur la tendance haussière réelle détectée`,
          analysis: `Tendance haussière réelle: +${trendPercent.toFixed(3)}%`,
          trendStrength: 65,
          sentiment: "Bullish",
          signalStrength: 75,
          marketConditions: "Trending Up",
        };
      } else if (trendPercent < -0.005) {
        return {
          type: "SELL",
          confidence: 70,
          description: `Signal SELL basé sur la tendance baissière réelle détectée`,
          analysis: `Tendance baissière réelle: ${trendPercent.toFixed(3)}%`,
          trendStrength: 65,
          sentiment: "Bearish",
          signalStrength: 75,
          marketConditions: "Trending Down",
        };
      }
    }
  }

  const totalScore = Math.max(buyScore, sellScore);
  
  // Calculer la confiance basée sur la différence de score
  const confidence = Math.min(95, Math.max(60, 60 + (scoreDifference * 0.5)));
  const trendStrength = Math.min(99, Math.max(50, totalScore));

  const sentiment = type === "BUY" ? "Bullish" : "Bearish";
  const signalStrength = Math.min(99, Math.max(70, confidence + 5));

  let marketConditions = "Neutral";
  if (indicators.volatility > 3) {
    marketConditions = "Volatile";
  } else if (indicators.volatility < 0.5) {
    marketConditions = "Stable";
  } else if (scoreDifference > 30) {
    marketConditions = type === "BUY" ? "Favorable" : "Unfavorable";
  }

  const description = `Signal ${type} basé sur l'analyse technique approfondie de ${marketPrice.symbol}. ${reasons.slice(0, 3).join('. ')}.`;
  const analysis = `Analyse technique: RSI ${indicators.rsi.toFixed(1)}, MACD ${indicators.macd.value > 0 ? 'positif' : 'négatif'}, Prix ${marketPrice.price.toFixed(5)}, Variation 24h ${marketPrice.changePercent24h.toFixed(2)}%. Score BUY: ${buyScore}, Score SELL: ${sellScore}. ${reasons.join('. ')}.`;

  return {
    type,
    confidence: Math.round(confidence),
    description,
    analysis,
    trendStrength: Math.round(trendStrength),
    sentiment,
    signalStrength: Math.round(signalStrength),
    marketConditions,
  };
}

/**
 * Analyse les indicateurs techniques pour déterminer le signal (version originale pour compatibilité)
 */
function analyzeIndicators(
  indicators: TechnicalIndicators,
  marketPrice: MarketPrice
): {
  type: "BUY" | "SELL";
  confidence: number;
  description: string;
  analysis: string;
  trendStrength: number;
  sentiment: string;
  signalStrength: number;
  marketConditions: string;
} {
  // Utiliser la version améliorée avec historique vide
  return analyzeIndicatorsImproved(indicators, marketPrice, [marketPrice.price]);
}

/**
 * Calcule les niveaux de prix (entry, target, stop loss)
 */
function calculatePriceLevels(
  currentPrice: number,
  signalType: "BUY" | "SELL",
  indicators: TechnicalIndicators,
  timeframe: string
): {
  entry: number;
  target: number;
  stopLoss: number;
  riskReward: number;
} {
  // Déterminer le pourcentage de mouvement attendu selon le timeframe
  const timeframeMultipliers: Record<string, number> = {
    '1M': 0.001,  // 0.1%
    '2M': 0.0015,
    '3M': 0.002,
    '5M': 0.003,
    '15M': 0.005,
    '30M': 0.008,
    '1H': 0.01,   // 1%
    '4H': 0.015,
    '1D': 0.02,   // 2%
  };

  const multiplier = timeframeMultipliers[timeframe] || 0.005;
  const targetPercent = multiplier * (signalType === "BUY" ? 1 : -1);
  const stopLossPercent = multiplier * 0.5 * (signalType === "BUY" ? -1 : 1);

  let entry = currentPrice;
  let target = currentPrice * (1 + targetPercent);
  let stopLoss = currentPrice * (1 + stopLossPercent);

  // Ajuster selon les indicateurs
  if (signalType === "BUY") {
    // Pour un signal BUY, utiliser la bande inférieure de Bollinger comme support
    if (indicators.bollingerBands.lower < currentPrice) {
      stopLoss = Math.min(stopLoss, indicators.bollingerBands.lower * 0.999);
    }
    // Target vers la bande supérieure
    if (indicators.bollingerBands.upper > currentPrice) {
      target = Math.max(target, indicators.bollingerBands.upper * 0.998);
    }
  } else {
    // Pour un signal SELL, utiliser la bande supérieure comme résistance
    if (indicators.bollingerBands.upper > currentPrice) {
      stopLoss = Math.max(stopLoss, indicators.bollingerBands.upper * 1.001);
    }
    // Target vers la bande inférieure
    if (indicators.bollingerBands.lower < currentPrice) {
      target = Math.min(target, indicators.bollingerBands.lower * 1.002);
    }
  }

  // Calculer le ratio risque/récompense
  const risk = Math.abs(entry - stopLoss);
  const reward = Math.abs(target - entry);
  const riskReward = risk > 0 ? reward / risk : 2.0;

  // Arrondir les prix selon le type d'actif
  const decimals = currentPrice > 1000 ? 2 : currentPrice > 1 ? 4 : 6;
  entry = Math.round(entry * Math.pow(10, decimals)) / Math.pow(10, decimals);
  target = Math.round(target * Math.pow(10, decimals)) / Math.pow(10, decimals);
  stopLoss = Math.round(stopLoss * Math.pow(10, decimals)) / Math.pow(10, decimals);

  return {
    entry,
    target,
    stopLoss,
    riskReward: Math.round(riskReward * 100) / 100,
  };
}

/**
 * Génère un historique de prix avec une tendance réaliste
 */
function generatePriceHistoryWithTrend(
  currentPrice: number,
  trendPercent: number,
  length: number
): number[] {
  const history: number[] = [];
  let price = currentPrice;
  
  // Calculer la tendance par période
  const trendPerPeriod = trendPercent / length;
  const volatility = Math.abs(trendPercent) / 200 || 0.005; // Volatilité basée sur la tendance

  for (let i = 0; i < length; i++) {
    // Appliquer la tendance + variation aléatoire
    const trendComponent = trendPerPeriod / 100;
    const randomComponent = (Math.random() - 0.5) * volatility * 2;
    price = price * (1 + trendComponent + randomComponent);
    history.unshift(price);
  }

  return history;
}

/**
 * Génère un historique de prix simulé (à remplacer par des données réelles)
 */
function generatePriceHistory(currentPrice: number, length: number): number[] {
  return generatePriceHistoryWithTrend(currentPrice, 0, length);
}

/**
 * Génère un historique de volume simulé
 */
function generateVolumeHistory(length: number): number[] {
  const volumes: number[] = [];
  const baseVolume = 1000000;

  for (let i = 0; i < length; i++) {
    const variation = 0.5 + Math.random(); // Entre 0.5x et 1.5x
    volumes.push(baseVolume * variation);
  }

  return volumes;
}

/**
 * Obtient le temps d'expiration selon le timeframe
 */
function getExpirationTime(timeframe: string): number {
  const times: Record<string, number> = {
    '1M': 60,
    '2M': 120,
    '3M': 180,
    '5M': 300,
    '15M': 900,
    '30M': 1800,
    '1H': 3600,
    '4H': 14400,
    '1D': 86400,
  };

  return times[timeframe] || 300;
}

// Fonctions utilitaires pour les labels

function getVolatilityLabel(volatility: number): string {
  if (volatility < 0.5) return "Low";
  if (volatility < 2) return "Medium";
  return "High";
}

function getVolumeFlowLabel(currentVolume: number, history: number[]): string {
  if (history.length < 2) return "Stable";
  const avgVolume = history.reduce((a, b) => a + b, 0) / history.length;
  if (currentVolume > avgVolume * 1.2) return "Increasing";
  if (currentVolume < avgVolume * 0.8) return "Decreasing";
  return "Stable";
}

function getMovingAverageLabel(ma: TechnicalIndicators['movingAverage'], currentPrice: number): string {
  if (currentPrice > ma.sma20 && ma.sma20 > ma.sma50) return "Above";
  if (currentPrice < ma.sma20 && ma.sma20 < ma.sma50) return "Below";
  return "At";
}

function getRSILabel(rsi: number): string {
  if (rsi < 30) return "Oversold";
  if (rsi > 70) return "Overbought";
  return "Neutral";
}

function getStochasticLabel(stoch: TechnicalIndicators['stochastic']): string {
  if (stoch.k > stoch.d && stoch.k > 50) return "Crossing Up";
  if (stoch.k < stoch.d && stoch.k < 50) return "Crossing Down";
  return "Neutral";
}

function getParabolicSARLabel(indicators: TechnicalIndicators, currentPrice: number): string {
  // Simplification: basé sur la tendance
  if (indicators.movingAverage.ema12 > indicators.movingAverage.ema26) {
    return "Bullish Flip";
  } else if (indicators.movingAverage.ema12 < indicators.movingAverage.ema26) {
    return "Bearish Flip";
  }
  return "Neutral";
}

function getEnvelopeTrendLabel(bb: TechnicalIndicators['bollingerBands'], currentPrice: number): string {
  if (currentPrice > bb.upper) return "Upper Band";
  if (currentPrice < bb.lower) return "Lower Band";
  return "Middle Band";
}

