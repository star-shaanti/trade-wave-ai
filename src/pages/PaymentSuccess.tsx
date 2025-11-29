import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { checkSubscription, isPremium, subscriptionLoading } = useAuth();
  const { toast } = useToast();
  const [verifying, setVerifying] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Marquer que l'utilisateur vient de payer
    sessionStorage.setItem('fromPaymentSuccess', 'true');
    
    // Extraire l'invoice_id et payment_id depuis l'URL si disponibles
    const urlParams = new URLSearchParams(window.location.search);
    const invoiceId = urlParams.get('iid') || urlParams.get('invoice_id');
    const paymentId = urlParams.get('payment_id') || urlParams.get('paymentId');
    
    if (invoiceId) {
      sessionStorage.setItem('nowpayments_invoice_id', invoiceId);
      localStorage.setItem('nowpayments_invoice_id', invoiceId);
    }
    if (paymentId) {
      sessionStorage.setItem('nowpayments_payment_id', paymentId);
      localStorage.setItem('nowpayments_payment_id', paymentId);
    }
    
    // Check subscription status after payment with retry logic
    const verifyPayment = async () => {
      setVerifying(true);
      let retryCount = 0;
      const maxRetries = 5; // Augmenté le nombre de tentatives
      
      // Étape 1: Vérifier et activer le paiement NOWPayments si on a les identifiants
      if (invoiceId || paymentId) {
        try {
          console.log('Vérification du paiement NOWPayments...', { invoiceId, paymentId });
          
          const session = await supabase.auth.getSession();
          if (session.data.session?.access_token) {
            const { data: paymentData, error: paymentError } = await supabase.functions.invoke('check-nowpayments-payment', {
              body: {
                ...(paymentId && { payment_id: paymentId }),
                ...(invoiceId && { invoice_id: invoiceId })
              },
              headers: {
                Authorization: `Bearer ${session.data.session.access_token}`,
              },
            });

            if (paymentError) {
              console.error('Erreur lors de la vérification du paiement:', paymentError);
              // Continuer quand même avec la vérification d'abonnement
            } else if (paymentData?.subscription_activated) {
              console.log('Paiement vérifié et abonnement activé via check-nowpayments-payment');
              // Attendre un peu pour que la base de données se mette à jour
              await new Promise(resolve => setTimeout(resolve, 2000));
            } else {
              console.log('Statut du paiement:', paymentData?.payment_status);
            }
          }
        } catch (error) {
          console.error('Erreur lors de l\'appel à check-nowpayments-payment:', error);
          // Continuer quand même avec la vérification d'abonnement
        }
      }
      
      const attemptVerification = async () => {
        try {
          await checkSubscription();
          
          // Wait a bit for the state to update
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Check if subscription is now active
          if (isPremium) {
            toast({
              title: "Bienvenue dans Premium !",
              description: "Votre abonnement est maintenant actif. Redirection vers les signaux...",
            });
            setVerifying(false);
            setRedirecting(true);
            
            // Redirection automatique après 2 secondes
            setTimeout(() => {
              navigate("/");
            }, 2000);
            return;
          } else if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Tentative ${retryCount} de vérification de l'abonnement...`);
            setTimeout(attemptVerification, 3000); // Retry after 3 seconds
          } else {
            toast({
              title: "Paiement traité avec succès",
              description: "Votre abonnement sera activé sous peu. Redirection automatique...",
            });
            setVerifying(false);
            setRedirecting(true);
            
            // Redirection automatique même si la vérification échoue
            setTimeout(() => {
              navigate("/");
            }, 3000);
          }
        } catch (error) {
          console.error("Erreur lors de la vérification de l'abonnement:", error);
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(attemptVerification, 3000);
          } else {
            toast({
              title: "Paiement réussi",
              description: "Votre paiement a été traité. Redirection vers les signaux...",
            });
            setVerifying(false);
            setRedirecting(true);
            
            // Redirection automatique même en cas d'erreur
            setTimeout(() => {
              navigate("/");
            }, 3000);
          }
        }
      };
      
      attemptVerification();
    };

    verifyPayment();
  }, [checkSubscription, isPremium, toast, navigate]);

  // Redirection automatique après 30 secondes maximum
  useEffect(() => {
    const autoRedirect = setTimeout(() => {
      if (!redirecting) {
        setRedirecting(true);
        toast({
          title: "Redirection automatique",
          description: "Redirection vers les signaux de trading...",
        });
        navigate("/");
      }
    }, 30000);

    return () => clearTimeout(autoRedirect);
  }, [redirecting, navigate, toast]);

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

          {redirecting && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Redirection vers les signaux...</span>
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
              {redirecting ? "Redirection en cours..." : "Retour aux signaux de trading"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;