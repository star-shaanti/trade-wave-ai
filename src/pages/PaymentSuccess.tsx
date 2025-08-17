import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { checkSubscription, isPremium, subscriptionLoading } = useAuth();
  const { toast } = useToast();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    // Check subscription status after payment with retry logic
    const verifyPayment = async () => {
      setVerifying(true);
      let retryCount = 0;
      const maxRetries = 3;
      
      const attemptVerification = async () => {
        try {
          await checkSubscription();
          
          // Wait a bit for the state to update
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if subscription is now active
          if (isPremium) {
            toast({
              title: "Bienvenue dans Premium !",
              description: "Votre abonnement est maintenant actif. Profitez des signaux de trading premium !",
            });
            setVerifying(false);
            return;
          } else if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Tentative ${retryCount} de vérification de l'abonnement...`);
            setTimeout(attemptVerification, 2000); // Retry after 2 seconds
          } else {
            toast({
              title: "Vérification en cours",
              description: "Votre paiement a été traité. L'abonnement sera activé sous peu.",
            });
            setVerifying(false);
          }
        } catch (error) {
          console.error("Erreur lors de la vérification de l'abonnement:", error);
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(attemptVerification, 2000);
          } else {
            toast({
              title: "Paiement réussi",
              description: "Votre paiement a été traité. L'abonnement sera activé sous peu.",
            });
            setVerifying(false);
          }
        }
      };
      
      attemptVerification();
    };

    verifyPayment();
  }, [checkSubscription, isPremium, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Paiement réussi !</h1>
          <p className="text-muted-foreground mb-6">
            Merci pour votre achat. Vous avez maintenant accès aux signaux de trading premium.
          </p>
          
          {verifying && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Vérification de l'abonnement...</span>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            <Button
              onClick={() => navigate("/")}
              className="w-full"
              disabled={verifying}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux signaux de trading
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;