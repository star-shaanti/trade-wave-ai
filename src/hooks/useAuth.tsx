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
      console.log("Pas d'utilisateur, pas de vérification d'abonnement");
      return;
    }
    
    console.log(`Vérification de l'abonnement pour: ${session.user?.email}`);
    setSubscriptionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error("Error checking subscription:", error);
        setSubscriptionData({ subscribed: false });
        return;
      }

      const subscriptionData = data || { subscribed: false };
      console.log(`Abonnement trouvé dans subscribers: ${subscriptionData.subscribed}`);
      setSubscriptionData(subscriptionData);
    } catch (error) {
      console.error("Subscription check failed:", error);
      setSubscriptionData({ subscribed: false });
    } finally {
      setSubscriptionLoading(false);
    }
  }, [session?.access_token, session?.user?.email]);

  // Vérification plus fréquente après paiement
  const checkSubscriptionWithRetry = useCallback(async (maxRetries = 5) => {
    if (!session?.access_token) return;
    
    console.log(`Tentative de vérification de l'abonnement pour: ${session.user?.email}`);
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        console.log(`Tentative ${i + 1} de vérification de l'abonnement...`);
        
        setSubscriptionLoading(true);
        const { data, error } = await supabase.functions.invoke('check-subscription', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (error) {
          console.error("Error checking subscription:", error);
          setSubscriptionData({ subscribed: false });
        } else {
          const newSubscriptionData = data || { subscribed: false };
          console.log(`Abonnement trouvé dans subscribers: ${newSubscriptionData.subscribed}`);
          setSubscriptionData(newSubscriptionData);
          
          // Si l'abonnement est actif, on arrête les tentatives
          if (newSubscriptionData.subscribed) {
            console.log("Abonnement confirmé, arrêt des tentatives");
            break;
          }
        }
        
        setSubscriptionLoading(false);
        
        // Attendre avant la prochaine tentative
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } catch (error) {
        console.error(`Subscription check attempt ${i + 1} failed:`, error);
        setSubscriptionLoading(false);
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
    }
  }, [session?.access_token, session?.user?.email]);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // 🔒 SÉCURITÉ: Nettoyer les payment IDs si l'utilisateur change
        if (event === 'SIGNED_IN' && session?.user?.email) {
          const storedEmail = sessionStorage.getItem('nowpayments_user_email') || 
                              localStorage.getItem('nowpayments_user_email');
          
          if (storedEmail && storedEmail !== session.user.email) {
            console.log('[SÉCURITÉ] Nettoyage des IDs de paiement - email différent', {
              storedEmail,
              currentEmail: session.user.email
            });
            sessionStorage.removeItem('nowpayments_payment_id');
            sessionStorage.removeItem('nowpayments_invoice_id');
            sessionStorage.removeItem('nowpayments_user_email');
            localStorage.removeItem('nowpayments_payment_id');
            localStorage.removeItem('nowpayments_invoice_id');
            localStorage.removeItem('nowpayments_user_email');
          }
        }
        
        // Check subscription when user signs in
        if (event === 'SIGNED_IN' && session) {
          setTimeout(() => {
            checkSubscriptionWithRetry();
          }, 100);
        }
        
        // Clear subscription data when user signs out
        if (event === 'SIGNED_OUT') {
          setSubscriptionData({ subscribed: false });
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Check subscription for existing session
      if (session) {
        setTimeout(() => {
          checkSubscriptionWithRetry();
        }, 100);
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