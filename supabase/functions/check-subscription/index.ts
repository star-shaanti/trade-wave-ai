import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Déploiement automatique - vérification améliorée pour paiements crypto

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // === ÉTAPE 1: Vérifier Stripe (source de vérité #1) ===
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    let hasActiveStripeSub = false;
    let stripeCustomerId = null;
    let subscriptionTier = null;
    let subscriptionEnd = null;
    let paymentSource = null;

    if (customers.data.length > 0) {
      stripeCustomerId = customers.data[0].id;
      logStep("Found Stripe customer", { customerId: stripeCustomerId });

      const subscriptions = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: "active",
        limit: 1,
      });
      hasActiveStripeSub = subscriptions.data.length > 0;

      if (hasActiveStripeSub) {
        const subscription = subscriptions.data[0];
        subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
        const amount = subscription.items.data[0].price.unit_amount || 0;
        
        if (amount <= 999) {
          subscriptionTier = "Basic";
        } else if (amount <= 1999) {
          subscriptionTier = "Premium";
        } else {
          subscriptionTier = "Enterprise";
        }
        paymentSource = "stripe";
        logStep("Active Stripe subscription found", { subscriptionTier, subscriptionEnd });
      }
    }

    // === ÉTAPE 2: Vérifier la base de données (pour NOWPayments) ===
    let hasActiveSubFromDB = false;
    
    if (!hasActiveStripeSub) {
      const { data: existingSub } = await supabaseClient
        .from("subscribers")
        .select("*")
        .eq("email", user.email)
        .single();

      if (existingSub) {
        logStep("Found DB entry", { 
          subscribed: existingSub.subscribed,
          payment_source: existingSub.payment_source,
          stripe_customer_id: existingSub.stripe_customer_id,
          subscription_end: existingSub.subscription_end
        });

        // SÉCURITÉ: Accepter UNIQUEMENT si:
        // 1. A un stripe_customer_id valide, OU
        // 2. A payment_source = 'nowpayments' (créé par webhook vérifié)
        const hasValidPaymentProof = 
          existingSub.stripe_customer_id || 
          existingSub.payment_source === 'nowpayments';

        if (existingSub.subscribed && 
            existingSub.subscription_end && 
            hasValidPaymentProof) {
          const endDate = new Date(existingSub.subscription_end);
          if (endDate > new Date()) {
            hasActiveSubFromDB = true;
            subscriptionTier = existingSub.subscription_tier;
            subscriptionEnd = existingSub.subscription_end;
            stripeCustomerId = existingSub.stripe_customer_id;
            paymentSource = existingSub.payment_source || (existingSub.stripe_customer_id ? 'stripe' : null);
            logStep("Valid subscription from DB", { 
              subscriptionTier, 
              paymentSource,
              subscriptionEnd 
            });
          } else {
            logStep("Subscription expired", { endDate: existingSub.subscription_end });
          }
        } else if (existingSub.subscribed && !hasValidPaymentProof) {
          // SÉCURITÉ: Entrée suspecte sans preuve de paiement
          logStep("⚠️ SECURITY: Rejecting entry without payment proof", {
            email: user.email,
            subscribed: existingSub.subscribed,
            payment_source: existingSub.payment_source,
            stripe_customer_id: existingSub.stripe_customer_id
          });
        }
      }
    }

    const hasActiveSub = hasActiveStripeSub || hasActiveSubFromDB;

    // === ÉTAPE 3: Mettre à jour la base de données ===
    if (hasActiveSub) {
      // Mettre à jour avec les infos d'abonnement actif
      await supabaseClient.from("subscribers").upsert({
        email: user.email,
        user_id: user.id,
        stripe_customer_id: stripeCustomerId,
        subscribed: true,
        subscription_tier: subscriptionTier,
        subscription_end: subscriptionEnd,
        payment_source: paymentSource,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });
    } else {
      // Créer/mettre à jour l'entrée comme non abonné
      // NE PAS écraser payment_source s'il existe déjà
      const { data: existingEntry } = await supabaseClient
        .from("subscribers")
        .select("payment_source")
        .eq("email", user.email)
        .single();

      await supabaseClient.from("subscribers").upsert({
        email: user.email,
        user_id: user.id,
        stripe_customer_id: stripeCustomerId,
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
        payment_source: existingEntry?.payment_source || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });
    }

    logStep("Result", { subscribed: hasActiveSub, subscriptionTier, paymentSource });
    
    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      subscription_tier: hasActiveSub ? subscriptionTier : null,
      subscription_end: hasActiveSub ? subscriptionEnd : null
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
