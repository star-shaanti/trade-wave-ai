import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[NOWPAYMENTS-WEBHOOK] ${step}${detailsStr}`);
};

// Helper function to verify NOWPayments IPN signature
async function verifySignature(body: any, signature: string | null, secretKey: string): Promise<boolean> {
  if (!signature) {
    logStep("No signature provided");
    return false;
  }

  try {
    // Sort body parameters by key and convert to JSON string
    const sortedBody = Object.keys(body)
      .sort()
      .reduce((acc: any, key) => {
        acc[key] = body[key];
        return acc;
      }, {});
    
    const bodyString = JSON.stringify(sortedBody);
    
    // Generate HMAC SHA-512 signature
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretKey);
    const messageData = encoder.encode(bodyString);
    
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    );
    
    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
    const generatedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
    
    // Compare signatures (case-insensitive)
    return generatedSignature.toLowerCase() === signature.toLowerCase();
  } catch (error) {
    logStep("Error verifying signature", { error: error instanceof Error ? error.message : String(error) });
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    // Get IPN secret key from environment
    const ipnSecretKey = Deno.env.get("NOWPAYMENTS_IPN_SECRET_KEY");
    if (!ipnSecretKey) {
      logStep("WARNING: NOWPAYMENTS_IPN_SECRET_KEY not set, skipping signature verification");
    }

    // Get signature from header
    const signature = req.headers.get("x-nowpayments-sig");

    // Use service role key to update database
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const body = await req.json();
    logStep("Webhook body received", { paymentId: body.payment_id, status: body.payment_status });

    // Verify signature if secret key is configured
    if (ipnSecretKey) {
      const isValid = await verifySignature(body, signature, ipnSecretKey);
      if (!isValid) {
        logStep("Invalid signature, rejecting webhook");
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        });
      }
      logStep("Signature verified successfully");
    }

    // NOWPayments IPN callback structure
    // https://documenter.getpostman.com/view/7907941/T1LJjU52#a0b3e1a1-6c3e-4a3e-9c3e-1a1a1a1a1a1a
    const {
      payment_id,
      invoice_id,
      order_id,
      payment_status,
      price_amount,
      price_currency,
      pay_amount,
      pay_currency,
      customer_email,
      payment_description,
      created_at,
      updated_at,
    } = body;

    // Process "finished" payments and "confirmed" payments (which are also complete)
    // Also handle "Partially_paid" if the amount paid is sufficient
    const actuallyPaid = Number(body.actually_paid) || 0;
    const priceAmount = Number(price_amount) || 0;
    const isFullyPaid = actuallyPaid >= priceAmount * 0.95; // Allow 5% tolerance for crypto fluctuations
    
    if (payment_status !== "finished" && payment_status !== "confirmed") {
      // For partially paid, check if amount is sufficient
      if (payment_status === "Partially_paid" && isFullyPaid) {
        logStep("Partially paid but amount sufficient, processing", { 
          payment_status, 
          actually_paid: actuallyPaid, 
          price_amount: priceAmount 
        });
      } else {
        logStep("Payment not finished/confirmed, ignoring", { 
          payment_status, 
          actually_paid: actuallyPaid, 
          price_amount: priceAmount 
        });
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }

    logStep("Processing finished payment", { payment_id, order_id, customer_email });

    // Extract user_id from order_id (format: user_id-timestamp)
    let userId: string | null = null;
    if (order_id) {
      const parts = order_id.split("-");
      if (parts.length > 0) {
        // Try to find user by UUID pattern (8-4-4-4-12)
        // order_id format: {user_id}-{timestamp}
        const possibleUserId = parts.slice(0, 5).join("-");
        if (possibleUserId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          userId = possibleUserId;
        }
      }
    }

    // If we have customer_email, try to find user by email
    if (!userId && customer_email) {
      const { data: users } = await supabaseClient.auth.admin.listUsers();
      const user = users?.users?.find(u => u.email === customer_email);
      if (user) {
        userId = user.id;
        logStep("Found user by email", { email: customer_email, userId });
      }
    }

    // Determine subscription tier from price
    let subscriptionTier: string | null = null;
    const amount = Number(price_amount) || 0;
    
    if (amount <= 9) {
      subscriptionTier = "Basic";
    } else if (amount <= 19) {
      subscriptionTier = "Premium";
    } else {
      subscriptionTier = "Enterprise";
    }

    // Calculate subscription end date (30 days from now for one-time payments)
    const subscriptionEnd = new Date();
    subscriptionEnd.setDate(subscriptionEnd.getDate() + 30);
    const subscriptionEndISO = subscriptionEnd.toISOString();

    logStep("Updating subscription", {
      email: customer_email,
      userId,
      subscriptionTier,
      subscriptionEnd: subscriptionEndISO,
    });

    // Update subscribers table
    const result = await supabaseClient.from("subscribers").upsert({
      email: customer_email || "",
      user_id: userId,
      stripe_customer_id: null, // No Stripe customer for crypto payments
      subscribed: true,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEndISO,
      payment_source: 'nowpayments', // SÉCURITÉ: Marquer comme paiement NOWPayments vérifié
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' });

    if (result.error) {
      logStep("ERROR updating database", { error: result.error.message });
      throw new Error(`Database update failed: ${result.error.message}`);
    }

    logStep("Successfully updated subscription", {
      email: customer_email,
      subscribed: true,
      subscriptionTier,
    });

    return new Response(JSON.stringify({ received: true, processed: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

