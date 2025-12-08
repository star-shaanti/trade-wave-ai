import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Log all request details for debugging
  logStep("Request received", {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries()),
    hasBody: !!req.body
  });

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Processing webhook request");

    // Check if required environment variables are set
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeSecretKey) {
      logStep("ERROR: STRIPE_SECRET_KEY not set");
      return new Response(JSON.stringify({ error: "STRIPE_SECRET_KEY not configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    if (!webhookSecret) {
      logStep("ERROR: STRIPE_WEBHOOK_SECRET not set");
      return new Response(JSON.stringify({ error: "STRIPE_WEBHOOK_SECRET not configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      logStep("ERROR: Supabase configuration missing");
      return new Response(JSON.stringify({ error: "Supabase configuration missing" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, { 
      auth: { persistSession: false } 
    });

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      logStep("ERROR: No stripe signature found in headers");
      return new Response(JSON.stringify({ error: "No stripe signature found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("Webhook signature verified successfully", { eventType: event.type, eventId: event.id });
    } catch (err) {
      logStep("ERROR: Webhook signature verification failed", { error: err.message });
      return new Response(JSON.stringify({ error: "Webhook signature verification failed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    logStep("Processing event", { type: event.type, eventId: event.id });

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session, supabaseClient);
        break;
      
      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription, supabaseClient);
        break;
      
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, supabaseClient);
        break;
      
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabaseClient);
        break;
      
      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice, supabaseClient);
        break;
      
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice, supabaseClient);
        break;
      
      default:
        logStep("Unhandled event type", { type: event.type });
    }

    logStep("Webhook processed successfully", { eventType: event.type, eventId: event.id });
    return new Response(JSON.stringify({ received: true, eventType: event.type }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    logStep("ERROR in webhook processing", { error: error.message, stack: error.stack });
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session, supabaseClient: any) {
  logStep("Processing checkout.session.completed", { sessionId: session.id });
  
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2023-10-16",
  });
  
  if (session.mode === "subscription" && session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    await updateSubscriptionInDatabase(subscription, supabaseClient);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription, supabaseClient: any) {
  logStep("Processing customer.subscription.created", { subscriptionId: subscription.id });
  await updateSubscriptionInDatabase(subscription, supabaseClient);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabaseClient: any) {
  logStep("Processing customer.subscription.updated", { subscriptionId: subscription.id });
  await updateSubscriptionInDatabase(subscription, supabaseClient);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabaseClient: any) {
  logStep("Processing customer.subscription.deleted", { subscriptionId: subscription.id });
  
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2023-10-16",
  });
  
  const customer = await stripe.customers.retrieve(subscription.customer as string);
  if (customer.deleted) return;
  
  await supabaseClient.from("subscribers").upsert({
    email: customer.email,
    user_id: subscription.metadata.user_id || null,
    stripe_customer_id: customer.id,
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
    payment_source: 'stripe',
    updated_at: new Date().toISOString(),
  }, { onConflict: 'email' });
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice, supabaseClient: any) {
  logStep("Processing invoice.payment_succeeded", { invoiceId: invoice.id });
  
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2023-10-16",
  });
  
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    await updateSubscriptionInDatabase(subscription, supabaseClient);
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice, supabaseClient: any) {
  logStep("Processing invoice.payment_failed", { invoiceId: invoice.id });
  
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2023-10-16",
  });
  
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    await updateSubscriptionInDatabase(subscription, supabaseClient);
  }
}

async function updateSubscriptionInDatabase(subscription: Stripe.Subscription, supabaseClient: any) {
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2023-10-16",
  });
  
  const customer = await stripe.customers.retrieve(subscription.customer as string);
  if (customer.deleted) return;
  
  const isActive = subscription.status === "active";
  const subscriptionEnd = isActive ? new Date(subscription.current_period_end * 1000).toISOString() : null;
  
  // Determine subscription tier from price
  const priceId = subscription.items.data[0].price.id;
  const price = await stripe.prices.retrieve(priceId);
  const amount = price.unit_amount || 0;
  let subscriptionTier = null;
  
  if (amount <= 999) {
    subscriptionTier = "Basic";
  } else if (amount <= 1999) {
    subscriptionTier = "Premium";
  } else {
    subscriptionTier = "Enterprise";
  }
  
  logStep("Updating subscription in database", {
    email: customer.email,
    subscribed: isActive,
    subscriptionTier,
    subscriptionEnd
  });
  
  const result = await supabaseClient.from("subscribers").upsert({
    email: customer.email,
    user_id: subscription.metadata.user_id || null,
    stripe_customer_id: customer.id,
    subscribed: isActive,
    subscription_tier: subscriptionTier,
    subscription_end: subscriptionEnd,
    payment_source: 'stripe',
    updated_at: new Date().toISOString(),
  }, { onConflict: 'email' });
  
  if (result.error) {
    logStep("ERROR updating database", { error: result.error.message });
    throw new Error(`Database update failed: ${result.error.message}`);
  }
  
  logStep("Successfully updated subscription in database");
}
