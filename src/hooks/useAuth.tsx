import { useEffect, useState, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({ subscribed: false });
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  const checkSubscription = useCallback(async () => {
    if (!session?.access_token) {
      console.log("[AUTH] ❌ Pas de session/token, pas de vérification d'abonnement");
      setSubscriptionData({ subscribed: false });
      return;
    }
    
    console.log(`[AUTH] 🔍 Vérification de l'abonnement pour: ${session.user?.email}`);
    setSubscriptionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error("[AUTH] ❌ Erreur check-subscription:", error);
        setSubscriptionData({ subscribed: false });
        return;
      }

      // SÉCURITÉ: Toujours s'assurer que subscribed est un booléen
      const isSubscribed = data?.subscribed === true;
      const newSubscriptionData = {
        subscribed: isSubscribed,
        subscription_tier: isSubscribed ? data?.subscription_tier : undefined,
        subscription_end: isSubscribed ? data?.subscription_end : undefined
      };
      
      console.log(`[AUTH] 📊 Résultat check-subscription:`, {
        subscribed: isSubscribed,
        tier: newSubscriptionData.subscription_tier,
        end: newSubscriptionData.subscription_end,
        rawData: data
      });
      
      setSubscriptionData(newSubscriptionData);
    } catch (error) {
      console.error("[AUTH] ❌ Subscription check failed:", error);
      setSubscriptionData({ subscribed: false });
    } finally {
      setSubscriptionLoading(false);
    }
  }, [session?.access_token, session?.user?.email]);

  // ⚠️ CODE CRITIQUE - Ne pas modifier sans vérification complète
  // Cette fonction gère la vérification de l'abonnement avec retry après paiement crypto
  // Modifié le: 2025-12-13 - Fix paiements crypto (gestion session + retry)
  // Vérification plus fréquente après paiement
  const checkSubscriptionWithRetry = useCallback(async (maxRetries = 5) => {
    if (!session?.access_token) {
      console.log("[AUTH] ❌ Pas de session pour checkSubscriptionWithRetry");
      setSubscriptionData({ subscribed: false });
      return;
    }
    
    console.log(`[AUTH] 🔄 Début vérification avec retry pour: ${session.user?.email}`);
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        console.log(`[AUTH] 🔄 Tentative ${i + 1}/${maxRetries}...`);
        
        setSubscriptionLoading(true);
        const { data, error } = await supabase.functions.invoke('check-subscription', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (error) {
          console.error("[AUTH] ❌ Erreur lors de la vérification:", error);
          setSubscriptionData({ subscribed: false });
        } else {
          // SÉCURITÉ: Toujours s'assurer que subscribed est un booléen strict
          const isSubscribed = data?.subscribed === true;
          const newSubscriptionData = {
            subscribed: isSubscribed,
            subscription_tier: isSubscribed ? data?.subscription_tier : undefined,
            subscription_end: isSubscribed ? data?.subscription_end : undefined
          };
          
          console.log(`[AUTH] 📊 Résultat tentative ${i + 1}:`, {
            subscribed: isSubscribed,
            tier: newSubscriptionData.subscription_tier,
            rawResponse: data
          });
          
          setSubscriptionData(newSubscriptionData);
          
          // Si l'abonnement est actif, on arrête les tentatives
          if (isSubscribed) {
            console.log("[AUTH] ✅ Abonnement confirmé, arrêt des tentatives");
            break;
          }
        }
        
        setSubscriptionLoading(false);
        
        // Attendre avant la prochaine tentative
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } catch (error) {
        console.error(`[AUTH] ❌ Tentative ${i + 1} échouée:`, error);
        setSubscriptionLoading(false);
        setSubscriptionData({ subscribed: false });
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
    }
    
    console.log("[AUTH] 🏁 Fin de checkSubscriptionWithRetry");
  }, [session?.access_token, session?.user?.email]);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log(`[AUTH] 🔔 Auth state change: ${event}`, { 
          hasSession: !!session, 
          email: session?.user?.email 
        });
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // 🔒 SÉCURITÉ: TOUJOURS réinitialiser l'état d'abonnement au changement d'utilisateur
        if (event === 'SIGNED_IN') {
          // Réinitialiser l'abonnement à false jusqu'à vérification
          setSubscriptionData({ subscribed: false });
          console.log('[AUTH] 🔄 Abonnement réinitialisé à false en attendant vérification');
          
          // Nettoyer les IDs de paiement orphelins
          if (session?.user?.email) {
            const storedEmail = sessionStorage.getItem('payment_user_email') || 
                                localStorage.getItem('payment_user_email');
            
            // TOUJOURS nettoyer si pas d'email stocké OU si email différent
            if (!storedEmail || storedEmail !== session.user.email) {
              console.log('[AUTH] 🚫 Nettoyage des IDs de paiement (email différent ou absent)', {
                storedEmail: storedEmail || 'AUCUN',
                currentEmail: session.user.email
              });
              sessionStorage.removeItem('nowpayments_payment_id');
              sessionStorage.removeItem('nowpayments_invoice_id');
              sessionStorage.removeItem('nowpayments_user_email');
              sessionStorage.removeItem('payment_user_email');
              localStorage.removeItem('nowpayments_payment_id');
              localStorage.removeItem('nowpayments_invoice_id');
              localStorage.removeItem('nowpayments_user_email');
              localStorage.removeItem('payment_user_email');
            }
          }
          
          // Vérifier l'abonnement
          if (session?.access_token) {
            console.log('[AUTH] 🔍 Démarrage vérification abonnement après connexion...');
            // Attendre un peu pour s'assurer que la session est complètement chargée
            setTimeout(() => {
              if (session?.access_token) {
                checkSubscriptionWithRetry();
              } else {
                console.log('[AUTH] ⏳ Session pas encore prête, nouvelle tentative dans 500ms...');
                setTimeout(() => {
                  if (session?.access_token) {
                    checkSubscriptionWithRetry();
                  } else {
                    console.log('[AUTH] ❌ Session toujours pas prête après 600ms');
                  }
                }, 500);
              }
            }, 200);
          } else {
            console.log('[AUTH] ⏳ Pas de session/access_token disponible, vérification différée');
          }
        }
        
        // Clear subscription data when user signs out
        if (event === 'SIGNED_OUT') {
          console.log('[AUTH] 👋 Déconnexion - réinitialisation abonnement');
          setSubscriptionData({ subscribed: false });
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AUTH] 🔄 Session existante vérifiée:', { 
        hasSession: !!session, 
        email: session?.user?.email 
      });
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Check subscription for existing session
      if (session?.access_token) {
        console.log('[AUTH] 🔍 Démarrage vérification abonnement pour session existante...');
        // Attendre un peu pour s'assurer que tout est initialisé
        setTimeout(() => {
          if (session?.access_token) {
            checkSubscription();
          } else {
            console.log('[AUTH] ⏳ Access token perdu, nouvelle tentative...');
            setTimeout(() => {
              if (session?.access_token) {
                checkSubscription();
              }
            }, 500);
          }
        }, 100);
      } else {
        // Pas de session = pas d'abonnement
        console.log('[AUTH] ⏳ Pas de session/access_token pour vérification immédiate');
        setSubscriptionData({ subscribed: false });
      }
    });

    return () => subscription.unsubscribe();
  }, [checkSubscriptionWithRetry]);

  const signOut = async () => {
    // Utilise la déconnexion locale pour éviter les erreurs 403 quand la session serveur est manquante
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) {
      console.error("Error signing out:", error);
    }

    // Nettoyage côté client pour garantir l'état déconnecté
    setSession(null);
    setUser(null);
    setSubscriptionData({ subscribed: false });
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  };

  return {
    user,
    session,
    loading,
    signOut,
    signIn,
    signUp,
    isAuthenticated: !!user,
    subscriptionData,
    subscriptionLoading,
    checkSubscription,
    checkSubscriptionWithRetry,
    isPremium: subscriptionData.subscribed,
  };
};