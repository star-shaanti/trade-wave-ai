# Code complet pour Supabase Dashboard - create-payment

## Instructions :
1. Ouvrez Supabase Dashboard > Edge Functions > create-payment
2. Sélectionnez TOUT le code existant et supprimez-le
3. Copiez le code ci-dessous et collez-le dans l'éditeur
4. Cliquez sur "Deploy" ou "Save"

---

```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Vérifier les variables d'environnement critiques
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase configuration");
      return new Response(
        JSON.stringify({ error: "Server configuration error. Please contact support." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    if (!stripeSecretKey) {
      console.error("Missing Stripe configuration");
      return new Response(
        JSON.stringify({ error: "Payment service configuration error. Please contact support." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Create Supabase client using the anon key for user authentication (optional)
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // Parse request body avec gestion d'erreur
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (e) {
      console.error("Invalid request body:", e);
      return new Response(
        JSON.stringify({ error: "Invalid request format. Please try again." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const { priceId, amount, planName, email: bodyEmail } = requestBody;

    if (!priceId) {
      return new Response(
        JSON.stringify({ error: "Missing price ID. Please select a valid plan." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Récupérer l'utilisateur authentifié si un token est fourni, sinon fallback à l'email du body
    let userEmail: string | undefined = bodyEmail;
    const authHeader = req.headers.get("Authorization");
    
    if (authHeader) {
      try {
        const token = authHeader.replace("Bearer ", "");
        if (token && token !== "undefined" && token.length > 10) {
          const { data, error: authError } = await supabaseClient.auth.getUser(token);
          if (authError) {
            console.warn("Auth token error (using body email):", authError.message);
          } else if (data?.user?.email) {
            userEmail = data.user.email;
          }
        }
      } catch (e) {
        console.warn("Auth check failed (using body email):", e);
      }
    }

    if (!userEmail || !userEmail.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Valid email address required. Please sign in again." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Get origin from headers
    const origin = req.headers.get("origin") || req.headers.get("referer") || "https://realtimetradingsignals.com";

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Check if a Stripe customer record exists for this user
    let customerId;
    let customerCurrency = "usd"; // Default to USD
    
    try {
      const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        
        // Check existing subscriptions to determine currency
        try {
          const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            limit: 1
          });
          if (subscriptions.data.length > 0) {
            customerCurrency = subscriptions.data[0].currency || "usd";
          }
        } catch (e) {
          console.warn("Subscription lookup error (using default currency):", e);
        }
      }
    } catch (e) {
      console.error("Stripe customer lookup error:", e);
      // Continue without customer ID - Stripe will create one
    }

    // Create a subscription checkout session
    let session;
    try {
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        customer_email: customerId ? undefined : userEmail,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${origin}/payment-success`,
        cancel_url: `${origin}/pricing`,
        currency: customerCurrency,
        metadata: {
          user_email: userEmail,
          plan_name: planName || "Unknown",
          price_id: priceId,
          currency: customerCurrency
        }
      });

      if (!session.url) {
        throw new Error("Stripe session created but no URL returned");
      }
    } catch (e: any) {
      console.error("Stripe checkout session creation error:", e);
      return new Response(
        JSON.stringify({ 
          error: e.message?.includes("No such price") 
            ? "Invalid subscription plan. Please select a different plan." 
            : "Payment service temporarily unavailable. Please try again in a moment."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Unexpected error in create-payment:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "An unexpected error occurred. Please try again or contact support."
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
```

---

## Améliorations apportées :

✅ **Validation des variables d'environnement** - Vérifie que toutes les clés nécessaires sont présentes

✅ **Gestion d'erreurs robuste** - Messages d'erreur explicites pour chaque cas

✅ **Fallback pour l'authentification** - Utilise l'email du body si le token échoue

✅ **Gestion de la devise** - Détecte automatiquement la devise (USD par défaut, ou EUR si déjà utilisé)

✅ **Meilleur logging** - Console.error et console.warn pour faciliter le débogage

✅ **Gestion des erreurs Stripe** - Messages spécifiques pour les erreurs Stripe courantes

✅ **Validation des données** - Vérifie que priceId et email sont présents et valides

---

## Vérifications après déploiement :

1. Vérifiez que `STRIPE_SECRET_KEY` est défini dans Supabase Dashboard > Project Settings > Edge Functions > Secrets
2. Testez un abonnement sur votre site
3. Consultez les logs dans Supabase Dashboard > Edge Functions > create-payment > Logs

