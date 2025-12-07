import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { checkSubscription, isPremium, subscriptionLoading, user } = useAuth();
  const { toast } = useToast();
  const [verifying, setVerifying] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [affiliateTracked, setAffiliateTracked] = useState(false);

  // Fonction de suivi d'affiliation
  const trackAffiliateSignup = React.useCallback((userEmail: string, userName: string, subscriptionPrice = 99.99) => {
    // Récupérer le ref depuis l'URL d'abord, sinon depuis localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const affiliateIdFromUrl = urlParams.get('ref');
    const affiliateIdFromStorage = localStorage.getItem('affiliate_ref');
    const affiliateId = affiliateIdFromUrl || affiliateIdFromStorage;

    console.log('[AFFILIATION] 🔍 Recherche du ref:', {
      fromURL: affiliateIdFromUrl,
      fromStorage: affiliateIdFromStorage,
      final: affiliateId
    });

    if (!affiliateId) {
      console.log('[AFFILIATION] ⚠️ Aucun paramètre ref trouvé (ni dans l\'URL ni dans localStorage)');
      console.log('[AFFILIATION] 💡 Pour tester, ajoutez ?ref=VOTRE_ID à l\'URL');
      return;
    }

    console.log('[AFFILIATION] 📌 Utilisation du ref:', affiliateId, affiliateIdFromUrl ? '(depuis URL)' : '(depuis localStorage)');
    console.log('[AFFILIATION] 📤 Envoi de la requête d\'affiliation...');

    fetch('https://affiliate-trading-signals.com/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        affiliate_id: affiliateId,
        email: userEmail,
        name: userName,
        platform: 'realtime',
        subscription_price: subscriptionPrice
      })
    })
      .then(r => {
        console.log('[AFFILIATION] 📥 Réponse reçue, statut:', r.status);
        return r.json();
      })
      .then(d => {
        console.log('[AFFILIATION] 📋 Données reçues:', d);
        if (d.success) {
          console.log('[AFFILIATION] ✅ Commission:', d.commission + '€');
        } else {
          console.log('[AFFILIATION] ⚠️ Réponse non réussie:', d);
        }
      })
      .catch(error => {
        console.error('[AFFILIATION] ❌ Erreur lors de l\'envoi:', error);
      });
  }, []);

  useEffect(() => {
    // Marquer que l'utilisateur vient de payer
    sessionStorage.setItem('fromPaymentSuccess', 'true');
    
    // Vérifier et logger le ref d'affiliation au chargement de la page
    const storedRef = localStorage.getItem('affiliate_ref');
    console.log('[AFFILIATION] 🔍 Vérification du ref au chargement de PaymentSuccess:', {
      refFromStorage: storedRef,
      refFromURL: new URLSearchParams(window.location.search).get('ref'),
      userEmail: user?.email
    });
    
    // Extraire l'invoice_id et payment_id depuis l'URL si disponibles
    const urlParams = new URLSearchParams(window.location.search);
    // NP_id est l'identifiant de paiement/invoice retourné par NOWPayments dans l'URL de redirection
    const npId = urlParams.get('NP_id');
    const invoiceId = urlParams.get('iid') || urlParams.get('invoice_id');
    const paymentId = urlParams.get('payment_id') || urlParams.get('paymentId');
    
    // NP_id peut être un payment_id ou un invoice_id
    // Priorité : payment_id explicite > NP_id > invoice_id explicite
    // On n'utilise pas NP_id comme les deux en même temps pour éviter les conflits
    const finalPaymentId = paymentId || npId || null;
    const finalInvoiceId = invoiceId || (npId && !paymentId ? npId : null);
    
    // 🔒 SÉCURITÉ: Stocker l'email de l'utilisateur avec les IDs de paiement
    if (user?.email && (finalInvoiceId || finalPaymentId)) {
      sessionStorage.setItem('nowpayments_user_email', user.email);
      localStorage.setItem('nowpayments_user_email', user.email);
      console.log('Email utilisateur stocké pour sécurité:', user.email);
    }
    
    if (finalInvoiceId) {
      sessionStorage.setItem('nowpayments_invoice_id', finalInvoiceId);
      localStorage.setItem('nowpayments_invoice_id', finalInvoiceId);
      console.log('Invoice ID stocké:', finalInvoiceId);
    }
    if (finalPaymentId) {
      sessionStorage.setItem('nowpayments_payment_id', finalPaymentId);
      localStorage.setItem('nowpayments_payment_id', finalPaymentId);
      console.log('Payment ID stocké:', finalPaymentId);
    }
    
    // Check subscription status after payment with retry logic
    const verifyPayment = async () => {
      setVerifying(true);
      let retryCount = 0;
      const maxRetries = 5; // Augmenté le nombre de tentatives
      
      // Étape 1: Vérifier et activer le paiement NOWPayments si on a les identifiants
      if (finalInvoiceId || finalPaymentId) {
        try {
          console.log('Vérification du paiement NOWPayments...', { 
            invoiceId: finalInvoiceId, 
            paymentId: finalPaymentId,
            npId: npId,
            originalInvoiceId: invoiceId,
            originalPaymentId: paymentId
          });
          
          const session = await supabase.auth.getSession();
          if (session.data.session?.access_token) {
            // Essayer d'abord avec payment_id si disponible (priorité)
            // Sinon, essayer avec invoice_id
            // Ne pas envoyer les deux en même temps si c'est le même identifiant
            const requestBody: any = {};
            if (finalPaymentId) {
              requestBody.payment_id = finalPaymentId;
            } else if (finalInvoiceId) {
              requestBody.invoice_id = finalInvoiceId;
            }
            
            const { data: paymentData, error: paymentError } = await supabase.functions.invoke('check-nowpayments-payment', {
              body: requestBody,
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
              // Si le paiement est en attente, on continue quand même avec la vérification d'abonnement
              // car le webhook peut avoir déjà activé l'abonnement
              if (paymentData?.payment_status === "waiting") {
                console.log('Paiement en attente, vérification de l\'abonnement en cours...');
              }
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
            // Suivi d'affiliation après paiement réussi (une seule fois)
            if (user?.email && !affiliateTracked) {
              const userName = user.user_metadata?.display_name || user.user_metadata?.name || user.email.split('@')[0];
              // Récupérer le prix réel depuis sessionStorage, ou utiliser 99.99 par défaut
              const storedAmount = sessionStorage.getItem('subscriptionAmount');
              const subscriptionPrice = storedAmount ? parseFloat(storedAmount) : 99.99;
              
              console.log('[AFFILIATION] 🚀 Tentative de suivi d\'affiliation:', {
                userEmail: user.email,
                userName: userName,
                price: subscriptionPrice,
                refInStorage: localStorage.getItem('affiliate_ref')
              });
              
              trackAffiliateSignup(user.email, userName, subscriptionPrice);
              setAffiliateTracked(true);
            } else {
              console.log('[AFFILIATION] ⚠️ Suivi d\'affiliation non effectué:', {
                hasUser: !!user,
                hasEmail: !!user?.email,
                alreadyTracked: affiliateTracked
              });
            }

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
  }, [checkSubscription, isPremium, toast, navigate, user, trackAffiliateSignup, affiliateTracked]);

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