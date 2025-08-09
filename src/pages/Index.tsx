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
import { Rocket, SignalHigh, Zap } from "lucide-react";

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
    }, 6000) as unknown as number;
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [running, asset, category, timeframe]);

  const latest = signals[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-4 flex items-center justify-between">
          <a href="/" aria-label="Real-Time Trading Signals home" className="flex items-center gap-2">
            <SignalHigh className="text-brand" />
            <span className="font-semibold">Real-time Trading Signals</span>
          </a>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-secondary/60">
              <span className="inline-flex h-2 w-2 rounded-full bg-brand mr-2" aria-hidden />
              {onlineCount.toLocaleString()} active traders online
            </Badge>
            <Button variant="hero" size="sm">
              Subscribe
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="container py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
                AI-powered Real-Time Trading Signals
              </h1>
              <p className="mt-3 text-muted-foreground text-lg max-w-xl">
                Harness simulated institutional-grade strategies to get instant BUY/SELL alerts across Forex, Indices, and Crypto markets.
              </p>

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
                      onClick={() => setRunning((r) => !r)}
                    >
                      <Zap className="mr-1" /> {running ? "Stop" : "Start"} Signals
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
                      <Rocket className="mb-2 text-brand" />
                      <div className="font-semibold">No active signals.</div>
                      <div className="text-sm">First select settings, then click on Start Signals.</div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="h-[200px] md:h-[240px] rounded-md border border-border/60 flex items-center justify-center bg-background/40">
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground mb-1">Latest Signal</div>
                          <div className="text-2xl md:text-3xl font-extrabold tracking-tight">
                            {latest.type} {latest.asset}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">{latest.reason}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[260px] overflow-auto pr-1">
                        {signals.map((s) => (
                          <div key={s.id} className="rounded-md p-3 border border-border/60 bg-background/40">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">{s.timeframe}</span>
                              <Badge className={s.type === "BUY" ? "bg-brand text-[hsl(var(--hero-foreground))]" : "bg-brand-2 text-[hsl(var(--hero-foreground))]"}>
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
            <div className="text-2xl font-bold">🎉 Celebrating 500,000 Traders!</div>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
              We’re thrilled to have reached a community of over 500,000 registered users. Thank you for being a part of our journey.
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
    </div>
  );
};

export default Index;
