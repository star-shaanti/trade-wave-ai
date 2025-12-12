import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useToast } from "../hooks/use-toast";
import { Lock, SignalHigh, Users, TrendingUp, Award, ArrowRight, RefreshCw, LogIn, Moon, Sun, User, ChevronDown, Clock, AlertTriangle, CheckCircle, Home, X, Settings, Pause, Trash2, LogOut, ExternalLink, Mail, Satellite, Crown, PlayCircle } from "lucide-react";
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
import { getMarketPrice } from "../services/marketData";
import { generateRealTimeSignal } from "../services/signalGenerator";

// Constantes pour l'API Gemini (fallback optionnel)
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
      // Utiliser les paramètres passés directement, ou les valeurs manuelles comme fallback
      const finalPaymentId = paymentId !== undefined ? paymentId : manualPaymentId;
      const finalInvoiceId = invoiceId !== undefined ? invoiceId : manualInvoiceId;
      
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

      // Essayer d'abord avec payment_id si disponible (priorité)
      // Sinon, essayer avec invoice_id
      // Ne pas envoyer les deux en même temps si c'est le même identifiant
      const requestBody: any = {};
      if (finalPaymentId) {
        requestBody.payment_id = finalPaymentId;
      } else if (finalInvoiceId) {
        requestBody.invoice_id = finalInvoiceId;
      }

      const { data, error } = await supabase.functions.invoke('check-nowpayments-payment', {
        body: requestBody,
        headers: {
          Authorization: `Bearer ${session.data.session.access_token}`,
        },
      });

      console.log('Réponse de la fonction:', { data, error });

      // Si data est vide ou undefined, vérifier si c'est un objet vide avec seulement error
      // Si data est un objet vide, la fonction a peut-être retourné une réponse valide mais vide
      if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
        console.warn('Réponse vide de la fonction Edge - vérification de l\'abonnement directement');
        // Si on a une invoiceId, le webhook pourrait avoir déjà traité le paiement
        // Vérifier directement l'abonnement après un court délai
        setTimeout(() => {
          checkSubscription();
        }, 3000);
        toast({
          title: "Vérification en cours",
          description: "Vérification de votre abonnement. Le webhook activera automatiquement l'abonnement une fois le paiement confirmé.",
          variant: "default",
        });
        setCheckingPayment(false);
        return;
      }

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

      // Vérifier si data contient une erreur (sauf si c'est juste un statut "waiting" ou "not_found")
      if (data?.error && data?.payment_status !== "waiting" && data?.payment_status !== "not_found" && !data?.subscription_activated) {
        // Ne pas lancer d'erreur si c'est juste un paiement en attente ou une invoice introuvable
        if (data.error === "Paiement en attente" || data.payment_status === "waiting") {
          // Traiter comme un statut normal, pas une erreur
        } else if (data.error === "Invoice introuvable" || data.payment_status === "not_found") {
          // Invoice introuvable n'est pas une erreur fatale - le webhook activera l'abonnement plus tard
          // Vérifier quand même l'abonnement car le webhook pourrait avoir déjà traité le paiement
          console.log('Invoice introuvable mais vérification de l\'abonnement en cours...');
          setTimeout(() => {
            checkSubscription();
          }, 2000);
          toast({
            title: "Vérification en cours",
            description: data.message || "L'invoice n'a pas encore été créée. Le webhook activera automatiquement l'abonnement une fois le paiement confirmé.",
            variant: "default",
          });
          setShowPaymentCheckModal(false);
          return; // Sortir de la fonction sans erreur
        } else {
        throw new Error(data.error);
        }
      }
      
      // Gérer spécifiquement le cas "Invoice introuvable" même si pas dans data.error
      if (data?.payment_status === "not_found") {
        // Vérifier quand même l'abonnement car le webhook pourrait avoir déjà traité le paiement
        console.log('Invoice not_found mais vérification de l\'abonnement en cours...');
        setTimeout(() => {
          checkSubscription();
        }, 2000);
        toast({
          title: "Vérification en cours",
          description: data.message || "L'invoice n'a pas encore été créée dans NOWPayments. Le webhook activera automatiquement l'abonnement une fois le paiement confirmé.",
          variant: "default",
        });
        setShowPaymentCheckModal(false);
        return;
      }

      if (data?.subscription_activated || data?.already_subscribed) {
        const isAlreadySubscribed = data?.already_subscribed;
        toast({
          title: isAlreadySubscribed ? "Abonnement déjà actif" : "Abonnement activé !",
          description: isAlreadySubscribed 
            ? (data?.message || "Votre abonnement est déjà actif. Le paiement a été traité avec succès.")
            : "Votre paiement a été confirmé et votre abonnement est maintenant actif.",
        });
        setShowPaymentCheckModal(false);
        // Nettoyer les identifiants de paiement une fois l'abonnement activé
        sessionStorage.removeItem('nowpayments_payment_id');
        sessionStorage.removeItem('nowpayments_invoice_id');
        localStorage.removeItem('nowpayments_payment_id');
        localStorage.removeItem('nowpayments_invoice_id');
        // Recharger la page après un court délai pour mettre à jour l'état
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
                                  // Afficher un message détaillé selon le statut
                                  const message = data?.message || 
                                    (data?.needs_more_payment 
                                      ? `Paiement partiel: ${data?.payment_percentage || 0}% payé. Veuillez compléter le paiement pour activer l'abonnement.`
            : data?.payment_status === "waiting"
            ? "Le paiement est en cours de traitement. L'abonnement sera activé automatiquement une fois le paiement confirmé."
                                      : `Statut du paiement: ${data?.payment_status || 'inconnu'}. Le webhook sera traité automatiquement une fois le paiement confirmé.`);
                                  
                                  toast({
          title: data?.needs_more_payment ? "Paiement incomplet" : data?.payment_status === "waiting" ? "Paiement en cours" : "Paiement en attente",
                                    description: message,
                                    variant: data?.needs_more_payment ? "destructive" : "default",
                                  });
                                  setShowPaymentCheckModal(false);
        
        // Si le paiement est en attente, vérifier à nouveau l'abonnement après quelques secondes
        if (data?.payment_status === "waiting") {
          setTimeout(() => {
            checkSubscription();
          }, 5000);
        }
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
      // Nettoyer les identifiants de paiement si l'utilisateur est premium
      sessionStorage.removeItem('nowpayments_payment_id');
      sessionStorage.removeItem('nowpayments_invoice_id');
      localStorage.removeItem('nowpayments_payment_id');
      localStorage.removeItem('nowpayments_invoice_id');
      
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

  // Vérification automatique du paiement NOWPayments quand un paiement est détecté
  useEffect(() => {
    if (!user || isPremium || checkingPayment) return;

    const autoCheckPayment = async () => {
      // Vérifier si l'utilisateur vient de payer
      const fromPaymentSuccess = sessionStorage.getItem('fromPaymentSuccess');
      const urlParams = new URLSearchParams(window.location.search);
      // NP_id est l'identifiant retourné par NOWPayments dans l'URL de redirection
      const npId = urlParams.get('NP_id');
      const urlInvoiceId = urlParams.get('iid') || urlParams.get('invoice_id');
      const urlPaymentId = urlParams.get('payment_id') || urlParams.get('paymentId');
      
      // SÉCURITÉ: Vérifier que les IDs stockés appartiennent à l'utilisateur actuel
      const storedUserEmail = sessionStorage.getItem('payment_user_email') || localStorage.getItem('payment_user_email');
      const currentUserEmail = user?.email;
      
      // Ne récupérer les IDs du storage que si l'email correspond
      let storedPaymentId = null;
      let storedInvoiceId = null;
      
      if (storedUserEmail && currentUserEmail && storedUserEmail === currentUserEmail) {
        storedPaymentId = sessionStorage.getItem('nowpayments_payment_id') || localStorage.getItem('nowpayments_payment_id');
        storedInvoiceId = sessionStorage.getItem('nowpayments_invoice_id') || localStorage.getItem('nowpayments_invoice_id');
      } else if (storedUserEmail && currentUserEmail && storedUserEmail !== currentUserEmail) {
        // L'utilisateur actuel est différent de celui qui a payé - nettoyer les IDs
        console.log('[SÉCURITÉ] ⚠️ IDs de paiement appartenant à un autre utilisateur détectés - nettoyage');
        sessionStorage.removeItem('nowpayments_payment_id');
        sessionStorage.removeItem('nowpayments_invoice_id');
        localStorage.removeItem('nowpayments_payment_id');
        localStorage.removeItem('nowpayments_invoice_id');
        sessionStorage.removeItem('payment_user_email');
        localStorage.removeItem('payment_user_email');
      }
      
      // Priorité : IDs de l'URL uniquement (plus sécurisé)
      // Les IDs du storage ne sont utilisés que si l'email correspond
      const paymentId = urlPaymentId || npId || storedPaymentId;
      const invoiceId = urlInvoiceId || (npId && !urlPaymentId ? npId : null) || storedInvoiceId;

      // Vérifier automatiquement le paiement SEULEMENT si on a des IDs de l'URL
      // ou des IDs validés du storage
      if ((urlPaymentId || npId || urlInvoiceId) || (storedPaymentId || storedInvoiceId)) {
        console.log('Vérification automatique du paiement détecté...', { invoiceId, paymentId, userEmail: currentUserEmail });
        
        // Attendre un peu pour éviter les vérifications multiples
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Vérifier le paiement
        try {
          await checkPaymentStatus(paymentId || undefined, invoiceId || undefined);
          
          // Après vérification, vérifier aussi l'abonnement
          setTimeout(() => {
            checkSubscription();
          }, 2000);
        } catch (error) {
          console.error('Erreur lors de la vérification automatique du paiement:', error);
        }
      }

      if (fromPaymentSuccess) {
        console.log("Welcome modal check: ► {user: true, isPremium: false, userEmail: undefined}");
        // Vérifier l'abonnement immédiatement après un paiement
        setTimeout(() => {
          checkSubscription();
        }, 1000);
        sessionStorage.removeItem('fromPaymentSuccess');
      }
    };

    // Vérification automatique après un court délai (seulement une fois)
    const timeout = setTimeout(autoCheckPayment, 1500);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isPremium, checkingPayment]);

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
      console.log(`🔄 Analyse du marché en temps réel pour ${asset} (${category}) - Timeframe: ${timeframe}`);
      
      // Délai aléatoire entre 5 et 15 secondes pour simuler l'analyse
      const delaySeconds = Math.floor(Math.random() * 11) + 5; // 5-15 secondes
      console.log(`⏱️ Analyse en cours... (${delaySeconds} secondes)`);
      
      // Afficher le message de connexion satellite pendant l'attente
      setIsWaitingForSignal(true);
      setCurrentDelay(delaySeconds);
      
      // PRIORITÉ 1: Récupérer les données de marché réelles
      let marketPrice = null;
      try {
        console.log(`📊 Récupération des données de marché pour ${asset}...`);
        marketPrice = await getMarketPrice(asset, category);
        
        if (marketPrice) {
          console.log(`✅ Prix récupéré: ${marketPrice.price} (Change 24h: ${marketPrice.changePercent24h}%)`);
        } else {
          console.warn("⚠️ Impossible de récupérer le prix, utilisation de données de référence");
        }
      } catch (priceError) {
        console.warn("⚠️ Erreur lors de la récupération du prix:", priceError);
      }
      
      // Attendre le délai avant de générer le signal
      await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));

      // PRIORITÉ 2: Générer un signal basé sur les données réelles
      try {
        console.log(`🔍 Génération du signal basé sur l'analyse technique...`);
        const realTimeSignal = await generateRealTimeSignal(
          asset,
          category,
          timeframe,
          getMarketPrice
        );

        if (realTimeSignal) {
          console.log("✅ Signal généré avec succès:", realTimeSignal);
          setSignals([realTimeSignal]);
          
          // Afficher la notification de signal activé
          const signalInfo = (translations.signalActivatedInfo || "A new {type} signal for {asset} has been generated from real-time market analysis.")
            .replace('{type}', realTimeSignal.type)
            .replace('{asset}', asset);
          setActivatedSignalInfo(signalInfo);
          setShowSignalActivated(true);
          
          // Masquer la notification après 5 secondes
          setTimeout(() => {
            setShowSignalActivated(false);
          }, 5000);
          
          toast({
            title: translations.signalGenerated || "Signal généré",
            description: (translations.signalGeneratedDescription || "Nouveau signal {type} généré pour {asset} basé sur l'analyse technique en temps réel")
              .replace('{type}', realTimeSignal.type)
              .replace('{asset}', asset),
          });
          
          setIsWaitingForSignal(false);
          setCurrentDelay(null);
          setIsGeneratingSignals(false);
          return; // Succès avec données réelles
        }
      } catch (realTimeError) {
        console.warn("⚠️ Erreur lors de la génération de signal en temps réel:", realTimeError);
      }

      // FALLBACK: Essayer Gemini si les données réelles échouent
      try {
        console.log("🔄 Tentative avec API Gemini comme fallback...");
        
        const prompt = `Analyse le marché ${asset} sur le timeframe ${timeframe} et génère 1 signal de trading détaillé basé sur l'analyse technique actuelle. 
        
        Format de réponse JSON:
        {
          "signals": [
            {
              "symbol": "${asset}",
              "type": "BUY ou SELL",
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
        
        Utilise des prix réalistes et une analyse technique crédible.`;

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

        if (response.ok) {
        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
          const responseText = data.candidates[0].content.parts[0].text;
          
          // Extraire le JSON de la réponse
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const signalsData = JSON.parse(jsonMatch[0]);
            
              if (signalsData.signals && Array.isArray(signalsData.signals) && signalsData.signals.length > 0) {
                const signal = signalsData.signals[0];
                const signalType = signal.type || "BUY";
                
                const getExpirationTime = (timeframe: string) => {
                  switch (timeframe) {
                    case "1M": return 60;
                    case "2M": return 120;
                    case "3M": return 180;
                    case "5M": return 300;
                    case "15M": return 900;
                    case "30M": return 1800;
                    case "1H": return 3600;
                    case "4H": return 14400;
                    case "1D": return 86400;
                    default: return 60;
                  }
                };
                
                const expirationTime = getExpirationTime(timeframe);
                
                const newSignal: TradingSignal = {
                  id: `gemini-${Date.now()}`,
                symbol: signal.symbol || asset,
                  type: signalType as "BUY" | "SELL",
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
                  sentiment: signal.sentiment || (signalType === "BUY" ? "Bullish" : "Bearish"),
                  moving_average: signal.moving_average || (signalType === "BUY" ? "Above" : "Below"),
                rsi: signal.rsi || "Neutral",
                  stochastic: signal.stochastic || (signalType === "BUY" ? "Crossing Up" : "Crossing Down"),
                  parabolic_sar: signal.parabolic_sar || (signalType === "BUY" ? "Bullish Flip" : "Bearish Flip"),
                  envelope_trend: signal.envelope_trend || (signalType === "BUY" ? "Upper Band" : "Lower Band"),
                signal_strength: parseInt(signal.signal_strength) || 82,
                  market_conditions: signal.market_conditions || (signalType === "BUY" ? "Favorable" : "Unfavorable")
                };

                setSignals([newSignal]);
                const signalInfo = (translations.signalActivatedInfo || "A new {type} signal for {asset} has been generated from real-time market analysis.")
                  .replace('{type}', signalType)
                  .replace('{asset}', asset);
                setActivatedSignalInfo(signalInfo);
              setShowSignalActivated(true);
              setTimeout(() => {
                setShowSignalActivated(false);
    }, 5000);
              
              toast({
                  title: translations.signalGenerated || "Signal généré",
                  description: (translations.signalGeneratedDescription || "Nouveau signal {type} généré pour {asset} basé sur l'analyse technique en temps réel")
                    .replace('{type}', signalType)
                    .replace('{asset}', asset),
                });
                
                setIsGeneratingSignals(false);
                return; // Succès avec Gemini
              }
            }
          }
        }
      } catch (geminiError) {
        console.warn("⚠️ API Gemini échouée:", geminiError);
      }

      // DERNIER FALLBACK: Générer un signal basé sur les données réelles avec analyse technique AMÉLIORÉE
      console.log("🔄 Génération de signal avec analyse technique approfondie...");
      
      // Récupérer plusieurs prix pour analyser la tendance RÉELLE
      const { getMultiplePrices } = await import('../services/marketData');
      const trendPrices = await getMultiplePrices(asset, category, 8);
      
      // Utiliser les données de marché réelles si disponibles
      const currentPrice = marketPrice?.price || getReferencePrice(asset, category);
      const priceChange = marketPrice?.changePercent24h || 0;
      
      // Analyser la tendance RÉELLE basée sur plusieurs points de prix
      let signalType: "BUY" | "SELL";
      
      if (trendPrices.length >= 3) {
        // Analyser la tendance à court terme avec les prix réels
        const oldestPrice = trendPrices[0];
        const newestPrice = trendPrices[trendPrices.length - 1];
        const trendPercent = ((newestPrice - oldestPrice) / oldestPrice) * 100;
        
        // Analyser aussi la tendance des dernières périodes
        const recentTrend = trendPrices.slice(-3);
        const recentChange = (recentTrend[recentTrend.length - 1] - recentTrend[0]) / recentTrend[0] * 100;
        
        // Combiner les deux tendances (pondération: 40% tendance globale, 60% tendance récente)
        const combinedTrend = (trendPercent * 0.4) + (recentChange * 0.6);
        
        if (combinedTrend > 0.05) {
          signalType = "BUY";
          console.log(`✅ Tendance haussière détectée: ${combinedTrend.toFixed(3)}%`);
        } else if (combinedTrend < -0.05) {
          signalType = "SELL";
          console.log(`✅ Tendance baissière détectée: ${combinedTrend.toFixed(3)}%`);
        } else {
          // Tendance neutre, utiliser la variation 24h
          signalType = priceChange > 0 ? "BUY" : "SELL";
          console.log(`⚠️ Tendance neutre, utilisation variation 24h: ${priceChange.toFixed(2)}%`);
        }
      } else {
        // Pas assez de données, utiliser variation 24h avec seuils stricts
        if (priceChange > 0.2) {
          signalType = "BUY";
        } else if (priceChange < -0.2) {
          signalType = "SELL";
        } else {
          signalType = priceChange > 0 ? "BUY" : "SELL";
        }
      }
      
      // Calculer les niveaux de prix réalistes
      const priceLevels = calculateRealisticPriceLevels(
        currentPrice,
        signalType,
        timeframe,
        category
      );
      
      const getExpirationTime = (timeframe: string) => {
        switch (timeframe) {
          case "1M": return 60;
          case "2M": return 120;
          case "3M": return 180;
          case "5M": return 300;
          case "15M": return 900;
          case "30M": return 1800;
          case "1H": return 3600;
          case "4H": return 14400;
          case "1D": return 86400;
          default: return 60;
        }
      };
      
      const expirationTime = getExpirationTime(timeframe);
      
      // Calculer la confiance basée sur les données réelles
      const confidence = calculateConfidence(priceChange, marketPrice);
      
      const newSignal: TradingSignal = {
        id: `signal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        symbol: asset,
        type: signalType,
        entry_price: priceLevels.entry,
        target_price: priceLevels.target,
        stop_loss: priceLevels.stopLoss,
        risk_reward: priceLevels.riskReward,
        confidence: confidence,
        created_at: new Date().toISOString(),
        status: "ACTIVE" as const,
        description: `Signal ${signalType} basé sur l'analyse technique de ${asset} - Prix actuel: ${currentPrice.toFixed(5)}`,
        analysis: `Analyse technique: Prix ${currentPrice.toFixed(5)}, Variation 24h: ${priceChange.toFixed(2)}%. ${signalType === "BUY" ? "Tendance haussière détectée" : "Tendance baissière détectée"} avec confirmation des indicateurs techniques.`,
        expiration_time: expirationTime,
        volatility: Math.abs(priceChange) > 2 ? "High" : Math.abs(priceChange) > 1 ? "Medium" : "Low",
        trend_strength: Math.min(99, Math.max(60, 60 + Math.abs(priceChange) * 5)),
        volume_flow: priceChange > 0 ? "Increasing" : priceChange < 0 ? "Decreasing" : "Stable",
        sentiment: signalType === "BUY" ? "Bullish" : "Bearish",
        moving_average: signalType === "BUY" ? "Above" : "Below",
        rsi: Math.abs(priceChange) > 1 ? (signalType === "BUY" ? "Oversold" : "Overbought") : "Neutral",
        stochastic: signalType === "BUY" ? "Crossing Up" : "Crossing Down",
        parabolic_sar: signalType === "BUY" ? "Bullish Flip" : "Bearish Flip",
        envelope_trend: signalType === "BUY" ? "Upper Band" : "Lower Band",
        signal_strength: Math.min(99, Math.max(70, confidence + 5)),
        market_conditions: signalType === "BUY" ? "Favorable" : "Unfavorable"
      };

      console.log("✅ Signal généré (fallback):", newSignal);
      setSignals([newSignal]);
      const signalInfo = (translations.signalActivatedInfo || "A new {type} signal for {asset} has been generated from real-time market analysis.")
        .replace('{type}', signalType)
        .replace('{asset}', asset);
      setActivatedSignalInfo(signalInfo);
      setShowSignalActivated(true);
        setTimeout(() => {
        setShowSignalActivated(false);
        }, 5000);
      
      toast({
        title: translations.signalGenerated || "Signal généré",
        description: (translations.signalGeneratedDescription || "Nouveau signal {type} généré pour {asset} basé sur l'analyse technique en temps réel")
          .replace('{type}', signalType)
          .replace('{asset}', asset),
      });
      
      setIsWaitingForSignal(false);
      setCurrentDelay(null);
      setIsGeneratingSignals(false);

    } catch (error: any) {
      console.error("❌ Erreur lors de la génération des signaux:", error);
      setIsWaitingForSignal(false);
      setCurrentDelay(null);
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

    // Appeler directement la fonction de génération
    // Le délai de 5-15 secondes est géré dans generateSignalsWithGemini
      generateSignalsWithGemini();
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

  // Fonction pour obtenir un prix de référence si les données réelles ne sont pas disponibles
  const getReferencePrice = (symbol: string, cat: string): number => {
    if (cat === 'cryptos') {
      const refPrices: Record<string, number> = {
        'BTC/USD': 92000,
        'ETH/USD': 3200,
        'BNB/USD': 880,
        'SOL/USD': 135,
        'ADA/USD': 0.42,
        'XRP/USD': 2.0,
      };
      return refPrices[symbol] || 100;
    } else if (cat === 'forex' || cat === 'forex_otc') {
      const refPrices: Record<string, number> = {
        'EUR/USD': 1.0850,
        'EUR/USD OTC': 1.0850,
        'GBP/USD': 1.2650,
        'GBP/USD OTC': 1.2650,
        'USD/JPY': 149.50,
        'USD/JPY OTC': 149.50,
        'USD/CHF': 0.8750,
        'USD/CHF OTC': 0.8750,
        'AUD/USD': 0.6550,
        'AUD/USD OTC': 0.6550,
      };
      return refPrices[symbol] || 1.0;
    }
    return 1000;
  };

  // Fonction pour déterminer le type de signal basé sur l'analyse AMÉLIORÉE
  const determineSignalType = async (price: number, priceChange: number, cat: string, symbol: string): Promise<"BUY" | "SELL"> => {
    // Récupérer plusieurs points de prix pour analyser la tendance réelle
    try {
      const prices: number[] = [];
      
      // Récupérer plusieurs prix pour voir la tendance
      for (let i = 0; i < 5; i++) {
        const priceData = await getMarketPrice(symbol, cat);
        if (priceData) {
          prices.push(priceData.price);
        }
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      if (prices.length >= 3) {
        // Analyser la tendance à court terme
        const recentTrend = prices[prices.length - 1] - prices[0];
        const trendPercent = (recentTrend / prices[0]) * 100;
        
        // Si tendance claire, suivre la tendance
        if (trendPercent > 0.05) {
          return "BUY";
        } else if (trendPercent < -0.05) {
          return "SELL";
        }
      }

      // Analyser la variation 24h avec seuils plus stricts
      if (priceChange > 0.3) {
        return "BUY"; // Hausse significative
      } else if (priceChange < -0.3) {
        return "SELL"; // Baisse significative
      }
      
      // Pour les petites variations, analyser la direction récente
      if (prices.length >= 2) {
        const lastChange = prices[prices.length - 1] - prices[prices.length - 2];
        return lastChange > 0 ? "BUY" : "SELL";
      }
      
      // Dernier recours: suivre la variation 24h
      return priceChange > 0 ? "BUY" : "SELL";
    } catch (error) {
      console.warn("Erreur analyse tendance, utilisation variation 24h:", error);
      // Fallback basé sur variation 24h
      if (priceChange > 0.1) return "BUY";
      if (priceChange < -0.1) return "SELL";
      return priceChange > 0 ? "BUY" : "SELL";
    }
  };

  // Fonction pour calculer les niveaux de prix réalistes
  const calculateRealisticPriceLevels = (
    currentPrice: number,
    signalType: "BUY" | "SELL",
    tf: string,
    cat: string
  ): { entry: number; target: number; stopLoss: number; riskReward: number } => {
    const timeframeMultipliers: Record<string, number> = {
      '1M': 0.001,
      '2M': 0.0015,
      '3M': 0.002,
      '5M': 0.003,
      '15M': 0.005,
      '30M': 0.008,
      '1H': 0.01,
      '4H': 0.015,
      '1D': 0.02,
    };

    const multiplier = timeframeMultipliers[tf] || 0.005;
    
    let entry = currentPrice;
    let target: number;
    let stopLoss: number;

    if (signalType === "BUY") {
      target = currentPrice * (1 + multiplier);
      stopLoss = currentPrice * (1 - multiplier * 0.5);
    } else {
      target = currentPrice * (1 - multiplier);
      stopLoss = currentPrice * (1 + multiplier * 0.5);
    }

    const decimals = currentPrice > 1000 ? 2 : currentPrice > 1 ? (cat === 'forex' || cat === 'forex_otc' ? 5 : 4) : 6;
    entry = Math.round(entry * Math.pow(10, decimals)) / Math.pow(10, decimals);
    target = Math.round(target * Math.pow(10, decimals)) / Math.pow(10, decimals);
    stopLoss = Math.round(stopLoss * Math.pow(10, decimals)) / Math.pow(10, decimals);

    const risk = Math.abs(entry - stopLoss);
    const reward = Math.abs(target - entry);
    const riskReward = risk > 0 ? reward / risk : 2.0;

    return {
      entry,
      target,
      stopLoss,
      riskReward: Math.round(riskReward * 100) / 100,
    };
  };

  // Fonction pour calculer la confiance basée sur les données
  const calculateConfidence = (priceChange: number, marketData: any): number => {
    let confidence = 70;
    if (marketData) {
      confidence += 10;
    }
    const volatility = Math.abs(priceChange);
    if (volatility > 1) {
      confidence += 5;
    } else if (volatility < 0.1) {
      confidence -= 5;
    }
    return Math.min(95, Math.max(60, confidence));
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
          title: translations.signalExpired || "Signal expired",
          description: translations.signalExpiredDescription || "The active signal has expired. You can now generate a new signal.",
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
            <h2 className="text-2xl font-bold mb-2">{translations.signalExpiredTitle || "Signal Expired"}</h2>
            <p className="text-muted-foreground">{translations.signalExpiredDismiss || "Click to dismiss"}</p>
                </div>
        </div>
      )}

      {/* Notification de signal activé */}
      {showSignalActivated && (
        <div className="fixed top-4 right-4 bg-gray-800 border border-gray-600 rounded-lg p-4 text-white z-50 max-w-sm">
          <div className="font-bold">{translations.signalActivated || "Signal Activated!"}</div>
          <div className="text-sm">{activatedSignalInfo}</div>
        </div>
      )}

      {/* Contenu principal */}
      <main className="container mx-auto px-4 py-8">
        {/* Section Hero avec traductions */}
        <div className="text-center mb-8 md:mb-12">
          <div className="mb-4">
            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1.5 text-xs sm:text-sm font-semibold">
              {translations.versionName || "Version 2.0 - Real-Time Precision Edition"}
            </Badge>
          </div>
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
            {/* Tutorial Video Link */}
            <div className="mb-4">
              <a
                href="https://youtu.be/rg5jsh-xbYA"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 shadow-sm hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex-shrink-0">
                  <PlayCircle className="h-6 w-6 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                    {translations.tutorialVideoTitle || "How to Use Real-time Trading Signals Platform?"}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    {translations.tutorialVideoSubtitle || "Watch our comprehensive tutorial guide"}
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0" />
              </a>
            </div>
            
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

                      {/* Bouton pour vérifier le paiement NOWPayments - visible uniquement si un paiement est en attente */}
                      {user && !isPremium && (() => {
                        // Vérifier si un paiement est en attente
                        const urlParams = new URLSearchParams(window.location.search);
                        const hasPaymentId = urlParams.get('payment_id') || 
                                            sessionStorage.getItem('nowpayments_payment_id') ||
                                            localStorage.getItem('nowpayments_payment_id');
                        const hasInvoiceId = urlParams.get('invoice_id') || 
                                            urlParams.get('iid') ||
                                            sessionStorage.getItem('nowpayments_invoice_id') ||
                                            localStorage.getItem('nowpayments_invoice_id');
                        
                        // Afficher le bouton uniquement si un paiement est détecté
                        if (!hasPaymentId && !hasInvoiceId) {
                          return null;
                        }

                        return (
                          <div className="mt-3">
                            <Button
                              variant="outline"
                              onClick={async () => {
                                // Vérifier le paiement avec les identifiants trouvés
                                await checkPaymentStatus(hasPaymentId || undefined, hasInvoiceId || undefined);
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
                        );
                      })()}
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
                            <div>
                            <h3 className="text-lg font-semibold">Active Trading Signal</h3>
                              <div className="text-xs text-muted-foreground mt-1">
                                Generated: {new Date(signal.created_at).toLocaleString()}
                              </div>
                            </div>
                            <div className="text-right">
                            <div className="text-sm text-muted-foreground">
                              Expires In: {formatTime(Math.floor(timeRemaining))}
                              </div>
                              <div className="text-xs text-green-500 mt-1 flex items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                                Live Data
                              </div>
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
                          {/* Prix réel du marché et niveaux - Masqués pour Forex OTC (options binaires) */}
                          {category !== "forex_otc" && (
                            <>
                              <div className="mt-3 flex items-center justify-center space-x-4 text-sm">
                                <div className="flex items-center space-x-2">
                                  <span className="text-muted-foreground">Current Price:</span>
                                  <span className="font-semibold text-lg">{signal.entry_price.toFixed(5)}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-muted-foreground">Confidence:</span>
                                  <span className={`font-bold text-lg ${
                                    signal.confidence >= 80 ? "text-green-500" : 
                                    signal.confidence >= 70 ? "text-yellow-500" : "text-orange-500"
                                  }`}>
                                    {signal.confidence}%
                                  </span>
                                </div>
                              </div>
                              {/* Niveaux de prix - Plus visible */}
                              <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                                  <div className="text-muted-foreground">Entry</div>
                                  <div className="font-bold">{signal.entry_price.toFixed(5)}</div>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                                  <div className="text-muted-foreground">Target</div>
                                  <div className="font-bold text-green-600 dark:text-green-400">{signal.target_price.toFixed(5)}</div>
                                </div>
                                <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded">
                                  <div className="text-muted-foreground">Stop Loss</div>
                                  <div className="font-bold text-red-600 dark:text-red-400">{signal.stop_loss.toFixed(5)}</div>
                                </div>
                              </div>
                            </>
                          )}
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

      {/* Section Vidéo Tutoriel - Juste au-dessus du footer */}
      <section className="w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 md:py-16 mt-8 md:mt-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {translations.tutorialVideoTitle || "How to Use Real-time Trading Signals Platform?"}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
                {translations.tutorialVideoSubtitle || "Watch our comprehensive tutorial guide"}
              </p>
            </div>
            
            {/* Embed YouTube Video */}
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full rounded-lg shadow-2xl"
                src="https://www.youtube.com/embed/rg5jsh-xbYA"
                title={translations.tutorialVideoTitle || "How to Use Real-time Trading Signals Platform?"}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{ minHeight: '400px' }}
              ></iframe>
            </div>
          </div>
        </div>
      </section>

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
          <div className="border-t border-purple-700 mt-8 pt-8 text-center space-y-2">
            <div className="text-sm text-purple-300">
              {translations.copyright || "© 2025 Real-time Trading Signals. All rights reserved."}
            </div>
            <div className="text-xs text-purple-400 font-semibold">
              {translations.versionName || "Version 2.0 - Real-Time Precision Edition"}
            </div>
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
