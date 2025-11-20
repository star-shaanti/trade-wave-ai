import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Use the service role key to perform writes (upsert) in Supabase
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // First, check existing subscription in database (includes NOWPayments payments)
    const { data: existingSub } = await supabaseClient
      .from("subscribers")
      .select("*")
      .eq("email", user.email)
      .single();

    logStep("Existing subscription check", { 
      exists: !!existingSub, 
      subscribed: existingSub?.subscribed,
      subscription_end: existingSub?.subscription_end 
    });

    // Check if existing subscription is still valid (not expired)
    let hasActiveSubFromDB = false;
    let subscriptionTier = existingSub?.subscription_tier || null;
    let subscriptionEnd = existingSub?.subscription_end || null;

    if (existingSub?.subscribed && existingSub?.subscription_end) {
      const endDate = new Date(existingSub.subscription_end);
      const now = new Date();
      if (endDate > now) {
        hasActiveSubFromDB = true;
        logStep("Active subscription found in database", { 
          tier: subscriptionTier, 
          endDate: subscriptionEnd 
        });
      } else {
        logStep("Subscription expired", { endDate: subscriptionEnd });
      }
    }

    // Check Stripe subscriptions
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    let hasActiveStripeSub = false;
    let stripeCustomerId = null;

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
        logStep("Active Stripe subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd });
        
        // Determine subscription tier from price
        const priceId = subscription.items.data[0].price.id;
        const amount = subscription.items.data[0].price.unit_amount || 0;
        
        if (amount <= 999) {
          subscriptionTier = "Basic";
        } else if (amount <= 1999) {
          subscriptionTier = "Premium";
        } else {
          subscriptionTier = "Enterprise";
        }
        logStep("Determined subscription tier from Stripe", { priceId, amount, subscriptionTier });
      } else {
        logStep("No active Stripe subscription found");
      }
    } else {
      logStep("No Stripe customer found");
    }

    // Use the most recent/active subscription (Stripe takes precedence if both exist)
    const hasActiveSub = hasActiveStripeSub || hasActiveSubFromDB;
    
    // If Stripe subscription exists, use its data; otherwise keep database data
    if (!hasActiveStripeSub && hasActiveSubFromDB) {
      // Keep existing database subscription data
      logStep("Using database subscription data", { tier: subscriptionTier, endDate: subscriptionEnd });
    }

    const upsertResult = await supabaseClient.from("subscribers").upsert({
      email: user.email,
      user_id: user.id,
      stripe_customer_id: stripeCustomerId,
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' });

    if (upsertResult.error) {
      logStep("ERROR updating database", { error: upsertResult.error.message });
      throw new Error(`Database update failed: ${upsertResult.error.message}`);
    }

    logStep("Successfully updated database with subscription info", { 
      subscribed: hasActiveSub, 
      subscriptionTier,
      email: user.email,
      userId: user.id 
    });
    
    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});