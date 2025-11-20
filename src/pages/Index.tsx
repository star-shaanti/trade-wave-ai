import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useToast } from "../hooks/use-toast";
import { Lock, SignalHigh, Users, TrendingUp, Award, ArrowRight, RefreshCw, LogIn, Moon, Sun, User, ChevronDown, Clock, AlertTriangle, CheckCircle, Home, X, Settings, Pause, Trash2, LogOut, ExternalLink, Mail, Satellite, Crown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "../components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "../hooks/useAuth";
import Logo from "../components/Logo";
import { ThemeToggle } from "../components/theme-toggle";
import { supportedLanguages, detectBrowserLanguage, getTranslations } from "../lib/translations";
import { LanguageSelector } from "../components/LanguageSelector";
import { LanguageSelectorSimple } from "../components/LanguageSelectorSimple";
import { LanguageSelectorFixed } from "../components/LanguageSelectorFixed";
import { LanguageButton } from "../components/LanguageButton";
import { useLanguage } from "../hooks/useLanguage";
import { FooterAd, SidebarAd, SidebarAdLeft, SidebarAdRight } from "../components/AdSense";

// Constantes pour l'API Gemini
const GEMINI_API_KEY = "AIzaSyAglyLqDVp1v9JQT2z27Z1-F1LddnB9_Mk";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

// Interface pour les signaux de trading
interface TradingSignal {
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
  expiration_time: number; // en secondes
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

// Données des paires de trading
const tradingPairs = {
  forex: {
    majors: [
      "EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "AUD/USD", "USD/CAD", "NZD/USD"
    ],
    minors: [
      "EUR/GBP", "EUR/JPY", "GBP/JPY", "EUR/CHF", "GBP/CHF", "AUD/JPY", "CAD/JPY",
      "NZD/JPY", "AUD/CAD", "AUD/CHF", "CAD/CHF", "NZD/CAD", "NZD/CHF", "AUD/NZD",
      "EUR/AUD", "EUR/CAD", "EUR/NZD", "GBP/AUD", "GBP/CAD", "GBP/NZD", "CHF/JPY",
      "AUD/CHF", "CAD/CHF", "NZD/CHF", "EUR/SEK", "EUR/NOK", "EUR/DKK", "EUR/PLN",
      "EUR/CZK", "EUR/HUF", "EUR/RON", "EUR/BGN", "EUR/HRK", "EUR/RSD", "EUR/TRY",
      "GBP/SEK", "GBP/NOK", "GBP/DKK", "GBP/PLN", "GBP/CZK", "GBP/HUF", "GBP/RON",
      "GBP/BGN", "GBP/HRK", "GBP/RSD", "GBP/TRY", "USD/SEK", "USD/NOK", "USD/DKK",
      "USD/PLN", "USD/CZK", "USD/HUF", "USD/RON", "USD/BGN", "USD/HRK", "USD/RSD",
      "USD/TRY", "USD/ZAR", "USD/MXN", "USD/BRL", "USD/ARS", "USD/CLP", "USD/COP",
      "USD/PEN", "USD/UYU", "USD/PYG", "USD/BOL", "USD/VES", "USD/RUB", "USD/UAH",
      "USD/BYN", "USD/KZT", "USD/UZS", "USD/KGS", "USD/TJS", "USD/TMT", "USD/AZN",
      "USD/GEL", "USD/AMD", "USD/KGS", "USD/TJS", "USD/TMT", "USD/AZN", "USD/GEL",
      "USD/AMD", "USD/KGS", "USD/TJS", "USD/TMT", "USD/AZN", "USD/GEL", "USD/AMD",
      "JPY/SEK", "JPY/NOK", "JPY/DKK", "JPY/PLN", "JPY/CZK", "JPY/HUF", "JPY/RON",
      "JPY/BGN", "JPY/HRK", "JPY/RSD", "JPY/TRY", "JPY/ZAR", "JPY/MXN", "JPY/BRL",
      "JPY/ARS", "JPY/CLP", "JPY/COP", "JPY/PEN", "JPY/UYU", "JPY/PYG", "JPY/BOL",
      "JPY/VES", "JPY/RUB", "JPY/UAH", "JPY/BYN", "JPY/KZT", "JPY/UZS", "JPY/KGS",
      "JPY/TJS", "JPY/TMT", "JPY/AZN", "JPY/GEL", "JPY/AMD", "CHF/SEK", "CHF/NOK",
      "CHF/DKK", "CHF/PLN", "CHF/CZK", "CHF/HUF", "CHF/RON", "CHF/BGN", "CHF/HRK",
      "CHF/RSD", "CHF/TRY", "CHF/ZAR", "CHF/MXN", "CHF/BRL", "CHF/ARS", "CHF/CLP",
      "CHF/COP", "CHF/PEN", "CHF/UYU", "CHF/PYG", "CHF/BOL", "CHF/VES", "CHF/RUB",
      "CHF/UAH", "CHF/BYN", "CHF/KZT", "CHF/UZS", "CHF/KGS", "CHF/TJS", "CHF/TMT",
      "CHF/AZN", "CHF/GEL", "CHF/AMD", "AUD/SEK", "AUD/NOK", "AUD/DKK", "AUD/PLN",
      "AUD/CZK", "AUD/HUF", "AUD/RON", "AUD/BGN", "AUD/HRK", "AUD/RSD", "AUD/TRY",
      "AUD/ZAR", "AUD/MXN", "AUD/BRL", "AUD/ARS", "AUD/CLP", "AUD/COP", "AUD/PEN",
      "AUD/UYU", "AUD/PYG", "AUD/BOL", "AUD/VES", "AUD/RUB", "AUD/UAH", "AUD/BYN",
      "AUD/KZT", "AUD/UZS", "AUD/KGS", "AUD/TJS", "AUD/TMT", "AUD/AZN", "AUD/GEL",
      "AUD/AMD", "CAD/SEK", "CAD/NOK", "CAD/DKK", "CAD/PLN", "CAD/CZK", "CAD/HUF",
      "CAD/RON", "CAD/BGN", "CAD/HRK", "CAD/RSD", "CAD/TRY", "CAD/ZAR", "CAD/MXN",
      "CAD/BRL", "CAD/ARS", "CAD/CLP", "CAD/COP", "CAD/PEN", "CAD/UYU", "CAD/PYG",
      "CAD/BOL", "CAD/VES", "CAD/RUB", "CAD/UAH", "CAD/BYN", "CAD/KZT", "CAD/UZS",
      "CAD/KGS", "CAD/TJS", "CAD/TMT", "CAD/AZN", "CAD/GEL", "CAD/AMD", "NZD/SEK",
      "NZD/NOK", "NZD/DKK", "NZD/PLN", "NZD/CZK", "NZD/HUF", "NZD/RON", "NZD/BGN",
      "NZD/HRK", "NZD/RSD", "NZD/TRY", "NZD/ZAR", "NZD/MXN", "NZD/BRL", "NZD/ARS",
      "NZD/CLP", "NZD/COP", "NZD/PEN", "NZD/UYU", "NZD/PYG", "NZD/BOL", "NZD/VES",
      "NZD/RUB", "NZD/UAH", "NZD/BYN", "NZD/KZT", "NZD/UZS", "NZD/KGS", "NZD/TJS",
      "NZD/TMT", "NZD/AZN", "NZD/GEL", "NZD/AMD"
    ]
  },
  forex_otc: [
    "EUR/USD OTC", "GBP/USD OTC", "USD/JPY OTC", "USD/CHF OTC", "AUD/USD OTC", "USD/CAD OTC", "NZD/USD OTC",
    "EUR/GBP OTC", "EUR/JPY OTC", "GBP/JPY OTC", "EUR/CHF OTC", "GBP/CHF OTC", "AUD/JPY OTC", "CAD/JPY OTC",
    "NZD/JPY OTC", "AUD/CAD OTC", "AUD/CHF OTC", "CAD/CHF OTC", "NZD/CAD OTC", "NZD/CHF OTC", "AUD/NZD OTC",
    "EUR/AUD OTC", "EUR/CAD OTC", "EUR/NZD OTC", "GBP/AUD OTC", "GBP/CAD OTC", "GBP/NZD OTC", "CHF/JPY OTC",
    "AUD/CHF OTC", "CAD/CHF OTC", "NZD/CHF OTC", "EUR/SEK OTC", "EUR/NOK OTC", "EUR/DKK OTC", "EUR/PLN OTC",
    "EUR/CZK OTC", "EUR/HUF OTC", "EUR/RON OTC", "EUR/BGN OTC", "EUR/HRK OTC", "EUR/RSD OTC", "EUR/TRY OTC",
    "GBP/SEK OTC", "GBP/NOK OTC", "GBP/DKK OTC", "GBP/PLN OTC", "GBP/CZK OTC", "GBP/HUF OTC", "GBP/RON OTC",
    "GBP/BGN OTC", "GBP/HRK OTC", "GBP/RSD OTC", "GBP/TRY OTC", "USD/SEK OTC", "USD/NOK OTC", "USD/DKK OTC",
    "USD/PLN OTC", "USD/CZK OTC", "USD/HUF OTC", "USD/RON OTC", "USD/BGN OTC", "USD/HRK OTC", "USD/RSD OTC",
    "USD/TRY OTC", "USD/ZAR OTC", "USD/MXN OTC", "USD/BRL OTC", "USD/ARS OTC", "USD/CLP OTC", "USD/COP OTC",
    "USD/PEN OTC", "USD/UYU OTC", "USD/PYG OTC", "USD/BOL OTC", "USD/VES OTC", "USD/RUB OTC", "USD/UAH OTC",
    "USD/BYN OTC", "USD/KZT OTC", "USD/UZS OTC", "USD/KGS OTC", "USD/TJS OTC", "USD/TMT OTC", "USD/AZN OTC",
    "USD/GEL OTC", "USD/AMD OTC", "JPY/SEK OTC", "JPY/NOK OTC", "JPY/DKK OTC", "JPY/PLN OTC", "JPY/CZK OTC",
    "JPY/HUF OTC", "JPY/RON OTC", "JPY/BGN OTC", "JPY/HRK OTC", "JPY/RSD OTC", "JPY/TRY OTC", "JPY/ZAR OTC",
    "JPY/MXN OTC", "JPY/BRL OTC", "JPY/ARS OTC", "JPY/CLP OTC", "JPY/COP OTC", "JPY/PEN OTC", "JPY/UYU OTC",
    "JPY/PYG OTC", "JPY/BOL OTC", "JPY/VES OTC", "JPY/RUB OTC", "JPY/UAH OTC", "JPY/BYN OTC", "JPY/KZT OTC",
    "JPY/UZS OTC", "JPY/KGS OTC", "JPY/TJS OTC", "JPY/TMT OTC", "JPY/AZN OTC", "JPY/GEL OTC", "JPY/AMD OTC",
    "CHF/SEK OTC", "CHF/NOK OTC", "CHF/DKK OTC", "CHF/PLN OTC", "CHF/CZK OTC", "CHF/HUF OTC", "CHF/RON OTC",
    "CHF/BGN OTC", "CHF/HRK OTC", "CHF/RSD OTC", "CHF/TRY OTC", "CHF/ZAR OTC", "CHF/MXN OTC", "CHF/BRL OTC",
    "CHF/ARS OTC", "CHF/CLP OTC", "CHF/COP OTC", "CHF/PEN OTC", "CHF/UYU OTC", "CHF/PYG OTC", "CHF/BOL OTC",
    "CHF/VES OTC", "CHF/RUB OTC", "CHF/UAH OTC", "CHF/BYN OTC", "CHF/KZT OTC", "CHF/UZS OTC", "CHF/KGS OTC",
    "CHF/TJS OTC", "CHF/TMT OTC", "CHF/AZN OTC", "CHF/GEL OTC", "CHF/AMD OTC", "AUD/SEK OTC", "AUD/NOK OTC",
    "AUD/DKK OTC", "AUD/PLN OTC", "AUD/CZK OTC", "AUD/HUF OTC", "AUD/RON OTC", "AUD/BGN OTC", "AUD/HRK OTC",
    "AUD/RSD OTC", "AUD/TRY OTC", "AUD/ZAR OTC", "AUD/MXN OTC", "AUD/BRL OTC", "AUD/ARS OTC", "AUD/CLP OTC",
    "AUD/COP OTC", "AUD/PEN OTC", "AUD/UYU OTC", "AUD/PYG OTC", "AUD/BOL OTC", "AUD/VES OTC", "AUD/RUB OTC",
    "AUD/UAH OTC", "AUD/BYN OTC", "AUD/KZT OTC", "AUD/UZS OTC", "AUD/KGS OTC", "AUD/TJS OTC", "AUD/TMT OTC",
    "AUD/AZN OTC", "AUD/GEL OTC", "AUD/AMD OTC", "CAD/SEK OTC", "CAD/NOK OTC", "CAD/DKK OTC", "CAD/PLN OTC",
    "CAD/CZK OTC", "CAD/HUF OTC", "CAD/RON OTC", "CAD/BGN OTC", "CAD/HRK OTC", "CAD/RSD OTC", "CAD/TRY OTC",
    "CAD/ZAR OTC", "CAD/MXN OTC", "CAD/BRL OTC", "CAD/ARS OTC", "CAD/CLP OTC", "CAD/COP OTC", "CAD/PEN OTC",
    "CAD/UYU OTC", "CAD/PYG OTC", "CAD/BOL OTC", "CAD/VES OTC", "CAD/RUB OTC", "CAD/UAH OTC", "CAD/BYN OTC",
    "CAD/KZT OTC", "CAD/UZS OTC", "CAD/KGS OTC", "CAD/TJS OTC", "CAD/TMT OTC", "CAD/AZN OTC", "CAD/GEL OTC",
    "CAD/AMD OTC", "NZD/SEK OTC", "NZD/NOK OTC", "NZD/DKK OTC", "NZD/PLN OTC", "NZD/CZK OTC", "NZD/HUF OTC",
    "NZD/RON OTC", "NZD/BGN OTC", "NZD/HRK OTC", "NZD/RSD OTC", "NZD/TRY OTC", "NZD/ZAR OTC", "NZD/MXN OTC",
    "NZD/BRL OTC", "NZD/ARS OTC", "NZD/CLP OTC", "NZD/COP OTC", "NZD/PEN OTC", "NZD/UYU OTC", "NZD/PYG OTC",
    "NZD/BOL OTC", "NZD/VES OTC", "NZD/RUB OTC", "NZD/UAH OTC", "NZD/BYN OTC", "NZD/KZT OTC", "NZD/UZS OTC",
    "NZD/KGS OTC", "NZD/TJS OTC", "NZD/TMT OTC", "NZD/AZN OTC", "NZD/GEL OTC", "NZD/AMD OTC"
  ],
  cryptos: [
    "BTC/USD", "ETH/USD", "BNB/USD", "SOL/USD", "ADA/USD", "XRP/USD", "DOT/USD",
    "DOGE/USD", "AVAX/USD", "MATIC/USD", "LINK/USD", "UNI/USD", "ATOM/USD", "LTC/USD",
    "BCH/USD", "XLM/USD", "VET/USD", "FIL/USD", "TRX/USD", "ETC/USD", "ALGO/USD",
    "ICP/USD", "FTT/USD", "NEAR/USD", "FTM/USD", "SAND/USD", "MANA/USD", "GALA/USD",
    "AXS/USD", "ROBLOX/USD", "CHZ/USD", "HOT/USD", "DENT/USD", "WIN/USD", "BTT/USD",
    "SHIB/USD", "SAFEMOON/USD", "BABYDOGE/USD", "FLOKI/USD", "DOGE/USD", "PEPE/USD",
    "BONK/USD", "WIF/USD", "JUP/USD", "PYTH/USD", "BOME/USD", "BOOK/USD", "POPCAT/USD"
  ],
  indices: [
    "S&P 500", "NASDAQ", "DOW JONES", "FTSE 100", "DAX", "CAC 40", "NIKKEI 225",
    "HANG SENG", "ASX 200", "TSX", "BOVESPA", "SENSEX", "SSE COMPOSITE", "KOSPI",
    "TAIWAN WEIGHTED", "STRAITS TIMES", "JAKARTA COMPOSITE", "PHILIPPINE COMPOSITE",
    "MALAYSIA COMPOSITE", "THAILAND SET", "VIETNAM VN-INDEX", "SINGAPORE STRAITS",
    "HONG KONG HANG SENG", "CHINA SHANGHAI", "JAPAN NIKKEI", "SOUTH KOREA KOSPI",
    "AUSTRALIA ASX", "NEW ZEALAND NZX", "CANADA TSX", "BRAZIL BOVESPA",
    "MEXICO IPC", "ARGENTINA MERVAL", "CHILE IPSA", "COLOMBIA COLCAP", "PERU IGBVL",
    "INDIA SENSEX", "PAKISTAN KSE", "BANGLADESH DSE", "SRI LANKA CSE", "NEPAL NEPSE",
    "RUSSIA MOEX", "TURKEY BIST", "ISRAEL TA-125", "EGYPT EGX", "SOUTH AFRICA JSE",
    "NIGERIA NGX", "KENYA NSE", "MOROCCO MASI", "TUNISIA TUNINDEX", "MAURITIUS SEMDEX"
  ]
};

// Horaires de trading par zone géographique
const tradingHours = {
  forex: {
    open: "Sunday 22:00 GMT",
    close: "Friday 22:00 GMT",
    timezone: "GMT",
    description: "Open 24h/5d (Sunday 22h - Friday 22h GMT)"
  },
  forex_otc: {
    open: "24/7",
    close: "24/7",
    timezone: "GMT",
    description: "Open 24/7"
  },
  cryptos: {
    open: "24/7",
    close: "24/7",
    timezone: "GMT",
    description: "Open 24/7"
  },
  indices: {
    // Horaires spécifiques par indice (exemples)
    "S&P 500": { open: "09:30", close: "16:00", timezone: "EST", description: "Mon-Fri 9:30-16:00 EST" },
    "NASDAQ": { open: "09:30", close: "16:00", timezone: "EST", description: "Mon-Fri 9:30-16:00 EST" },
    "DOW JONES": { open: "09:30", close: "16:00", timezone: "EST", description: "Mon-Fri 9:30-16:00 EST" },
    "FTSE 100": { open: "08:00", close: "16:30", timezone: "GMT", description: "Mon-Fri 8:00-16:30 GMT" },
    "DAX": { open: "09:00", close: "17:30", timezone: "CET", description: "Mon-Fri 9:00-17:30 CET" },
    "CAC 40": { open: "09:00", close: "17:30", timezone: "CET", description: "Mon-Fri 9:00-17:30 CET" },
    "NIKKEI 225": { open: "09:00", close: "15:00", timezone: "JST", description: "Mon-Fri 9:00-15:00 JST" },
    "HANG SENG": { open: "09:30", close: "16:00", timezone: "HKT", description: "Mon-Fri 9:30-16:00 HKT" }
  }
};

const Index = () => {
  const { user, isPremium, signOut, checkSubscription } = useAuth();
  const { toast } = useToast();

  const handleSignOut = () => {
    setShowLogoutConfirmModal(true);
  };

  const confirmSignOut = async () => {
    try {
      await signOut();
    } catch (e) {
      console.error("Error signing out:", e);
    }

    setShowLogoutConfirmModal(false);
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });

    // Optionnel: recharger pour repartir sur une session propre
    setTimeout(() => {
      window.location.href = "/";
    }, 150);
  };

  const handleCustomerService = () => {
    // Afficher l'email dans une notification toast
    toast({
      title: "Customer Service Email",
      description: "realtimetradingsignal@gmail.com",
    });
  };

  // Fonction pour vérifier le statut du paiement
  const checkPaymentStatus = async (paymentId?: string, invoiceId?: string) => {
    setCheckingPayment(true);
    try {
      const finalPaymentId = paymentId || manualPaymentId;
      const finalInvoiceId = invoiceId || manualInvoiceId;
      
      if (!finalPaymentId && !finalInvoiceId) {
        toast({
          title: "Identifiant requis",
          description: "Veuillez saisir un Payment ID ou Invoice ID.",
          variant: "destructive"
        });
        setCheckingPayment(false);
        return;
      }

      const session = await supabase.auth.getSession();
      if (!session.data.session?.access_token) {
        throw new Error("Session expirée. Veuillez vous reconnecter.");
      }

      console.log('Vérification du paiement avec:', { paymentId: finalPaymentId, invoiceId: finalInvoiceId });

      const { data, error } = await supabase.functions.invoke('check-nowpayments-payment', {
        body: { 
          ...(finalPaymentId && { payment_id: finalPaymentId }),
          ...(finalInvoiceId && { invoice_id: finalInvoiceId })
        },
        headers: {
          Authorization: `Bearer ${session.data.session.access_token}`,
        },
      });

      console.log('Réponse de la fonction:', { data, error });

      if (error) {
        console.error('Error invoking check-nowpayments-payment:', error);
        // Améliorer le message d'erreur selon le type d'erreur
        if (error.message?.includes('Failed to send') || error.message?.includes('fetch')) {
          throw new Error("Impossible de contacter le serveur. La fonction Edge Function n'est peut-être pas déployée. Veuillez contacter le support.");
        }
        if (error.message?.includes('404') || error.message?.includes('not found')) {
          throw new Error("Fonction non trouvée. Veuillez contacter le support technique.");
        }
        throw new Error(error.message || "Erreur lors de la vérification du paiement");
      }

      // Vérifier si data contient une erreur
      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.subscription_activated) {
        toast({
          title: "Abonnement activé !",
          description: "Votre paiement a été confirmé et votre abonnement est maintenant actif.",
        });
        setShowPaymentCheckModal(false);
        // Recharger la page après un court délai pour mettre à jour l'état
        setTimeout(() => {
          window.location.reload();
        }, 2000);
                                } else {
                                  // Afficher un message détaillé selon le statut
                                  const message = data?.message || 
                                    (data?.needs_more_payment 
                                      ? `Paiement partiel: ${data?.payment_percentage || 0}% payé. Veuillez compléter le paiement pour activer l'abonnement.`
                                      : `Statut du paiement: ${data?.payment_status || 'inconnu'}. Le webhook sera traité automatiquement une fois le paiement confirmé.`);
                                  
                                  toast({
                                    title: data?.needs_more_payment ? "Paiement incomplet" : "Paiement en attente",
                                    description: message,
                                    variant: data?.needs_more_payment ? "destructive" : "default",
                                  });
                                  setShowPaymentCheckModal(false);
                                }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de vérifier le statut du paiement.",
        variant: "destructive"
      });
    } finally {
      setCheckingPayment(false);
    }
  };
  // États pour les paramètres de trading
  const [category, setCategory] = useState("forex_otc"); // Forex OTC par défaut
  const [asset, setAsset] = useState("EUR/USD OTC");
  const [timeframe, setTimeframe] = useState("1M"); // 1M par défaut
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [isGeneratingSignals, setIsGeneratingSignals] = useState(false);
  const [isWaitingForSignal, setIsWaitingForSignal] = useState(false);
  const [currentDelay, setCurrentDelay] = useState<number | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  // Compteur d'utilisateurs actifs avec variation limitée
  const [activeUsers, setActiveUsers] = useState(0);
  const [expiredSignal, setExpiredSignal] = useState<TradingSignal | null>(null);
  const [showSignalActivated, setShowSignalActivated] = useState(false);
  const [activatedSignalInfo, setActivatedSignalInfo] = useState("");
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [showPaymentCheckModal, setShowPaymentCheckModal] = useState(false);
  const [manualPaymentId, setManualPaymentId] = useState("");
  const [manualInvoiceId, setManualInvoiceId] = useState("");
  const [showCancelSubscriptionModal, setShowCancelSubscriptionModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  
  // Gestion de la langue
  const { selectedLanguage, changeLanguage } = useLanguage();
  const translations = getTranslations(selectedLanguage);

  // Gestion du thème
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" || "dark";
    setTheme(savedTheme);
    document.documentElement.className = savedTheme;
  }, []);

  

  // Afficher le modal de bienvenue pour les utilisateurs premium (uniquement à la connexion)
  useEffect(() => {
    if (user && isPremium) {
      // Vérifier si c'est une nouvelle connexion en utilisant sessionStorage
      const hasShownWelcome = sessionStorage.getItem('welcomeShown');
      if (!hasShownWelcome) {
        setShowWelcomeModal(true);
        sessionStorage.setItem('welcomeShown', 'true');
        // Masquer le modal après 5 secondes
        setTimeout(() => {
          setShowWelcomeModal(false);
        }, 5000);
      }
    }
  }, [user, isPremium]);

  // Vérification périodique de l'abonnement pour détecter les changements
  useEffect(() => {
    if (!user) return;

    const checkSubscriptionPeriodically = () => {
      // Vérifier si l'utilisateur vient de payer
      const fromPaymentSuccess = sessionStorage.getItem('fromPaymentSuccess');
      if (fromPaymentSuccess) {
        console.log("Welcome modal check: ► {user: true, isPremium: false, userEmail: undefined}");
        // Vérifier l'abonnement immédiatement après un paiement
        setTimeout(() => {
          checkSubscription();
        }, 1000);
        sessionStorage.removeItem('fromPaymentSuccess');
      }
    };

    // Vérification immédiate
    checkSubscriptionPeriodically();

    // Vérification périodique toutes les 10 secondes (plus rapide après paiement)
    const interval = setInterval(checkSubscriptionPeriodically, 10000);

    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  // Compteur d'utilisateurs actifs avec variation limitée
  useEffect(() => {
    // Valeur initiale aléatoire entre 365,652 et 765,326
    const initialValue = Math.floor(Math.random() * (765326 - 365652 + 1)) + 365652;
    setActiveUsers(initialValue);

    const updateActiveUsers = () => {
      setActiveUsers(prevUsers => {
        // Variation aléatoire entre -70 et +70 (pas plus de 70 d'un coup)
        const variation = Math.floor(Math.random() * 141) - 70; // -70 à +70
        const newUsers = prevUsers + variation;
        
        // Maintenir dans les limites 365,652 - 765,326
        return Math.max(365652, Math.min(765326, newUsers));
      });
    };

    const interval = setInterval(updateActiveUsers, 5000); // Toutes les 5 secondes
    return () => clearInterval(interval);
  }, []);

  // Gestion de l'expiration des signaux
  useEffect(() => {
    const checkExpiredSignals = () => {
      const now = new Date().getTime();
      const updatedSignals = signals.map(signal => {
        const signalTime = new Date(signal.created_at).getTime();
        const elapsed = (now - signalTime) / 1000; // en secondes
        
        if (elapsed >= signal.expiration_time && signal.status === "ACTIVE") {
          // Marquer comme expiré et afficher l'overlay
          setExpiredSignal(signal);
          return { ...signal, status: "EXPIRED" as const };
        }
        return signal;
      });
      
      if (JSON.stringify(updatedSignals) !== JSON.stringify(signals)) {
        setSignals(updatedSignals);
      }
    };

    const interval = setInterval(checkExpiredSignals, 1000);
    return () => clearInterval(interval);
  }, [signals]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.className = newTheme;
  };

  const handleAuth = async () => {
    setAuthLoading(true);
    try {
      if (authMode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
              toast({
        title: "Login successful",
        description: "Welcome!",
      });
        setShowAuthModal(false); // Close modal on success
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast({
          title: "Registration successful",
          description: "Check your email to confirm your account",
        });
        setShowAuthModal(false); // Close modal on success
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const loadTradingSignals = async () => {
    try {
      // Pour la démonstration, on ne charge aucun signal
      // L'état sera vide par défaut
      setSignals([]);
    } catch (error) {
      console.error("Erreur lors du chargement des signaux:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les signaux de trading",
        variant: "destructive",
      });
    }
  };

  const generateSignalsWithGemini = async () => {
    if (!isPremium) {
      toast({
        title: "Subscription required",
        description: "You need a premium subscription to generate signals",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingSignals(true);
    
    try {
      // Générer un type de signal aléatoire (BUY ou SELL)
      const signalTypes = ["BUY", "SELL"];
      const randomType = signalTypes[Math.floor(Math.random() * signalTypes.length)];
      
      // Log pour vérifier la génération aléatoire
      console.log("Type de signal généré:", randomType);
      
      // Calculer la durée d'expiration basée sur le timeframe
      const getExpirationTime = (timeframe: string) => {
        switch (timeframe) {
          case "1M": return 60; // 1 minute
          case "2M": return 120; // 2 minutes
          case "3M": return 180; // 3 minutes
          case "5M": return 300; // 5 minutes
          case "15M": return 900; // 15 minutes
          case "30M": return 1800; // 30 minutes
          case "1H": return 3600; // 1 heure
          case "4H": return 14400; // 4 heures
          case "1D": return 86400; // 1 jour
          default: return 60; // 1 minute par défaut
        }
      };
      
      const expirationTime = getExpirationTime(timeframe);

      // Fonctions pour générer des valeurs aléatoires
      const getRandomVolatility = () => {
        const volatilities = ["Low", "Medium", "High"];
        return volatilities[Math.floor(Math.random() * volatilities.length)];
      };

      const getRandomTrendStrength = () => {
        return Math.floor(Math.random() * (99 - 77 + 1)) + 77; // Entre 77% et 99%
      };

      const getRandomVolumeFlow = () => {
        const flows = ["Decreasing", "Stable", "Increasing"];
        return flows[Math.floor(Math.random() * flows.length)];
      };

      const getRandomSentiment = () => {
        const sentiments = ["Bearish", "Neutral", "Bullish"];
        return sentiments[Math.floor(Math.random() * sentiments.length)];
      };

      const getRandomMovingAverage = () => {
        const averages = ["Below", "At", "Above"];
        return averages[Math.floor(Math.random() * averages.length)];
      };

      const getRandomRSI = () => {
        const rsiValues = ["Oversold", "Neutral", "Overbought"];
        return rsiValues[Math.floor(Math.random() * rsiValues.length)];
      };

      const getRandomStochastic = () => {
        const stochastics = ["Crossing Down", "Neutral", "Crossing Up"];
        return stochastics[Math.floor(Math.random() * stochastics.length)];
      };

      const getRandomParabolicSAR = () => {
        const sarValues = ["Bearish Flip", "Neutral", "Bullish Flip"];
        return sarValues[Math.floor(Math.random() * sarValues.length)];
      };

      const getRandomEnvelopeTrend = () => {
        const envelopeValues = ["Lower Band", "Middle Band", "Upper Band"];
        return envelopeValues[Math.floor(Math.random() * envelopeValues.length)];
      };

      const getRandomSignalStrength = () => {
        return Math.floor(Math.random() * (99 - 77 + 1)) + 77; // Entre 77% et 99%
      };
      
      // Essayer d'abord l'API Gemini
      try {
        console.log("Tentative API Gemini avec type:", randomType);
        
        const prompt = `Analyse le marché ${asset} sur le timeframe ${timeframe} et génère 1 signal de trading ${randomType} détaillé. 
        
        Format de réponse JSON:
        {
          "signals": [
            {
              "symbol": "${asset}",
              "type": "${randomType}",
              "entry_price": "prix d'entrée réaliste",
              "target_price": "prix objectif",
              "stop_loss": "prix stop loss",
              "confidence": "pourcentage de confiance (60-95)",
              "description": "analyse technique détaillée",
              "analysis": "raisonnement derrière le signal",
              "volatility": "Low/Medium/High",
              "trend_strength": "pourcentage (60-95)",
              "volume_flow": "Increasing/Decreasing/Stable",
              "sentiment": "Bullish/Bearish/Neutral",
              "moving_average": "Above/Below/Crossing",
              "rsi": "Oversold/Overbought/Neutral",
              "stochastic": "Crossing Up/Crossing Down/Neutral",
              "parabolic_sar": "Bullish Flip/Bearish Flip/Neutral",
              "envelope_trend": "Upper Band/Lower Band/Middle",
              "signal_strength": "pourcentage (70-95)",
              "market_conditions": "Favorable/Unfavorable/Neutral"
            }
          ]
        }
        
        Utilise des prix réalistes et une analyse technique crédible pour un signal ${randomType}.`;

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          })
        });

        if (!response.ok) {
          throw new Error(`Erreur API Gemini: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
          const responseText = data.candidates[0].content.parts[0].text;
          
          // Extraire le JSON de la réponse
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const signalsData = JSON.parse(jsonMatch[0]);
            
            if (signalsData.signals && Array.isArray(signalsData.signals)) {
              const newSignals: TradingSignal[] = signalsData.signals.map((signal: any, index: number) => ({
                id: `gemini-${Date.now()}-${index}`,
                symbol: signal.symbol || asset,
                type: signal.type || randomType,
                entry_price: parseFloat(signal.entry_price) || 1.0850,
                target_price: parseFloat(signal.target_price) || 1.0920,
                stop_loss: parseFloat(signal.stop_loss) || 1.0800,
                risk_reward: Math.abs((parseFloat(signal.target_price) - parseFloat(signal.entry_price)) / (parseFloat(signal.entry_price) - parseFloat(signal.stop_loss))) || 2.0,
                confidence: parseInt(signal.confidence) || 75,
                created_at: new Date().toISOString(),
                status: "ACTIVE" as const,
                description: signal.description || "Signal généré par IA",
                analysis: signal.analysis || "Analyse technique basée sur les indicateurs de marché",
                expiration_time: expirationTime,
                volatility: signal.volatility || "Medium",
                trend_strength: parseInt(signal.trend_strength) || 75,
                volume_flow: signal.volume_flow || "Increasing",
                sentiment: signal.sentiment || (randomType === "BUY" ? "Bullish" : "Bearish"),
                moving_average: signal.moving_average || (randomType === "BUY" ? "Above" : "Below"),
                rsi: signal.rsi || "Neutral",
                stochastic: signal.stochastic || (randomType === "BUY" ? "Crossing Up" : "Crossing Down"),
                parabolic_sar: signal.parabolic_sar || (randomType === "BUY" ? "Bullish Flip" : "Bearish Flip"),
                envelope_trend: signal.envelope_trend || (randomType === "BUY" ? "Upper Band" : "Lower Band"),
                signal_strength: parseInt(signal.signal_strength) || 82,
                market_conditions: signal.market_conditions || (randomType === "BUY" ? "Favorable" : "Unfavorable")
              }));

              setSignals(newSignals);
              
              // Afficher la notification de signal activé
              setActivatedSignalInfo(`A new ${randomType} signal for ${asset} has been generated.`);
              setShowSignalActivated(true);
              
              // Masquer la notification après 5 secondes
              setTimeout(() => {
                setShowSignalActivated(false);
    }, 5000);
              
              toast({
                title: "Signal généré",
                description: `Nouveau signal ${randomType} généré pour ${asset}`,
              });
              return; // Sortir si succès
            }
          }
        }
      } catch (apiError) {
        console.log("API Gemini échouée, utilisation des signaux de démonstration:", apiError);
      }

      // Si l'API Gemini échoue, générer des signaux de démonstration
      console.log("Génération de signaux de démonstration avec type:", randomType);
      
      const demoSignals: TradingSignal[] = [{
        id: `demo-${Date.now()}`,
        symbol: asset,
        type: randomType as "BUY" | "SELL",
        entry_price: randomType === "BUY" ? 1.0850 : 1.0950,
        target_price: randomType === "BUY" ? 1.0920 : 1.0880,
        stop_loss: randomType === "BUY" ? 1.0800 : 1.1020,
        risk_reward: 2.33,
        confidence: 85,
        created_at: new Date().toISOString(),
        status: "ACTIVE",
        description: `Signal ${randomType} basé sur l'analyse technique de ${asset}`,
        analysis: `Le prix montre une tendance ${randomType === "BUY" ? "haussière" : "baissière"} claire avec confirmation des indicateurs techniques`,
        expiration_time: expirationTime,
        volatility: getRandomVolatility(),
        trend_strength: getRandomTrendStrength(),
        volume_flow: getRandomVolumeFlow(),
        sentiment: getRandomSentiment(),
        moving_average: getRandomMovingAverage(),
        rsi: getRandomRSI(),
        stochastic: getRandomStochastic(),
        parabolic_sar: getRandomParabolicSAR(),
        envelope_trend: getRandomEnvelopeTrend(),
        signal_strength: getRandomSignalStrength(),
        market_conditions: randomType === "BUY" ? "Favorable" : "Unfavorable"
      }];

      console.log("Signal de démonstration créé:", demoSignals[0]);
      setSignals(demoSignals);
      
      // Afficher la notification de signal activé
      setActivatedSignalInfo(`A new ${randomType} signal for ${asset} has been generated.`);
      setShowSignalActivated(true);
      
      // Masquer la notification après 5 secondes
        setTimeout(() => {
        setShowSignalActivated(false);
        }, 5000);
      
      toast({
        title: "Signal generated",
        description: `New ${randomType} signal generated for ${asset}`,
      });

    } catch (error: any) {
      console.error("Erreur lors de la génération des signaux:", error);
      toast({
        title: "Error",
        description: "Unable to generate signals. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSignals(false);
    }
  };

  const handleStartSignals = () => {
    if (!user) {
      window.location.href = "/signin"; // Redirect to signin page
      return;
    }
    
    if (!isPremium) {
      window.location.href = "/pricing";
      return;
    }
    
    // Vérifier si l'actif est ouvert
    if (!isAssetOpen(asset, category)) {
      toast({
        title: "Market closed",
        description: "This market is currently closed. Please choose another asset or wait for opening.",
        variant: "destructive",
      });
      return;
    }

    // Vérifier si un signal est déjà actif
    if (signals.length > 0) {
      toast({
        title: "Active signal",
        description: "A signal is already active. Wait for it to expire before generating a new one.",
        variant: "destructive",
      });
      return;
    }

    // Démarrer l'attente avec l'icône satellite
    setIsWaitingForSignal(true);
    
    // Délais possibles en secondes
    const possibleDelays = [5, 10, 12, 15, 17];
    const randomDelay = possibleDelays[Math.floor(Math.random() * possibleDelays.length)];
    
    // Stocker le délai actuel
    setCurrentDelay(randomDelay);
    
    // Informer l'utilisateur du délai
    toast({
      title: "Satellite connection",
      description: "Connecting to satellite... Please wait.",
    });
    
    // Attendre le délai aléatoire avant de générer le signal
    setTimeout(() => {
      generateSignalsWithGemini();
      // Continuer l'animation pendant 1 seconde supplémentaire
      setTimeout(() => {
        setIsWaitingForSignal(false);
        setCurrentDelay(null);
    }, 1000);
    }, randomDelay * 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeRemaining = (signal: TradingSignal) => {
    const now = new Date().getTime();
    const signalTime = new Date(signal.created_at).getTime();
    const elapsed = (now - signalTime) / 1000;
    return Math.max(0, signal.expiration_time - elapsed);
  };

  const dismissExpiredSignal = () => {
    setExpiredSignal(null);
  };

  const getAvailableAssets = () => {
    switch (category) {
      case "forex":
        return [...tradingPairs.forex.majors, ...tradingPairs.forex.minors];
      case "forex_otc":
        return tradingPairs.forex_otc;
      case "cryptos":
        return tradingPairs.cryptos;
      case "indices":
        return tradingPairs.indices;
      default:
        return tradingPairs.forex.majors;
    }
  };

  const getTradingHours = (asset: string) => {
    if (category === "forex") return tradingHours.forex;
    if (category === "forex_otc") return tradingHours.forex_otc;
    if (category === "cryptos") return tradingHours.cryptos;
    if (category === "indices") {
      return tradingHours.indices[asset as keyof typeof tradingHours.indices] || 
             { open: "09:00", close: "17:00", timezone: "Local", description: "Horaires locaux" };
    }
    return tradingHours.forex;
  };

  // Fonction pour vérifier si un actif est ouvert
  const isAssetOpen = (asset: string, category: string) => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Dimanche, 1 = Lundi, etc.
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute; // Temps en minutes

    // Forex OTC et Cryptos sont ouverts 24/7
    if (category === "forex_otc" || category === "cryptos") {
      return true;
    }

    // Forex est fermé le weekend
    if (category === "forex") {
      return currentDay >= 1 && currentDay <= 5; // Lundi à Vendredi
    }

    // Indices - vérifier les heures spécifiques
    if (category === "indices") {
      const tradingHours = getTradingHours(asset);
      const [openHour, openMin] = tradingHours.open.split(':').map(Number);
      const [closeHour, closeMin] = tradingHours.close.split(':').map(Number);
      const openTime = openHour * 60 + openMin;
      const closeTime = closeHour * 60 + closeMin;

      // Pour les indices, vérifier aussi les jours de la semaine
      if (currentDay === 0 || currentDay === 6) return false; // Weekend
      
      return currentTime >= openTime && currentTime <= closeTime;
    }

    return true;
  };

  // Fonction pour vérifier si on peut générer un signal
  const canGenerateSignal = () => {
    // Si pas d'utilisateur ou pas premium, pas de signal
    if (!user || !isPremium) return false;
    
    // Si un signal est actif, pas de nouveau signal
    if (signals.length > 0) return false;
    
    // Vérifier si l'actif est ouvert
    return isAssetOpen(asset, category);
  };

  // Fonction pour obtenir le statut du bouton
  const getButtonStatus = () => {
    if (!user) return { text: translations.logInToGetSignals || "Log In to Get Signals", icon: <LogIn className="h-4 w-4 mr-2" />, disabled: false };
    if (!isPremium) return { text: translations.startSignals || "Start Signals", icon: <SignalHigh className="h-4 w-4 mr-2" />, disabled: false };
    if (signals.length > 0) return { text: "Signal Active", icon: <Clock className="h-4 w-4 mr-2" />, disabled: true };
    if (!isAssetOpen(asset, category)) return { text: "Market Closed", icon: <AlertTriangle className="h-4 w-4 mr-2" />, disabled: true };
    if (isWaitingForSignal) return { text: "Connecting to Satellite...", icon: <Satellite className="h-4 w-4 mr-2 animate-spin text-green-500" />, disabled: true };
    return { text: translations.startSignals || "Start Signals", icon: <SignalHigh className="h-4 w-4 mr-2" />, disabled: false };
  };

  useEffect(() => {
    loadTradingSignals();
  }, []);

  // Nettoyer les signaux expirés et déverrouiller le bouton
  useEffect(() => {
    const interval = setInterval(() => {
      setSignals(prevSignals => {
        const now = new Date().getTime();
        const activeSignals = prevSignals.filter(signal => {
          const signalTime = new Date(signal.created_at).getTime();
          const elapsed = (now - signalTime) / 1000;
          return elapsed < signal.expiration_time;
        });
        
        // Si des signaux ont expiré, afficher une notification
        if (activeSignals.length < prevSignals.length) {
                  toast({
          title: "Signal expired",
          description: "The active signal has expired. You can now generate a new signal.",
        });
        }
        
        return activeSignals;
      });
    }, 1000); // Vérifier toutes les secondes

    return () => clearInterval(interval);
  }, [toast]);

  // Mettre à jour l'asset quand la catégorie change
  useEffect(() => {
    const availableAssets = getAvailableAssets();
    if (availableAssets.length > 0 && !availableAssets.includes(asset)) {
      setAsset(availableAssets[0]);
    }
  }, [category]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Logo className="h-8 w-8 text-primary" />
              <div 
                className="flex flex-col cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => window.location.reload()}
              >
                <span className="text-lg font-bold leading-tight">Real-time</span>
                <span className="text-lg font-bold leading-tight">Trading Signals</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Sélecteur de langue */}
              <LanguageButton
                selectedLanguage={selectedLanguage}
                onLanguageChange={changeLanguage}
                className="w-16 h-8"
              />
              
              {/* Icône de thème */}
              <ThemeToggle />


              {/* Menu utilisateur ou bouton de connexion */}
              {user ? (
                <div className="flex items-center space-x-2">
                  {/* Badge couronne pour les utilisateurs premium */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-2">
                        <User className="h-5 w-5" />
                        <ChevronDown className="h-4 w-4 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => window.location.href = "/"}>
                        <Home className="h-4 w-4 mr-2" />
                        Home Page
                      </DropdownMenuItem>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <User className="h-4 w-4 mr-2" />
                          Profile & Settings
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem onClick={() => setShowCancelSubscriptionModal(true)}>
                            <X className="h-4 w-4 mr-2 text-red-500" />
                            <span className="text-red-500">Cancel Subscription</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.open("https://billing.stripe.com/p/login/5kQ5kD5DMeKH8zC7xXdfG00", "_blank")}>
                            <Settings className="h-4 w-4 mr-2" />
                            Manage Subscription
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setShowChangePasswordModal(true)}>
                            <Lock className="h-4 w-4 mr-2" />
                            Change Password
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Pause className="h-4 w-4 mr-2 text-orange-500" />
                            <span className="text-orange-500">Suspend Account</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                            <span className="text-red-500">Delete Account</span>
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      <DropdownMenuItem onClick={handleCustomerService}>
                        <Mail className="h-4 w-4 mr-2" />
                        Customer Service
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = "/signin"}
                  className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Logo className="h-8 w-8 text-primary" />
                <div 
                  className="flex flex-col cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => window.location.reload()}
                >
                  <span className="text-base font-bold leading-tight">Real-time</span>
                  <span className="text-base font-bold leading-tight">Trading Signals</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {/* Sélecteur de langue */}
                <LanguageButton
                  selectedLanguage={selectedLanguage}
                  onLanguageChange={changeLanguage}
                  className="w-12 h-8"
                />
                
                {/* Icône de thème */}
                <ThemeToggle />


                {/* Menu utilisateur ou bouton de connexion */}
                {user ? (
                  <div className="flex items-center space-x-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-2">
                          <User className="h-5 w-5" />
                          <ChevronDown className="h-4 w-4 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => window.location.href = "/"}>
                          <Home className="h-4 w-4 mr-2" />
                          Home Page
                        </DropdownMenuItem>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <User className="h-4 w-4 mr-2" />
                            Profile & Settings
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem onClick={() => setShowCancelSubscriptionModal(true)}>
                              <X className="h-4 w-4 mr-2 text-red-500" />
                              <span className="text-red-500">Cancel Subscription</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open("https://billing.stripe.com/p/login/5kQ5kD5DMeKH8zC7xXdfG00", "_blank")}>
                              <Settings className="h-4 w-4 mr-2" />
                              Manage Subscription
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setShowChangePasswordModal(true)}>
                              <Lock className="h-4 w-4 mr-2" />
                              Change Password
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Pause className="h-4 w-4 mr-2 text-orange-500" />
                              <span className="text-orange-500">Suspend Account</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                              <span className="text-red-500">Delete Account</span>
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuItem onClick={handleCustomerService}>
                          <Mail className="h-4 w-4 mr-2" />
                          Customer Service
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleSignOut}>
                          <LogOut className="h-4 w-4 mr-2" />
                          Log out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = "/signin"}
                    className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Modal d'authentification */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connexion</DialogTitle>
            <DialogDescription>
              Connectez-vous à votre compte pour accéder aux signaux de trading
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
              />
          </div>
            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              </div>
            <Button
              onClick={handleAuth}
              disabled={authLoading}
              className="w-full"
            >
              {authLoading ? "Chargement..." : "Se connecter"}
            </Button>
            <div className="text-center">
              <Button
                variant="link"
                onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
              >
                {authMode === "login" ? "Créer un compte" : "Déjà un compte ?"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal d'annulation d'abonnement */}
      <Dialog open={showCancelSubscriptionModal} onOpenChange={setShowCancelSubscriptionModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center space-x-2">
              <X className="h-5 w-5" />
              <span>Cancel Subscription</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to cancel your subscription? This action will stop your recurring billing.
            </p>
            
            {/* Section d'avertissement */}
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <h4 className="font-semibold text-orange-800 dark:text-orange-200">Before you cancel:</h4>
              </div>
              <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                <li>• You'll lose access to premium trading signals</li>
                <li>• Your subscription will end at the current billing period</li>
                <li>• You can resubscribe anytime</li>
                <li>• No refunds for the current billing period</li>
              </ul>
          </div>
          
            <p className="text-xs text-muted-foreground">
              You will be redirected to Stripe's secure portal to safely cancel your subscription.
            </p>

            <div className="flex space-x-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowCancelSubscriptionModal(false)}
                className="flex-1"
              >
                Keep Subscription
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => {
                  window.open("https://billing.stripe.com/p/login/5kQ5kD5DMeKH8zC7xXdfG00", "_blank");
                  setShowCancelSubscriptionModal(false);
                }}
                className="flex-1"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Cancel Subscription
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de changement de mot de passe */}
      <Dialog open={showChangePasswordModal} onOpenChange={setShowChangePasswordModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Lock className="h-5 w-5" />
              <span>Change Password</span>
            </DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new password
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                placeholder="Enter your current password"
                className="mt-1"
              />
              </div>
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter your new password"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm your new password"
                className="mt-1"
              />
            </div>
            <div className="flex space-x-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowChangePasswordModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  // Ici vous pouvez ajouter la logique de changement de mot de passe
                  toast({
                    title: "Password Updated",
                    description: "Your password has been successfully changed.",
                  });
                  setShowChangePasswordModal(false);
                }}
                className="flex-1"
              >
                Update Password
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Overlay pour signal expiré */}
      {expiredSignal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={dismissExpiredSignal}
        >
          <div className="bg-background border border-border rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Signal Expired</h2>
            <p className="text-muted-foreground">Click to dismiss</p>
                </div>
        </div>
      )}

      {/* Notification de signal activé */}
      {showSignalActivated && (
        <div className="fixed top-4 right-4 bg-gray-800 border border-gray-600 rounded-lg p-4 text-white z-50 max-w-sm">
          <div className="font-bold">Signal Activated!</div>
          <div className="text-sm">{activatedSignalInfo}</div>
        </div>
      )}

      {/* Contenu principal */}
      <main className="container mx-auto px-4 py-8">
        {/* Section Hero avec traductions */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-foreground mb-4 md:mb-6 px-2">
            {translations.heroTitle}
          </h1>
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-3 md:mb-4 px-2">
            {translations.heroSubtitle}
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed px-4">
            {translations.heroDescription}
          </p>
        </div>

        {/* Compteur d'utilisateurs actifs */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-3 text-sm sm:text-lg font-semibold text-foreground bg-card border border-border rounded-lg px-4 sm:px-6 py-3 shadow-lg">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            <span className="text-xl sm:text-2xl font-bold">{activeUsers.toLocaleString()}</span>
            <span className="text-xs sm:text-base">{translations.activeTraders}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Colonne de gauche - Paramètres */}
          <div className="space-y-6">
            
            {/* Trading Bot Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="h-5 w-5" />
                  <span>{translations.tradingBotSettings || "Trading Bot Settings"}</span>
                </CardTitle>
                <CardDescription>
                  {translations.configureTradingSettings || "Configure your trading settings"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div>
                  <Label>{translations.category || "Category"}</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                      <SelectContent>
                      <SelectItem value="forex">Forex</SelectItem>
                      <SelectItem value="forex_otc">Forex OTC</SelectItem>
                      <SelectItem value="cryptos">Cryptos</SelectItem>
                      <SelectItem value="indices">Indices</SelectItem>
                      </SelectContent>
                    </Select>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-muted-foreground">
                      {getTradingHours(asset).description}
                    </p>
                    <div className={`flex items-center space-x-1 text-xs ${
                      isAssetOpen(asset, category) ? 'text-green-500' : 'text-red-500'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        isAssetOpen(asset, category) ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span>{isAssetOpen(asset, category) ? (translations.open || "Open") : (translations.closed || "Closed")}</span>
                    </div>
                  </div>
                  </div>

                  <div>
                  <Label>{translations.asset || "Asset"}</Label>
                    <Select value={asset} onValueChange={setAsset}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                      <SelectContent>
                      {getAvailableAssets().map((assetOption) => (
                        <SelectItem key={assetOption} value={assetOption}>
                          {assetOption}
                        </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                  <Label>{translations.timeframe || "Timeframe"}</Label>
                  <Select value={timeframe} onValueChange={setTimeframe}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1M">1Min</SelectItem>
                        <SelectItem value="2M">2Min</SelectItem>
                        <SelectItem value="3M">3Min</SelectItem>
                        <SelectItem value="5M">5Min</SelectItem>
                        <SelectItem value="15M">15Min</SelectItem>
                        <SelectItem value="30M">30Min</SelectItem>
                        <SelectItem value="1H">1H</SelectItem>
                        <SelectItem value="4H">4H</SelectItem>
                        <SelectItem value="1D">1D</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                      <Button
                  onClick={handleStartSignals}
                  disabled={isGeneratingSignals || isWaitingForSignal || getButtonStatus().disabled}
                  className={`w-full ${
                    user && isPremium && !getButtonStatus().disabled && !isWaitingForSignal 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : user && !isPremium 
                        ? 'bg-white hover:bg-gray-100 text-gray-900 border border-gray-300' 
                        : ''
                  }`}
                >
                  {isGeneratingSignals ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                            </>
                          ) : (
                    <>
                      {getButtonStatus().icon}
                      {getButtonStatus().text}
                          </>
                        )}
                      </Button>

                      {/* Bouton pour vérifier le paiement NOWPayments si l'utilisateur n'est pas premium */}
                      {user && !isPremium && (
                        <div className="mt-3">
                          <Button
                            variant="outline"
                            onClick={async () => {
                              // Récupérer le payment_id ou invoice_id depuis l'URL, sessionStorage ou localStorage
                              const urlParams = new URLSearchParams(window.location.search);
                              const paymentId = urlParams.get('payment_id') || 
                                                sessionStorage.getItem('nowpayments_payment_id') ||
                                                localStorage.getItem('nowpayments_payment_id');
                              const invoiceId = urlParams.get('invoice_id') || 
                                               urlParams.get('iid') ||
                                               sessionStorage.getItem('nowpayments_invoice_id') ||
                                               localStorage.getItem('nowpayments_invoice_id');
                              
                              if (!paymentId && !invoiceId) {
                                // Ouvrir le modal pour saisir manuellement
                                setShowPaymentCheckModal(true);
                                return;
                              }

                              // Vérifier le paiement avec les identifiants trouvés
                              await checkPaymentStatus(paymentId || undefined, invoiceId || undefined);
                            }}
                            disabled={checkingPayment}
                            className="w-full"
                          >
                            {checkingPayment ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Vérification en cours...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Vérifier le paiement
                              </>
                            )}
                          </Button>
                        </div>
                      )}
              </CardContent>
              </Card>


            </div>

          {/* Colonne centrale - Signaux actifs */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <SignalHigh className="h-5 w-5" />
                  <span>{translations.activeSignals || "ACTIVE SIGNALS"}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {signals.length === 0 ? (
                  // État vide - comme sur la deuxième capture
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <SignalHigh className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{translations.noActiveSignals || "No active signals."}</h3>
                    <p className="text-muted-foreground">
                      {translations.selectSettingsFirst || "First select settings, then click on Start Signals, and you will see the active signal here."}
                    </p>
                    </div>
                  ) : (
                  // Affichage des signaux actifs
                  <div className="space-y-6">
                    {signals.map((signal) => {
                      const timeRemaining = getTimeRemaining(signal);
                      const isExpired = timeRemaining <= 0;
                      
                      return (
                        <div key={signal.id} className="border border-border rounded-lg p-6">
                          {/* Header du signal */}
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Active Trading Signal</h3>
                            <div className="text-sm text-muted-foreground">
                              Expires In: {formatTime(Math.floor(timeRemaining))}
                          </div>
                        </div>

                          {/* Type de signal */}
                          <div className="text-center mb-6">
                            <div className="flex items-center justify-center space-x-2 mb-2">
                              {signal.type === "BUY" ? (
                                <TrendingUp className="h-6 w-6 text-green-500" />
                              ) : (
                                <TrendingUp className="h-6 w-6 text-red-500 transform rotate-180" />
                              )}
                              <span className="text-2xl font-bold">
                                {signal.symbol}
                              </span>
                          </div>
                            <div className={`text-xl font-bold ${
                              signal.type === "BUY" ? "text-green-500" : "text-red-500"
                            }`}>
                              TRY, {signal.type} SIGNAL!
                          </div>
                        </div>

                          {/* Informations détaillées */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Market Info */}
                          <div>
                              <h4 className="font-semibold mb-3">Market Info</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Volatility:</span>
                                  <span>{signal.volatility}</span>
                            </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Trend Strength:</span>
                                  <span>{signal.trend_strength}%</span>
                          </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Volume Flow:</span>
                                  <span>{signal.volume_flow}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Sentiment:</span>
                                  <span>{signal.sentiment}</span>
                                </div>
                              </div>
                            </div>

                            {/* Technical Overview */}
                          <div>
                              <h4 className="font-semibold mb-3">Technical Overview</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Moving Average:</span>
                                  <span>{signal.moving_average}</span>
                            </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">RSI:</span>
                                  <span>{signal.rsi}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Stochastic:</span>
                                  <span>{signal.stochastic}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Parabolic SAR:</span>
                                  <span>{signal.parabolic_sar}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Envelope Trend:</span>
                                  <span>{signal.envelope_trend}</span>
                                </div>
                              </div>
                          </div>
                        </div>

                          {/* Signal Strength */}
                          <div className="mt-6">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">Signal Strength</span>
                              <span className="text-sm text-muted-foreground">{signal.signal_strength}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  signal.type === "BUY" ? "bg-green-500" : "bg-red-500"
                                }`}
                                style={{ width: `${signal.signal_strength}%` }}
                            ></div>
                          </div>
                        </div>

                          {/* Time Remaining */}
                        <div className="mt-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">Time Remaining</span>
                              <span className="text-sm text-muted-foreground">{formatTime(Math.floor(timeRemaining))}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  signal.type === "BUY" ? "bg-green-500" : "bg-red-500"
                                }`}
                                style={{ width: `${(timeRemaining / signal.expiration_time) * 100}%` }}
                            ></div>
                          </div>
                          </div>
                        </div>
                      );
                    })}
                    </div>
                  )}
              </CardContent>
            </Card>
                </div>
              </div>
      </main>

      {/* Layout avec sidebars pour les publicités */}
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar gauche (desktop seulement) */}
        <div className="hidden lg:block lg:w-80 xl:w-96 flex-shrink-0">
          <div className="sticky top-4 p-4">
            <SidebarAdLeft />
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 min-w-0">
          {/* Section d'affiliation centrée */}
          <section className="bg-background border-t border-border py-6 md:py-8">
            <div className="container mx-auto px-4">
          <div className="flex justify-center">
            {/* Programme d'affiliation - Affiliate Trading Signals */}
            <Card className="bg-gradient-to-br from-blue-500 to-purple-600 border-0 max-w-2xl w-full">
              <CardContent className="p-8">
                <div className="text-center">
                  {/* Section Celebrating 1,000,000 Traders! */}
                  <div className="flex items-center justify-center space-x-3 mb-6">
                    <Users className="h-8 w-8 text-white" />
                    <div>
                      <h3 className="font-bold text-lg text-white">Celebrating 1,000,000 Traders!</h3>
                      <p className="text-blue-100 text-sm">Join our growing community</p>
                    </div>
                  </div>
                  
                  {/* Section Programme d'affiliation */}
                  <div className="flex items-center justify-center space-x-3 mb-6">
                    <Award className="h-8 w-8 text-white" />
                    <div>
                      <h3 className="font-bold text-lg text-white">{translations.affiliateTitle}</h3>
                      <p className="text-blue-100 text-sm">{translations.affiliateDescription}</p>
                    </div>
                  </div>
                  
                  {/* Bouton principal avec URL */}
                  <div className="mb-4">
                    <Button 
                      className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-3 rounded-lg flex items-center space-x-2 mx-auto"
                      onClick={() => window.open('https://affiliate-trading-signals.com/', '_blank')}
                    >
                      <Users className="h-4 w-4" />
                      <span>{translations.affiliateButton}</span>
                    </Button>
                  </div>
                  
                  {/* Lien alternatif */}
                  <div className="mb-4">
                    <button 
                      className="text-white underline text-sm hover:text-blue-200"
                      onClick={() => window.open('https://affiliate-trading-signals.com/', '_blank')}
                    >
                      {translations.affiliateLink}
                    </button>
                  </div>
                  
                  {/* Statistiques */}
                  <div className="bg-purple-500/30 rounded-lg p-4">
                    <div className="text-white text-2xl font-bold">$1.7000K+</div>
                    <div className="text-purple-100 text-sm">{translations.affiliateStats}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
        </div>

        {/* Sidebar droite (desktop seulement) */}
        <div className="hidden lg:block lg:w-80 xl:w-96 flex-shrink-0">
          <div className="sticky top-4 p-4">
            <SidebarAdRight />
          </div>
        </div>
      </div>

      {/* Publicité pied de page */}
      <div className="w-full bg-gray-50 dark:bg-gray-800 py-4 mt-8">
        <FooterAd />
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 border-t border-purple-800 mt-8 md:mt-16">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div>
              <h3 className="font-bold mb-4 text-white">Real-time Trading Signals</h3>
              <p className="text-sm text-purple-200">
                {translations.footerDescription || "Real-time trading signals generated by AI and our professional traders"}
            </p>
          </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">{translations.services || "Services"}</h4>
              <ul className="space-y-2 text-sm text-purple-200">
                <li>{translations.forexSignals || "Forex Signals"}</li>
                <li>{translations.cryptoSignals || "Crypto Signals"}</li>
                <li>{translations.indicesSignals || "Indices Signals"}</li>
                <li>{translations.technicalAnalysis || "Technical Analysis"}</li>
              </ul>
          </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">{translations.support || "Support"}</h4>
              <ul className="space-y-2 text-sm text-purple-200">
                <li>
                  <a 
                    href={`mailto:realtimetradingsignal@gmail.com?subject=Customer Service`}
                    className="hover:text-white transition-colors"
              >
                {translations.customerService || "Customer Service"}
              </a>
                </li>
                <li>
                  <a 
                    href={`mailto:realtimetradingsignal@gmail.com?subject=Become an Affiliate`}
                    className="hover:text-white transition-colors"
                  >
                    {translations.becomeAffiliate || "Become an Affiliate"}
                  </a>
                </li>
                <li>
                  <a 
                    href="/faq"
                    className="hover:text-white transition-colors"
                  >
                    {translations.faq || "FAQ"}
                  </a>
                </li>
              </ul>
          </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">{translations.legal || "Legal"}</h4>
              <ul className="space-y-2 text-sm text-purple-200">
                <li>
                  <a 
                    href="/terms-conditions"
                    className="hover:text-white transition-colors"
                  >
                    {translations.termsConditions || "Terms & Conditions"}
                  </a>
                </li>
                <li>
                  <a 
                    href="/privacy-policy"
                    className="hover:text-white transition-colors"
                  >
                    {translations.privacyPolicy || "Privacy Policy"}
                  </a>
                </li>
                <li>
                  <a 
                    href="/trading-risks"
                    className="hover:text-white transition-colors"
                  >
                    {translations.tradingRisks || "Trading Risks"}
                  </a>
                </li>
                <li>
                  <a 
                    href="/legal-notice"
                    className="hover:text-white transition-colors"
                  >
                    {translations.legalNotice || "Legal Notice"}
                  </a>
                </li>
              </ul>
          </div>
        </div>
          <div className="border-t border-purple-700 mt-8 pt-8 text-center text-sm text-purple-300">
            {translations.copyright || "© 2025 Real-time Trading Signals. All rights reserved."}
          </div>
        </div>
      </footer>

      {/* Modal de confirmation de déconnexion */}
      <Dialog open={showLogoutConfirmModal} onOpenChange={setShowLogoutConfirmModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <LogOut className="h-5 w-5" />
              <span>Confirm Logout</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to log out of your account?
            </DialogDescription>
          </DialogHeader>
          <div className="flex space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowLogoutConfirmModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmSignOut}
              className="flex-1"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de bienvenue pour les utilisateurs premium */}
      <Dialog open={showWelcomeModal} onOpenChange={setShowWelcomeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-green-600">
              <Crown className="h-5 w-5" />
              <span>Welcome Premium User!</span>
            </DialogTitle>
            <DialogDescription>
              You now have complete access to all trading signals and premium features.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <p className="text-sm text-muted-foreground">
              Your premium subscription is active. Enjoy unlimited access to our AI-powered trading signals!
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal pour vérifier le paiement manuellement */}
      <Dialog open={showPaymentCheckModal} onOpenChange={setShowPaymentCheckModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5" />
              <span>Vérifier le paiement</span>
            </DialogTitle>
            <DialogDescription>
              Si vous avez effectué un paiement, saisissez votre Payment ID ou Invoice ID pour vérifier le statut.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="invoice-id">Invoice ID (recommandé)</Label>
              <Input
                id="invoice-id"
                type="text"
                placeholder="Ex: 4704457232"
                value={manualInvoiceId}
                onChange={(e) => setManualInvoiceId(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Trouvable dans l'URL de la page de paiement NOWPayments (paramètre "iid")
              </p>
            </div>
            <div>
              <Label htmlFor="payment-id">Payment ID (optionnel)</Label>
              <Input
                id="payment-id"
                type="text"
                placeholder="Ex: 6226313058"
                value={manualPaymentId}
                onChange={(e) => setManualPaymentId(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex space-x-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowPaymentCheckModal(false);
                  setManualPaymentId("");
                  setManualInvoiceId("");
                }}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button 
                onClick={() => checkPaymentStatus()}
                disabled={checkingPayment || (!manualPaymentId && !manualInvoiceId)}
                className="flex-1"
              >
                {checkingPayment ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Vérification...
                  </>
                ) : (
                  "Vérifier"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
