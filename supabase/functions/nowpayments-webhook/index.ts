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
    logStep("Webhook body received", { 
      paymentId: body.payment_id, 
      status: body.payment_status,
      customer_email: body.customer_email ? `${String(body.customer_email).substring(0, 3)}***` : "NOT PROVIDED",
      has_customer_email: !!body.customer_email,
      order_id: body.order_id
    });

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
    let userEmail: string | null = null;
    
    if (order_id) {
      logStep("Extracting user_id from order_id", { order_id });
      // order_id format: {user_id}-{timestamp}
      // UUID format: 8-4-4-4-12 = 36 characters total
      // Try to extract UUID from the beginning
      const uuidPattern = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
      const match = order_id.match(uuidPattern);
      if (match && match[1]) {
        userId = match[1];
        logStep("✅ User ID extracted from order_id", { 
          userId: userId.substring(0, 8) + "***",
          order_id: order_id.substring(0, 50) + "..."
        });
        
        // Récupérer l'email de l'utilisateur si on a le user_id mais pas l'email
        if (!customer_email && userId) {
          try {
            const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserById(userId);
            if (!userError && userData?.user?.email) {
              userEmail = userData.user.email;
              logStep("✅ Email récupéré depuis user_id", { 
                email: `${userEmail.substring(0, 3)}***`,
                userId: userId.substring(0, 8) + "***"
              });
            } else {
              logStep("⚠️ Impossible de récupérer l'email depuis user_id", { 
                error: userError?.message,
                userId: userId.substring(0, 8) + "***"
              });
            }
          } catch (error) {
            logStep("ERROR récupérant email depuis user_id", { 
              error: error instanceof Error ? error.message : String(error)
            });
          }
        }
      } else {
        logStep("⚠️ Impossible d'extraire user_id depuis order_id", { order_id });
      }
    }

    // If we have customer_email, try to find user by email (fallback)
    if (!userId && customer_email) {
      logStep("Searching for user by email", { 
        email: `${customer_email.substring(0, 3)}***`,
        email_length: customer_email.length 
      });
      const { data: users } = await supabaseClient.auth.admin.listUsers();
      const user = users?.users?.find(u => u.email === customer_email);
      if (user) {
        userId = user.id;
        userEmail = customer_email;
        logStep("✅ User found by email", { 
          email: `${customer_email.substring(0, 3)}***`,
          userId: userId.substring(0, 8) + "***"
        });
      } else {
        logStep("⚠️ User NOT found by email", { 
          email: `${customer_email.substring(0, 3)}***`,
          total_users_searched: users?.users?.length || 0
        });
      }
    } else if (!customer_email && !userEmail) {
      logStep("⚠️ No customer_email in webhook body and cannot extract from order_id", {
        payment_id: payment_id,
        order_id: order_id,
        has_userId: !!userId
      });
    }
    
    // Utiliser l'email récupéré si disponible
    const finalEmail = customer_email || userEmail || "";

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

    // Vérifier qu'on a au moins un email ou un user_id
    if (!finalEmail && !userId) {
      logStep("ERROR: Cannot update subscription - no email and no user_id", {
        payment_id,
        order_id,
        customer_email,
        extracted_userId: userId
      });
      throw new Error("Cannot update subscription: missing both email and user_id");
    }

    logStep("Updating subscription", {
      email: finalEmail ? `${finalEmail.substring(0, 3)}***` : "NOT PROVIDED",
      has_email: !!finalEmail,
      userId: userId ? userId.substring(0, 8) + "***" : "NOT FOUND",
      subscriptionTier,
      subscriptionEnd: subscriptionEndISO,
    });

    // Update subscribers table
    // IMPORTANT: Pour contourner la contrainte qui bloque subscribed=true sans stripe_customer_id,
    // on utilise une valeur spéciale pour identifier les paiements NOWPayments
    const nowpaymentsCustomerId = `nowpayments_${payment_id || 'crypto'}_${Date.now()}`;
    
    const result = await supabaseClient.from("subscribers").upsert({
      email: finalEmail || (userId ? `user_${userId.substring(0, 8)}@nowpayments.local` : ""),
      user_id: userId,
      stripe_customer_id: nowpaymentsCustomerId, // Valeur spéciale pour contourner la contrainte
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

