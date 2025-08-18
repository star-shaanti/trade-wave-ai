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
    if (!session?.access_token) return;
    
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

      setSubscriptionData(data || { subscribed: false });
    } catch (error) {
      console.error("Subscription check failed:", error);
      setSubscriptionData({ subscribed: false });
    } finally {
      setSubscriptionLoading(false);
    }
  }, [session?.access_token]);

  // Vérification plus fréquente après paiement
  const checkSubscriptionWithRetry = useCallback(async (maxRetries = 3) => {
    if (!session?.access_token) return;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        await checkSubscription();
        
        // Si l'abonnement est actif, on arrête les tentatives
        if (subscriptionData.subscribed) {
          break;
        }
        
        // Attendre avant la prochaine tentative
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`Subscription check attempt ${i + 1} failed:`, error);
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
  }, [session?.access_token, checkSubscription, subscriptionData.subscribed]);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
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
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    }
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