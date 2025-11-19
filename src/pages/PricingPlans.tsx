import React from "react";
import { Button } from "@/components/ui/button";
import { Check, X, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/hooks/useLanguage";
import { getTranslations } from "@/lib/translations";

type Plan = {
  name: string;
  price: string;
  priceId: string;
  amount: number;
  fiatAmount: number;
  features: string[];
  popular: boolean;
};

const baseCryptoOptions = [
  {
    label: "USDT (Solana)",
    value: "usdtsol",
    bgClass: "bg-[#26A17B]",
    hoverClass: "hover:bg-[#1f8a69]",
    accentClass: "bg-white/30 text-[#0f4a37]",
  },
  {
    label: "ETH",
    value: "eth",
    bgClass: "bg-gradient-to-r from-[#3C3C3D] to-[#5C5C5C]",
    hoverClass: "hover:from-[#2b2b2b] hover:to-[#4a4a4a]",
    accentClass: "bg-white/30 text-white",
  },
  {
    label: "SOL",
    value: "sol",
    bgClass: "bg-gradient-to-r from-[#9945FF] via-[#14F195] to-[#00FFA3]",
    hoverClass: "hover:brightness-95",
    accentClass: "bg-black/20 text-black",
  },
];

const btcOption = {
  label: "BTC",
  value: "btc",
  bgClass: "bg-[#F7931A]",
  hoverClass: "hover:bg-[#d27b16]",
  accentClass: "bg-white/30 text-[#5f3a0c]",
};

const getCryptoOptionsForPlan = (planName: string) =>
  planName === "24-Hour Pass" ? baseCryptoOptions : [...baseCryptoOptions, btcOption];

const CryptoIcon = ({ label, accentClass }: { label: string; accentClass: string }) => (
  <span
    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${accentClass}`}
  >
    {label.slice(0, 3).toUpperCase()}
  </span>
);

const PricingPlans = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { selectedLanguage } = useLanguage();
  const t = getTranslations(selectedLanguage);



  const plans: Plan[] = [
    {
      name: "24-Hour Pass",
      price: "$9",
      priceId: "price_1ReZ3qEHHHdPbMaz8UPrXcAk",
      amount: 900,
      fiatAmount: 9,
      features: [
        "Full access to signals",
        "All asset classes", 
        "AI-powered analysis"
      ],
      popular: false
    },
    {
      name: "48-Hour Pass", 
      price: "$14",
      priceId: "price_1ReZ2nEHHHdPbMazWCU2qQgx",
      amount: 1400,
      fiatAmount: 14,
      features: [
        "Full access to signals",
        "All asset classes",
        "AI-powered analysis"
      ],
      popular: false
    },
    {
      name: "Weekly",
      price: "$35", 
      priceId: "price_1ReZ4TEHHHdPbMazNiX4iOFk",
      amount: 3500,
      fiatAmount: 35,
      features: [
        "Full access to signals",
        "All asset classes",
        "AI-powered analysis"
      ],
      popular: true
    },
    {
      name: "Monthly",
      price: "$99.00",
      priceId: "price_1ReZ54EHHHdPbMazyJYlIbzx",
      amount: 9900,
      fiatAmount: 99,
      features: [
        "Full access to signals",
        "All asset classes",
        "AI-powered analysis"
      ],
      popular: false
    }
  ];

  const getStripeLoadingId = (plan: Plan) => `stripe-${plan.priceId}`;
  const getCryptoLoadingId = (plan: Plan, currency?: string) =>
    `crypto-${plan.priceId}-${currency ?? "default"}`;

  const handleSubscribe = async (plan: Plan) => {
    setError(null);

    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to subscribe to a plan",
        variant: "destructive"
      });
      return;
    }

    if (!user?.email) {
      setError("User email missing");
      return;
    }

    const stripeLoadingId = getStripeLoadingId(plan);
    setLoadingPlan(stripeLoadingId);
    
    try {
      const session = await supabase.auth.getSession();
      
      if (!session.data.session?.access_token) {
        throw new Error("Session expired. Please sign in again.");
      }

      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          priceId: plan.priceId,
          amount: plan.amount,
          planName: plan.name,
          email: user.email
        },
        headers: {
          Authorization: `Bearer ${session.data.session.access_token}`,
        },
      });

      // Vérifier les erreurs du SDK Supabase
      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`Supabase error: ${error.message || 'Edge Function returned a non-2xx status code'}`);
      }

      // Vérifier si data existe et contient une erreur (cas où Edge Function retourne 500 mais pas d'erreur SDK)
      if (!data) {
        throw new Error("No response from payment service. Please try again.");
      }

      if (data.error) {
        console.error('Edge Function error response:', data.error);
        throw new Error(data.error || "Payment service error. Please try again or contact support.");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.url) {
        // Sauvegarder les infos dans sessionStorage pour le tracking
        sessionStorage.setItem('subscriptionPlan', plan.name);
        sessionStorage.setItem('subscriptionAmount', (plan.amount / 100).toString());
        sessionStorage.setItem('userEmail', user.email);
        sessionStorage.setItem('userName', user.user_metadata?.full_name || user.email);
        window.location.href = data.url;
      } else {
        throw new Error("No redirect URL received from payment service.");
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      const errorMessage = error.message || "Unknown error during payment session creation. Please try again or contact support.";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleCryptoPayment = async (plan: Plan, payCurrency?: string) => {
    setError(null);

    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to subscribe to a plan",
        variant: "destructive"
      });
      return;
    }

    if (!user?.email) {
      setError("User email missing");
      return;
    }

    const cryptoLoadingId = getCryptoLoadingId(plan, payCurrency);
    setLoadingPlan(cryptoLoadingId);

    try {
      const session = await supabase.auth.getSession();

      const { data, error } = await supabase.functions.invoke("create-nowpayments-invoice", {
        body: {
          planName: plan.name,
          fiatAmount: plan.fiatAmount,
          origin: window.location.origin,
          customerEmail: user.email,
          payCurrency,
        },
        headers: {
          Authorization: `Bearer ${session.data.session?.access_token}`,
        },
      });

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.invoice_url) {
        window.location.href = data.invoice_url;
      } else {
        throw new Error("No invoice URL received");
      }
    } catch (error: any) {
      const errorMessage = error.message || "Unknown error during crypto invoice creation";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to signals
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{t.pricingTitle}</h1>
          <p className="text-lg text-muted-foreground">
            {t.pricingSubtitle}
          </p>
        </div>



        {/* Error Display */}
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertDescription>
              <strong>Error:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative bg-card border rounded-lg p-6 ${
                plan.popular ? 'border-primary shadow-lg' : 'border-border'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                    ⭐ Most popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-primary mb-2">
                  {plan.name}
                </h3>
                <div className="text-3xl font-bold mb-4">
                  {plan.price}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => handleSubscribe(plan)}
                disabled={loadingPlan === getStripeLoadingId(plan)}
                className={`w-full ${
                  plan.popular 
                    ? 'bg-primary hover:bg-primary/90' 
                    : 'bg-primary/90 hover:bg-primary'
                } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loadingPlan === getStripeLoadingId(plan) ? 'Loading...' : 
                 !isAuthenticated ? 'Sign in first' : t.buyWithStripe}
              </Button>

              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t.buyWithLabel}
              </p>

              <div className="mt-3 grid grid-cols-1 gap-2">
                {getCryptoOptionsForPlan(plan.name).map((option) => (
                  <Button
                    key={option.value}
                    variant="secondary"
                    onClick={() => handleCryptoPayment(plan, option.value)}
                    disabled={loadingPlan === getCryptoLoadingId(plan, option.value)}
                    className={`w-full justify-start gap-3 px-4 text-white ${option.bgClass} ${option.hoverClass} ${
                      !isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loadingPlan === getCryptoLoadingId(plan, option.value)
                      ? 'Loading...'
                      : !isAuthenticated ? 'Sign in first' : (
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            <CryptoIcon label={option.label} accentClass={option.accentClass} />
                            <div className="text-left">
                              <div className="text-sm font-semibold leading-tight">{option.label}</div>
                              <div className="text-xs text-white/80">{t.cryptoInstantTagline}</div>
                            </div>
                          </div>
                          <span className="text-xs font-semibold uppercase tracking-wide">
                            {t.cryptoPayCta}
                          </span>
                        </div>
                      )}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            All plans include access to real-time signals, technical analysis, and market insights.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingPlans;