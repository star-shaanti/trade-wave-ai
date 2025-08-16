import { useEffect, useMemo, useRef, useState } from "react";
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
import { Satellite, SignalHigh, Zap, TrendingUp, ChevronDown, Home, User, Settings, LogOut, CreditCard, Lock, Trash2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

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

function makeSignal(asset: string, category: Category, timeframe: Timeframe): Signal {
  const type: SignalType = Math.random() > 0.5 ? "BUY" : "SELL";
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
  // UI State
  const [category, setCategory] = useState<Category>("FOREX OTC");
  const [asset, setAsset] = useState<string>(ASSETS["FOREX OTC"][0]);
  const [timeframe, setTimeframe] = useState<Timeframe>("1MIN");
  const [running, setRunning] = useState(false);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [onlineCount, setOnlineCount] = useState(245_014);
  const [signalExpired, setSignalExpired] = useState(false);
  const [signalLocked, setSignalLocked] = useState(false);

  const intervalRef = useRef<number | null>(null);

  // Keep asset list in sync with selected category
  const assetsForCategory = useMemo(() => ASSETS[category], [category]);
  useEffect(() => {
    if (!assetsForCategory.includes(asset)) setAsset(assetsForCategory[0]);
  }, [assetsForCategory, asset]);

  // Online count playful fluctuations
  useEffect(() => {
    const id = window.setInterval(() => {
      setOnlineCount((c) => Math.max(123_456, c + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 7)));
    }, 1500);
    return () => clearInterval(id);
  }, []);

  // Signal stream simulation
  useEffect(() => {
    if (!running) {
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
  }, [running, asset, category, timeframe]);

  const latest = signals[0];

  const [countdown, setCountdown] = useState(60);
  useEffect(() => {
    if (!latest) return;
    setCountdown(60);
    setSignalExpired(false);
    const id = window.setInterval(() => {
      setCountdown(prev => {
        const newCount = prev - 1;
        if (newCount <= 0) {
          window.clearInterval(id);
          setSignalExpired(true);
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
    setRunning(false);
    // Auto unlock after 30 seconds
    setTimeout(() => {
      setSignalLocked(false);
    }, 30000);
  };

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


  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-4 flex items-center justify-between">
          <a href="/" aria-label="Real-Time Trading Signals home" className="flex items-center gap-2">
            <SignalHigh className="text-brand" />
            <span className="font-semibold">Real-time Trading Signals</span>
          </a>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="hero" size="sm" className="flex items-center gap-1">
                  Subscribe
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-background border border-border">
                <DropdownMenuItem className="flex items-center gap-2 hover:bg-muted/50">
                  <Home className="h-4 w-4" />
                  Home Page
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 hover:bg-muted/50">
                  <User className="h-4 w-4" />
                  Profile & Settings
                  <span className="ml-auto text-xs">›</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center gap-2 hover:bg-muted/50">
                  <Settings className="h-4 w-4" />
                  Manage Subscription
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 hover:bg-muted/50">
                  <Lock className="h-4 w-4" />
                  Change Password
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 hover:bg-muted/50 text-orange-500">
                  <CreditCard className="h-4 w-4" />
                  Suspend Account
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 hover:bg-muted/50 text-red-500">
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center gap-2 hover:bg-muted/50">
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

              <Card className="mt-8 p-5 bg-card/60 border-border/60">
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
                    <Button
                      variant="hero"
                      className="w-full"
                      disabled={signalLocked}
                      onClick={() => setRunning((r) => !r)}
                    >
                      <Zap className="mr-1" /> 
                      {signalLocked 
                        ? "Waiting for signal expiry..." 
                        : running ? "Stop" : "Start"} 
                      {!signalLocked && " Signals"}
                    </Button>
                  </div>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  {category === "FOREX OTC" ? "FOREX OTC markets are open 24/7." : "Signals are simulated for educational preview."}
                </div>
              </Card>
            </div>

            <div>
              <div className="relative rounded-lg border border-border bg-card/60 p-6 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none [mask-image:radial-gradient(150px_150px_at_var(--mx,50%)_var(--my,30%),#000_10%,transparent_60%)] bg-[radial-gradient(circle_at_var(--mx,50%)_var(--my,30%),hsl(var(--brand)/0.2),transparent_40%)] transition-[background]" />
                <div
                  className="absolute inset-0"
                  onMouseMove={(e) => {
                    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                    (e.currentTarget as HTMLDivElement).style.setProperty("--mx", `${((e.clientX - rect.left) / rect.width) * 100}%`);
                    (e.currentTarget as HTMLDivElement).style.setProperty("--my", `${((e.clientY - rect.top) / rect.height) * 100}%`);
                  }}
                />
                <div className="relative">
                  {!latest ? (
                    <div className="h-[300px] md:h-[360px] flex flex-col items-center justify-center text-center text-muted-foreground">
                      <Satellite className="mb-2 text-signal-green w-8 h-8" />
                      <div className="font-semibold">No active signals.</div>
                      <div className="text-sm">First select settings, then click on Start Signals.</div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-md border border-signal-green/40 bg-background/40 p-5">
                        <div className="flex items-start justify-between">
                          <div className="text-sm text-muted-foreground font-medium">Active Trading Signal</div>
                          <div className="text-xs text-muted-foreground">
                            Expires in: {`${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, "0")}`}
                          </div>
                        </div>

                        <div className="mt-3 text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Satellite className={`text-signal-green w-6 h-6 ${running ? 'animate-pulse' : ''}`} />
                            <TrendingUp className="text-signal-green" />
                          </div>
                          <div className="text-2xl md:text-3xl font-extrabold tracking-tight text-signal-green">
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
                          <div className="text-sm font-medium">Signal Strength</div>
                          <div className="w-full bg-secondary rounded-full h-2.5 mt-2">
                            <div 
                              className="bg-signal-green h-2.5 rounded-full transition-all duration-300" 
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
                          <div className="text-sm font-medium">Time Remaining</div>
                          <div className="w-full bg-secondary rounded-full h-2.5 mt-2">
                            <div 
                              className="bg-signal-green h-2.5 rounded-full transition-all duration-300" 
                              style={{ width: `${(countdown / 60) * 100}%` }}
                            ></div>
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground text-right">
                            {`${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, "0")}`}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[260px] overflow-auto pr-1">
                        {signals.map((s) => (
                          <div key={s.id} className="rounded-md p-3 border border-border/60 bg-background/40">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">{s.timeframe}</span>
                              <Badge className="bg-signal-green text-[hsl(var(--hero-foreground))]">
                                {s.type}
                              </Badge>
                            </div>
                            <div className="mt-1 font-semibold">{s.asset}</div>
                            <div className="text-xs text-muted-foreground">{s.reason}</div>
                            <div className="text-[10px] text-muted-foreground mt-1">
                              {s.createdAt.toLocaleTimeString()}
                            </div>
                          </div>
                        ))}
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
            <Button variant="hero">Become an Affiliate</Button>
            <Button variant="outline">Learn more</Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t border-border/60">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Need help? Contact our support team:</p>
                <a 
                  href="mailto:realtimetradingsignal@gmail.com" 
                  className="text-sm text-primary hover:underline"
                >
                  realtimetradingsignal@gmail.com
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <div className="space-y-2">
                <button className="text-sm text-muted-foreground hover:text-foreground">
                  Terms & Conditions
                </button>
                <button className="text-sm text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </button>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Real-time Trading Signals</p>
                <p className="text-sm text-muted-foreground">Last Updated: August 14, 2025</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border/60 pt-8">
            <div className="text-sm text-muted-foreground space-y-4">
              <h4 className="font-semibold text-foreground">Terms & Conditions of Use</h4>
              
              <div className="space-y-3">
                <p>
                  Welcome to Real-time Trading Signals! These Terms & Conditions of Use govern the access and use of the website realtimetradingsignals.com and the signal provision subscription services offered by Real-time Trading Signals.
                </p>
                
                <p>
                  By accessing the Site and using our Services, you acknowledge that you have read, understood, and agree to be bound by all of these T&C. If you do not agree with these terms, you must not use the Site or the Services.
                </p>
                
                <div>
                  <h5 className="font-medium text-foreground mb-2">Article 1: Purpose</h5>
                  <p>The purpose of these T&C is to define the terms and conditions under which Users may access the Site and subscribe to the Services.</p>
                </div>
                
                <div>
                  <h5 className="font-medium text-foreground mb-2">Article 2: Account Creation</h5>
                  <p>2.1. Access to the Services requires the creation of a personal account. The User agrees to provide accurate, complete, and up-to-date information.</p>
                  <p>2.2. The User is solely responsible for the confidentiality of their password and for all activities conducted from their account.</p>
                </div>
                
                <div>
                  <h5 className="font-medium text-foreground mb-2">Article 3: Subscriptions</h5>
                  <p>3.1. Subscription: The Services are accessible through one or more paid Subscriptions, as presented on the Site. Payments are managed by our secure payment service provider, Stripe.</p>
                  <p>3.2. Automatic Renewal: Unless canceled by the User before the expiration date, all Subscriptions are automatically renewed for a period identical to the one initially subscribed.</p>
                  <p>3.3. Cancellation: The User may cancel the automatic renewal of their Subscription at any time from their personal account area.</p>
                  <p>3.4. No Refunds: As detailed in Article 4, canceling a Subscription or its early termination does not entitle the User to any refund for the remaining period.</p>
                </div>
                
                <div>
                  <h5 className="font-medium text-foreground mb-2">Article 4: No-Refund Policy</h5>
                  <p>4.1. Finality of Purchase: The User expressly acknowledges and agrees that any payment made for a Subscription is final.</p>
                  <p>4.2. NO REFUNDS: Due to the digital and immediate nature of the Services provided (instant access to signals and content), Real-time Trading Signals does not issue any refunds, either full or partial, under any circumstances.</p>
                  <p>4.3. This includes, but is not limited to, cases of dissatisfaction, non-use of the Service, cancellation during the billing period, or forgetting to cancel the automatic renewal.</p>
                </div>
                
                <div>
                  <h5 className="font-medium text-foreground mb-2">Article 5: User Obligations</h5>
                  <p>The User agrees to: Use the Services for strictly personal and non-commercial purposes. Not share, resell, copy, or distribute the Signals and content of the Site to third parties. Not use any devices or software intended to disrupt the proper functioning of the Site. Comply with all applicable laws and regulations.</p>
                </div>
                
                <div>
                  <h5 className="font-medium text-foreground mb-2">Article 6: IMPORTANT DISCLAIMER AND LIMITATION OF LIABILITY</h5>
                  <p>6.1. Nature of Information: The Signals and content provided on the Site are for purely informational and educational purposes. They do not, under any circumstances, constitute investment advice, financial recommendation, solicitation, or an offer to buy or sell any financial product.</p>
                  <p>6.2. No Guarantee: Real-time Trading Signals does not guarantee the performance, accuracy, or relevance of the Signals in any way. Past performance is not indicative of future results.</p>
                  <p>6.3. Assumption of Risk: The User is solely and exclusively responsible for their investment or trading decisions and for any financial losses that may result. The use of the Signals is at the User's own risk.</p>
                  <p>6.4. Service Availability: We strive to keep the Site accessible 24/7 but cannot guarantee continuous availability.</p>
                </div>
                
                <div>
                  <h5 className="font-medium text-foreground mb-2">Article 7: Intellectual Property</h5>
                  <p>All elements of the Site (logo, texts, software, signals, design) are the exclusive property of Real-time Trading Signals and are protected by copyright and intellectual property law. Any reproduction, even partial, is strictly prohibited.</p>
                </div>
                
                <div>
                  <h5 className="font-medium text-foreground mb-2">Article 8: Personal Data</h5>
                  <p>The collection and processing of Users' personal data are carried out in accordance with our Privacy Policy, accessible on the Site, and in compliance with the General Data Protection Regulation (GDPR).</p>
                </div>
                
                <div>
                  <h5 className="font-medium text-foreground mb-2">Article 9: Modification of T&C</h5>
                  <p>Real-time Trading Signals reserves the right to modify these T&C at any time. Users will be informed of any substantial changes. The applicable version is the one in effect on the Site at the time the Services are used.</p>
                </div>
                
                <div>
                  <h5 className="font-medium text-foreground mb-2">Article 10: Governing Law and Jurisdiction</h5>
                  <p>These T&C are subject to the laws of France. In the event of a dispute, and after an attempt at an amicable resolution, exclusive jurisdiction is granted to the competent courts of Paris.</p>
                </div>
                
                <p className="pt-4 border-t border-border/60">
                  For any questions, please contact us at: <a href="mailto:realtimetradingsignal@gmail.com" className="text-primary hover:underline">realtimetradingsignal@gmail.com</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Signal Expired Modal */}
      <Dialog open={signalExpired} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md bg-background border border-border">
          <DialogHeader className="text-center">
            <DialogTitle className="text-white text-xl font-bold">Signal Expired</DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">
              Click to dismiss
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
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
    </div>
  );
};

export default Index;
