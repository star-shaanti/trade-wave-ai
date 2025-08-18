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

  // Debug: Afficher l'état d'authentification
  useEffect(() => {
    console.log("État d'authentification:", {
      user: user?.email,
      isAuthenticated,
      loading
    });
  }, [user, isAuthenticated, loading]);

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
    console.log("=== DÉBUT handleSubscribe ===");
    console.log("Plan cliqué:", plan.name);
    console.log("État actuel:", { user: user?.email, isAuthenticated, loading });
    setError(null);

    if (!isAuthenticated) {
      console.log("❌ Utilisateur non authentifié");
      toast({
        title: "Authentification requise",
        description: "Veuillez vous connecter pour souscrire à un forfait",
        variant: "destructive"
      });
      return;
    }

    if (!user?.email) {
      console.log("❌ Pas d'email utilisateur");
      setError("Email utilisateur manquant");
      return;
    }

    console.log("✅ Utilisateur authentifié:", user.email);
    setLoadingPlan(plan.priceId);
    
    try {
      console.log("📞 Appel de la fonction create-payment...");
      
      const session = await supabase.auth.getSession();
      console.log("Session obtenue:", !!session.data.session);

      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          priceId: plan.priceId,
          amount: plan.amount,
          planName: plan.name
        },
        headers: {
          Authorization: `Bearer ${session.data.session?.access_token}`,
        },
      });

      console.log("📥 Réponse de create-payment:", { data, error });

      if (error) {
        console.error("❌ Erreur Supabase:", error);
        throw new Error(`Erreur Supabase: ${error.message}`);
      }

      if (data?.url) {
        console.log("✅ Redirection vers:", data.url);
        window.location.href = data.url;
      } else {
        console.error("❌ Pas d'URL de redirection dans la réponse");
        throw new Error("Pas d'URL de redirection reçue");
      }
    } catch (error: any) {
      console.error("❌ Erreur complète:", error);
      const errorMessage = error.message || "Erreur inconnue lors de la création de la session de paiement";
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoadingPlan(null);
      console.log("=== FIN handleSubscribe ===");
    }
  };

  const handleButtonClick = (plan: typeof plans[0]) => {
    console.log("🖱️ Bouton cliqué pour:", plan.name);
    handleSubscribe(plan);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
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
            Retour aux signaux
          </Button>
          <div className="flex items-center gap-2">
            <img src="/src/assets/site-logo.png" alt="Logo" className="h-8 w-8" />
            <span className="text-xl font-bold">Signaux de Trading</span>
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
          <h1 className="text-4xl font-bold mb-4">Choisissez votre forfait</h1>
          <p className="text-lg text-muted-foreground">
            Débloquez les signaux de trading premium et améliorez votre stratégie.
          </p>
        </div>

        {/* Debug Info */}
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Informations de débogage:</h3>
          <p className="text-sm">
            <strong>Statut:</strong> {isAuthenticated ? "✅ Connecté" : "❌ Non connecté"}
          </p>
          <p className="text-sm">
            <strong>Email:</strong> {user?.email || "Aucun"}
          </p>
          <p className="text-sm">
            <strong>Loading:</strong> {loading ? "Oui" : "Non"}
          </p>
          <p className="text-sm">
            <strong>Boutons:</strong> {isAuthenticated ? "Cliquables" : "Désactivés"}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertDescription>
              <strong>Erreur:</strong> {error}
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
                    ⭐ Plus populaire
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
                {loadingPlan === plan.priceId ? 'Chargement...' : 
                 !isAuthenticated ? 'Se connecter d\'abord' : 'Souscrire maintenant'}
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            Tous les forfaits incluent l'accès aux signaux en temps réel, l'analyse technique et les insights de marché.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingPlans;