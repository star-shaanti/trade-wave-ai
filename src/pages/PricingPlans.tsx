import React from "react";
import { Button } from "@/components/ui/button";
import { Check, X, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const PricingPlans = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);



  const plans = [
    {
      name: "24-Hour Pass",
      price: "€7",
      priceId: "price_1RrhLMEHHHdPbMazyyK4L0Yi",
      amount: 700,
      features: [
        "Full access to signals",
        "All asset classes", 
        "AI-powered analysis"
      ],
      popular: false
    },
    {
      name: "48-Hour Pass", 
      price: "€12",
      priceId: "price_1RrhKFEHHHdPbMazw8GHJobk",
      amount: 1200,
      features: [
        "Full access to signals",
        "All asset classes",
        "AI-powered analysis"
      ],
      popular: false
    },
    {
      name: "Weekly",
      price: "€30", 
      priceId: "price_1RrhIxEHHHdPbMazBeWWXRur",
      amount: 3000,
      features: [
        "Full access to signals",
        "All asset classes",
        "AI-powered analysis"
      ],
      popular: true
    },
    {
      name: "Monthly",
      price: "€85",
      priceId: "price_1RrhH9EHHHdPbMazFfMVdz8E",
      amount: 8500,
      features: [
        "Full access to signals",
        "All asset classes",
        "AI-powered analysis"
      ],
      popular: false
    }
  ];

  const handleSubscribe = async (plan: typeof plans[0]) => {
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

    setLoadingPlan(plan.priceId);
    
    try {
      const session = await supabase.auth.getSession();

      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          priceId: plan.priceId,
          amount: plan.amount,
          planName: plan.name,
          email: user.email
        },
        headers: {
          Authorization: `Bearer ${session.data.session?.access_token}`,
        },
      });

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No redirect URL received");
      }
    } catch (error: any) {
      const errorMessage = error.message || "Unknown error during payment session creation";
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

  const handleButtonClick = (plan: typeof plans[0]) => {
    handleSubscribe(plan);
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
          <h1 className="text-4xl font-bold mb-4">Choose your plan</h1>
          <p className="text-lg text-muted-foreground">
            Unlock premium trading signals and improve your strategy.
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
                onClick={() => handleButtonClick(plan)}
                disabled={loadingPlan === plan.priceId}
                className={`w-full ${
                  plan.popular 
                    ? 'bg-primary hover:bg-primary/90' 
                    : 'bg-primary/90 hover:bg-primary'
                } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loadingPlan === plan.priceId ? 'Loading...' : 
                 !isAuthenticated ? 'Sign in first' : 'Subscribe now'}
              </Button>
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