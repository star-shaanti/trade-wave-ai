import { useEffect, useMemo, useRef, useState } from "react";
import siteLogo from "@/assets/site-logo.png";
import crownIcon from "@/assets/crown-icon.png";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SignalHigh, Zap, TrendingUp, TrendingDown, ChevronDown, Home, User, Settings, LogOut, CreditCard, Lock, Trash2, Key } from "lucide-react";
import { SatelliteIcon } from "@/components/ui/satellite-icon";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

type Category = "FOREX" | "FOREX OTC" | "INDICE" | "CRYPTOS";

const TIMEFRAMES = [
  "1MIN",
  "2MIN",
  "3MIN",
  "5MIN",
  "15MIN",
  "30MIN",
  "1H",
  "4H",
  "Daily",
] as const;

type Timeframe = (typeof TIMEFRAMES)[number];

type SignalType = "BUY" | "SELL";

type Signal = {
  id: string;
  asset: string;
  category: Category;
  timeframe: Timeframe;
  type: SignalType;
  reason: string;
  createdAt: Date;
};

const ASSETS: Record<Category, string[]> = {
  "FOREX": ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CAD"],
  "FOREX OTC": ["AUD/JPY OTC", "EUR/AUD OTC", "EUR/CAD OTC", "EUR/JPY OTC", "GBP/JPY OTC"],
  "INDICE": ["S&P 500", "NASDAQ 100", "DAX 40", "FTSE 100"],
  "CRYPTOS": ["BTC/USDT", "ETH/USDT", "SOL/USDT", "XRP/USDT"],
};

function simulateReason(type: SignalType) {
  const base =
    type === "BUY"
      ? [
          "RSI near oversold, bullish MACD divergence",
          "Price retesting support with rising volume",
          "Higher lows forming; momentum building",
        ]
      : [
          "RSI overbought with MACD selling pressure",
          "Lower highs + break below minor support",
          "Trend exhaustion; supply overwhelming demand",
        ];
  return base[Math.floor(Math.random() * base.length)];
}

function getMarketStatusMessage(category: Category): string {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const currentHour = now.getHours();
  
  switch (category) {
    case "FOREX OTC":
    case "CRYPTOS":
      return `${category} markets are open 24/7.`;
    
    case "FOREX":
      // FOREX is closed on weekends (Saturday and Sunday)
      if (currentDay === 0 || currentDay === 6) {
        return "FOREX markets are closed for the weekend.";
      }
      return "FOREX markets are open.";
    
    case "INDICE":
      // Simplified schedule - indices generally open during business hours
      if (currentDay === 0 || currentDay === 6) {
        return "Index markets are closed for the weekend.";
      }
      if (currentHour < 9 || currentHour >= 17) {
        return "Index markets are closed outside trading hours.";
      }
      return "Index markets are open.";
    
    default:
      return "Market status unknown.";
  }
}

function isMarketClosed(category: Category): boolean {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
  const currentHour = now.getHours();
  
  switch (category) {
    case "FOREX OTC":
    case "CRYPTOS":
      return false; // Always open
    
    case "FOREX":
      return currentDay === 0 || currentDay === 6; // Closed on weekends
    
    case "INDICE":
      return currentDay === 0 || currentDay === 6 || currentHour < 9 || currentHour >= 17;
    
    default:
      return false;
  }
}

function makeSignal(asset: string, category: Category, timeframe: Timeframe): Signal {
  // Generate more varied BUY/SELL signals with slight bias towards more trading activity
  const randomValue = Math.random();
  const type: SignalType = randomValue < 0.48 ? "BUY" : randomValue < 0.96 ? "SELL" : (randomValue < 0.98 ? "BUY" : "SELL");
  
  return {
    id: crypto.randomUUID(),
    asset,
    category,
    timeframe,
    type,
    reason: simulateReason(type),
    createdAt: new Date(),
  };
}

