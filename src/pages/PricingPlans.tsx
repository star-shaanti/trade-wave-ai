import React from "react";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PricingPlans = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "24-Hour Pass",
      price: "€7",
      priceId: "prix_1RrhKFEHHHdPbMazw8GHJobk",
      stripeUrl: "https://buy.stripe.com/6oUaEXfem4639DGf0pdfG0k",
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
      priceId: "prix_1RrhKFEHHHdPbMazw8GHJobk",
      stripeUrl: "https://buy.stripe.com/00wdR97LUfOLeY09G5dfG0j",
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
      priceId: "prix_1RrhIxEHHHdPbMazBeWWXRur",
      stripeUrl: "https://buy.stripe.com/4gM7sL9U25a78zC4lLdfG0i",
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
      priceId: "prix_1RrhH9EHHHdPbMazFfMVdz8E", 
      stripeUrl: "https://buy.stripe.com/fZudR93vE6ebcPSf0pdfG0h",
      features: [
        "Full access to signals",
        "All asset classes",
        "AI-powered analysis"
      ],
      popular: false
    }
  ];

  const handleSubscribe = (stripeUrl: string) => {
    window.open(stripeUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/src/assets/site-logo.png" alt="Logo" className="h-8 w-8" />
            <span className="text-xl font-bold">Trading Signals</span>
          </div>
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
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-lg text-muted-foreground">
            Unlock premium trading signals and elevate your strategy.
          </p>
        </div>

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
                    ⭐ Most Popular
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
                onClick={() => handleSubscribe(plan.stripeUrl)}
                className={`w-full ${
                  plan.popular 
                    ? 'bg-primary hover:bg-primary/90' 
                    : 'bg-primary/90 hover:bg-primary'
                }`}
              >
                Subscribe Now
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