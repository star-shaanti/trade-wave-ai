import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-NOWPAYMENTS-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const apiKey = Deno.env.get("NOWPAYMENTS_API_KEY");
    if (!apiKey) {
      throw new Error("NOWPAYMENTS_API_KEY not configured");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authorization header missing" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { data: userData } = await supabaseClient.auth.getUser(token);
    if (!userData?.user?.id) {
      return new Response(JSON.stringify({ error: "User not authenticated" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const { payment_id, invoice_id } = await req.json();
    
    let actualPaymentId = payment_id;
    
    // Si on a un invoice_id mais pas de payment_id, récupérer le payment depuis l'invoice
    if (!actualPaymentId && invoice_id) {
      logStep("Fetching payment from invoice", { invoice_id });
      const invoiceResponse = await fetch(`https://api.nowpayments.io/v1/invoice/${invoice_id}`, {
        method: "GET",
        headers: {
          "x-api-key": apiKey,
        },
      });
      
      if (invoiceResponse.ok) {
        const invoiceData = await invoiceResponse.json();
        if (invoiceData.payment_id) {
          actualPaymentId = invoiceData.payment_id;
          logStep("Payment ID found from invoice", { payment_id: actualPaymentId });
        }
      }
    }
    
    if (!actualPaymentId) {
      return new Response(JSON.stringify({ error: "payment_id or invoice_id is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    logStep("Checking payment status", { payment_id: actualPaymentId });

    // Check payment status via NOWPayments API
    const response = await fetch(`https://api.nowpayments.io/v1/payment/${actualPaymentId}`, {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`NOWPayments API error: ${errorData}`);
    }

    const payment = await response.json();
    logStep("Payment status retrieved", { 
      payment_id: payment.payment_id, 
      status: payment.payment_status,
      price_amount: payment.price_amount,
      actually_paid: payment.actually_paid
    });

    // Vérifier si le paiement est partiel mais suffisant
    const actuallyPaid = Number(payment.actually_paid) || 0;
    const priceAmount = Number(payment.price_amount) || 0;
    const isFullyPaid = actuallyPaid >= priceAmount * 0.95; // 95% de tolérance

    // If payment is finished or partially paid with sufficient amount, process it
    const shouldProcess = payment.payment_status === "finished" || 
                         payment.payment_status === "confirmed" ||
                         (payment.payment_status === "Partially_paid" && isFullyPaid);
    
    if (shouldProcess) {
      const serviceRoleClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      // Extract user_id from order_id
      let userId: string | null = userData.user.id;
      if (payment.order_id) {
        const parts = payment.order_id.split("-");
        if (parts.length > 0) {
          const possibleUserId = parts.slice(0, 5).join("-");
          if (possibleUserId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            userId = possibleUserId;
          }
        }
      }

      // Find user by email if needed
      if (!userId && payment.customer_email) {
        const { data: users } = await serviceRoleClient.auth.admin.listUsers();
        const user = users?.users?.find(u => u.email === payment.customer_email);
        if (user) {
          userId = user.id;
        }
      }

      // Determine subscription tier
      let subscriptionTier: string | null = null;
      const amount = Number(payment.price_amount) || 0;
      
      if (amount <= 9) {
        subscriptionTier = "Basic";
      } else if (amount <= 19) {
        subscriptionTier = "Premium";
      } else {
        subscriptionTier = "Enterprise";
      }

      // Calculate subscription end date
      const subscriptionEnd = new Date();
      subscriptionEnd.setDate(subscriptionEnd.getDate() + 30);
      const subscriptionEndISO = subscriptionEnd.toISOString();

      // Update subscribers table
      const result = await serviceRoleClient.from("subscribers").upsert({
        email: payment.customer_email || userData.user.email || "",
        user_id: userId,
        stripe_customer_id: null,
        subscribed: true,
        subscription_tier: subscriptionTier,
        subscription_end: subscriptionEndISO,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });

      if (result.error) {
        logStep("ERROR updating database", { error: result.error.message });
        throw new Error(`Database update failed: ${result.error.message}`);
      }

      logStep("Successfully updated subscription", {
        email: payment.customer_email || userData.user.email,
        subscribed: true,
        subscriptionTier,
      });

      return new Response(JSON.stringify({
        payment_status: payment.payment_status,
        processed: true,
        subscription_activated: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

      // Retourner des informations détaillées sur le statut
      const paymentPercentage = priceAmount > 0 ? (actuallyPaid / priceAmount) * 100 : 0;
      const needsMorePayment = payment.payment_status === "Partially_paid" && !isFullyPaid;
      
      return new Response(JSON.stringify({
        payment_status: payment.payment_status,
        processed: false,
        subscription_activated: false,
        needs_more_payment: needsMorePayment,
        payment_percentage: Math.round(paymentPercentage * 100) / 100,
        payment: {
          payment_id: payment.payment_id,
          payment_status: payment.payment_status,
          price_amount: payment.price_amount,
          actually_paid: payment.actually_paid,
          pay_currency: payment.pay_currency,
        },
        message: needsMorePayment 
          ? `Paiement partiel: ${Math.round(paymentPercentage)}% payé. Veuillez compléter le paiement pour activer l'abonnement.`
          : `Statut: ${payment.payment_status}. Le webhook sera traité automatiquement une fois le paiement confirmé.`
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