const Index = () => {
  // Authentication
  const { user, isAuthenticated, signOut, loading } = useAuth();
  const { toast } = useToast();
  
  // UI State
  const [category, setCategory] = useState<Category>("FOREX OTC");
  const [asset, setAsset] = useState<string>(ASSETS["FOREX OTC"][0]);
  const [timeframe, setTimeframe] = useState<Timeframe>("1MIN");
  const [running, setRunning] = useState(false);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [onlineCount, setOnlineCount] = useState(() => {
    // Generate random initial count between 368,568 and 798,326
    const min = 368_568;
    const max = 798_326;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  });
  const [signalExpired, setSignalExpired] = useState(false);
  const [signalLocked, setSignalLocked] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const intervalRef = useRef<number | null>(null);

  // Keep asset list in sync with selected category
  const assetsForCategory = useMemo(() => ASSETS[category], [category]);
  useEffect(() => {
    if (!assetsForCategory.includes(asset)) setAsset(assetsForCategory[0]);
  }, [assetsForCategory, asset]);

  // Online count progressive fluctuations between 368,568 and 798,326
  useEffect(() => {
    const id = window.setInterval(() => {
      setOnlineCount((current) => {
        const minCount = 368_568;
        const maxCount = 798_326;
        const maxChange = 70;
        
        // Generate random change between -70 and +70
        const change = Math.floor(Math.random() * (maxChange * 2 + 1)) - maxChange;
        const newCount = current + change;
        
        // Keep within bounds
        return Math.max(minCount, Math.min(maxCount, newCount));
      });
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // Signal stream simulation
  useEffect(() => {
    // Only run signals if authenticated and running and not expired
    if (!running || !isAuthenticated || signalExpired) {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }
    // Push first signal immediately for responsiveness
    setSignals((prev) => [makeSignal(asset, category, timeframe), ...prev].slice(0, 12));
    intervalRef.current = window.setInterval(() => {
      setSignals((prev) => [makeSignal(asset, category, timeframe), ...prev].slice(0, 12));
    }, 60000) as unknown as number; // Changed to 1 minute for proper countdown
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [running, asset, category, timeframe, isAuthenticated, signalExpired]);

  const latest = signals[0];

  const [countdown, setCountdown] = useState(60);
  useEffect(() => {
    if (!latest || signalExpired) return;
    setCountdown(60);
    const id = window.setInterval(() => {
      setCountdown(prev => {
        const newCount = prev - 1;
        if (newCount <= 0) {
          window.clearInterval(id);
          setSignalExpired(true);
          setRunning(false); // Stop signals when expired
          return 0;
        }
        return newCount;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [latest?.id]);

  const handleSignalExpiredDismiss = () => {
    setSignalExpired(false);
    setSignalLocked(true);
    setSignals([]); // Clear all signals
    // Auto unlock after 30 seconds
    setTimeout(() => {
      setSignalLocked(false);
    }, 30000);
  };

  const isMarketClosedForCategory = isMarketClosed(category);

  const latestMeta = useMemo(() => {
    if (!latest) return null;
    const strength = Math.floor(65 + Math.random() * 30);
    const trendStrength = Math.floor(50 + Math.random() * 40);
    const volatility = ["Low", "Medium", "High"][Math.floor(Math.random() * 3)];
    const volumeFlow = Math.random() > 0.5 ? "Increasing" : "Decreasing";
    const sentiment = latest.type === "BUY" ? "Bullish" : "Bearish";
    const movingAverage = Math.random() > 0.5 ? "Above" : "Below";
    const rsi = latest.type === "BUY" ? "Oversold" : "Overbought";
    const stochastic = latest.type === "BUY" ? "Crossing Up" : "Crossing Down";
    const psar = latest.type === "BUY" ? "Bullish Flip" : "Bearish Flip";
    const envelope = Math.random() > 0.5 ? "Upper Band" : "Lower Band";
    return { strength, trendStrength, volatility, volumeFlow, sentiment, movingAverage, rsi, stochastic, psar, envelope } as const;
  }, [latest?.id, latest?.type]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <SignalHigh className="h-12 w-12 text-brand mx-auto mb-4 animate-pulse" />
          <div className="font-semibold">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-4 flex items-center justify-between">
          <a href="/" aria-label="Real-Time Trading Signals home" className="flex items-center gap-2">
            <img src={siteLogo} alt="Real-Time Trading Signals" className="h-8 w-8" />
            <span className="font-semibold">Real-time Trading Signals</span>
          </a>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
              <img src={crownIcon} alt="Premium" className="h-6 w-6" />
              <span>Premium</span>
            </div>
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-background border border-border">
                <DropdownMenuItem 
                  className="flex items-center gap-2 hover:bg-muted/50 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    // Already on home page, no action needed
                  }}
                >
                  <Home className="h-4 w-4" />
                  Home Page
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="flex items-center gap-2 hover:bg-muted/50 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    toast({
                      title: "Profile & Settings",
                      description: "Feature coming soon!",
                    });
                  }}
                >
                  <User className="h-4 w-4" />
                  Profile & Settings
                  <span className="ml-auto text-xs">›</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="flex items-center gap-2 hover:bg-muted/50 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    toast({
                      title: "Manage Subscription",
                      description: "Feature coming soon!",
                    });
                  }}
                >
                  <Settings className="h-4 w-4" />
                  Manage Subscription
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="flex items-center gap-2 hover:bg-muted/50 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    toast({
                      title: "Change Password",
                      description: "Feature coming soon!",
                    });
                  }}
                >
                  <Lock className="h-4 w-4" />
                  Change Password
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="flex items-center gap-2 hover:bg-muted/50 text-orange-500 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    toast({
                      title: "Suspend Account",
                      description: "Feature coming soon!",
                    });
                  }}
                >
                  <CreditCard className="h-4 w-4" />
                  Suspend Account
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="flex items-center gap-2 hover:bg-muted/50 text-red-500 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    toast({
                      title: "Delete Account",
                      description: "Feature coming soon!",
                    });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="flex items-center gap-2 hover:bg-muted/50 cursor-pointer"
                  onClick={async (e) => {
                    e.preventDefault();
                    await signOut();
                    setRunning(false);
                    setSignals([]);
                    toast({
                      title: "Déconnecté",
                      description: "Vous avez été déconnecté avec succès.",
                    });
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main>
        <section className="container py-12 md:py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
              AI-powered Real-Time Trading Signals
            </h1>
            <p className="mt-3 text-muted-foreground text-lg max-w-2xl mx-auto">
              Harness simulated institutional-grade strategies to get instant BUY/SELL alerts across Forex, Indices, and Crypto markets.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div>
              <div className="text-center mb-6">
                <Badge variant="secondary" className="bg-secondary/60">
                  <span className="inline-flex h-2 w-2 rounded-full bg-signal-green mr-2" aria-hidden />
                  {onlineCount.toLocaleString()} active traders online
                </Badge>
              </div>

              <Card className="mt-8 p-5 bg-card/60 border-2 border-signal-green">
                <div className="text-sm uppercase tracking-wide text-muted-foreground font-semibold mb-3">
                  Trading Bot Settings
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Category</div>
                    <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {(Object.keys(ASSETS) as Category[]).map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Asset</div>
                    <Select value={asset} onValueChange={setAsset}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Select asset" /></SelectTrigger>
                      <SelectContent>
                        {assetsForCategory.map((a) => (
                          <SelectItem key={a} value={a}>{a}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Timeframe</div>
                    <Select value={timeframe} onValueChange={(v) => setTimeframe(v as Timeframe)}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Select timeframe" /></SelectTrigger>
                      <SelectContent>
                        {TIMEFRAMES.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    {!isAuthenticated ? (
                      <Button
                        className="w-full bg-[#4F75FF] hover:bg-[#3D5ECC] text-white"
                        onClick={() => setShowAuthModal(true)}
                      >
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Log In to Get Signals
                      </Button>
                    ) : (
                      <Button
                        variant="hero"
                        className="w-full"
                        disabled={signalLocked || isMarketClosedForCategory}
                        onClick={() => setRunning((r) => !r)}
                      >
                        <Zap className="mr-1" /> 
                        {signalLocked 
                          ? "Waiting for signal expiry..." 
                          : isMarketClosedForCategory
                          ? "Market Closed"
                          : running ? "Stop" : "Start"} 
                        {!signalLocked && !isMarketClosedForCategory && " Signals"}
                      </Button>
                    )}
                  </div>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  {getMarketStatusMessage(category)}
                </div>
              </Card>
            </div>

            <div>
              <div className={`relative rounded-lg border-2 ${latest?.type === 'SELL' ? 'border-signal-red' : 'border-signal-green'} bg-card/60 p-6 overflow-hidden`}>
                <div className="relative">
                  {!isAuthenticated || !latest ? (
                    <div className="h-[300px] md:h-[360px] flex flex-col items-center justify-center text-center text-muted-foreground">
                      <SatelliteIcon className="mb-2 text-signal-green w-8 h-8" />
                      <div className="font-semibold">No active signals.</div>
                      <div className="text-sm">First select settings, then click on Start Signals, and you will see the active signal here.</div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className={`rounded-md border ${latest.type === 'SELL' ? 'border-signal-red/40' : 'border-signal-green/40'} bg-background/40 p-5`}>
                        <div className="flex items-start justify-between">
                          <div className="text-sm text-muted-foreground font-medium">Active Trading Signal</div>
                          <div className="text-xs text-muted-foreground">
                            Expires in: {`${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, "0")}`}
                          </div>
                        </div>

                        <div className="mt-3 text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <SatelliteIcon className={`${latest.type === 'SELL' ? 'text-signal-red' : 'text-signal-green'} w-6 h-6 ${running ? 'animate-pulse' : ''}`} />
                            {latest.type === 'SELL' ? 
                              <TrendingDown className="text-signal-red" /> : 
                              <TrendingUp className="text-signal-green" />
                            }
                          </div>
                          <div className={`text-2xl md:text-3xl font-extrabold tracking-tight ${latest.type === 'SELL' ? 'text-signal-red' : 'text-signal-green'}`}>
                            TRY {latest.type} SIGNAL!
                          </div>
                          <div className="text-base md:text-lg font-semibold">{latest.asset}</div>
                          <div className="text-sm text-muted-foreground mt-1">{latest.reason}</div>
                        </div>

                        <div className="my-4 h-px bg-border/60" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2">Market Info</div>
                            <div className="grid grid-cols-2 text-sm gap-y-1">
                              <div className="text-muted-foreground">Volatility</div>
                              <div className="text-right font-medium">{latestMeta?.volatility}</div>
                              <div className="text-muted-foreground">Trend Strength %</div>
                              <div className="text-right font-medium">{latestMeta?.trendStrength}%</div>
                              <div className="text-muted-foreground">Volume Flow</div>
                              <div className="text-right font-medium">{latestMeta?.volumeFlow}</div>
                              <div className="text-muted-foreground">Sentiment</div>
                              <div className="text-right font-medium">{latestMeta?.sentiment}</div>
                            </div>
                          </div>
                          <div>
                            <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2">Technical Overview</div>
                            <div className="grid grid-cols-2 text-sm gap-y-1">
                              <div className="text-muted-foreground">Moving Average</div>
                              <div className="text-right font-medium">{latestMeta?.movingAverage}</div>
                              <div className="text-muted-foreground">RSI</div>
                              <div className="text-right font-medium">{latestMeta?.rsi}</div>
                              <div className="text-muted-foreground">Stochastic</div>
                              <div className="text-right font-medium">{latestMeta?.stochastic}</div>
                              <div className="text-muted-foreground">Parabolic SAR</div>
                              <div className="text-right font-medium">{latestMeta?.psar}</div>
                              <div className="text-muted-foreground">Envelope Trend</div>
                              <div className="text-right font-medium">{latestMeta?.envelope}</div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5">
                          <div className={`text-sm font-medium ${latest.type === 'SELL' ? 'text-signal-red' : ''}`}>Signal Strength</div>
                          <div className="w-full bg-secondary rounded-full h-2.5 mt-2">
                            <div 
                              className={`${latest.type === 'SELL' ? 'bg-signal-red' : 'bg-signal-green'} h-2.5 rounded-full transition-all duration-300`}
                              style={{ width: `${latestMeta?.strength ?? 80}%` }}
                            ></div>
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground flex items-center justify-between">
                            <span>
                              Strength: {((latestMeta?.strength ?? 80) >= 80 ? "Strong" : "Moderate")} ({latestMeta?.strength ?? 80}%)
                            </span>
                            <span>Market Conditions: {latest.type === "BUY" ? "Favorable" : "Unfavorable"}</span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className={`text-sm font-medium ${latest.type === 'SELL' ? 'text-signal-red' : ''}`}>Time Remaining</div>
                          <div className="w-full bg-secondary rounded-full h-2.5 mt-2">
                            <div 
                              className={`${latest.type === 'SELL' ? 'bg-signal-red' : 'bg-signal-green'} h-2.5 rounded-full transition-all duration-300`}
                              style={{ width: `${(countdown / 60) * 100}%` }}
                            ></div>
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground text-right">
                            {`${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, "0")}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-muted/20 border-t border-b border-border/60">
          <div className="container py-12 text-center">
            <div className="text-2xl font-bold">🎉 Celebrating 1,000,000 Traders!</div>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
              We're thrilled to have reached a community of over 1,000,000 registered users. Thank you for being a part of our journey.
            </p>
          </div>
        </section>

        <section className="container py-12 text-center">
          <h2 className="text-3xl font-bold">Partner with Us & Earn!</h2>
          <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
            Join our affiliate program and earn a generous 30% commission for every new subscriber you refer.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <a href="mailto:realtimetradingsignal@gmail.com">
              <Button variant="hero">Become an Affiliate</Button>
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t border-border/60">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link 
                to="/terms-conditions"
                className="hover:text-foreground transition-colors"
              >
                Terms & Conditions
              </Link>
              <Link 
                to="/privacy-policy"
                className="hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <a 
                href="mailto:realtimetradingsignal@gmail.com" 
                className="hover:text-foreground transition-colors"
              >
                Customer Service
              </a>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 Real-time Trading Signals. Tous droits réservés.
            </div>
          </div>
        </div>
      </footer>

      {/* Signal Expired Dialog */}
      <Dialog open={signalExpired} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur border border-border/50">
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Signal Expired</h2>
            <p className="text-muted-foreground mb-6">Click to dismiss</p>
            <Button 
              onClick={handleSignalExpiredDismiss}
              variant="outline"
              className="bg-transparent border-border hover:bg-muted/50"
            >
              Dismiss
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          toast({
            title: "Welcome!",
            description: "You are now logged in and can access trading signals.",
          });
        }}
      />
    </div>
  );
};

export default Index;
