import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-NOWPAYMENTS-INVOICE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authorization header missing" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user?.id) {
      return new Response(JSON.stringify({ error: "User not authenticated" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const { planName, fiatAmount, origin, customerEmail, payCurrency } = await req.json();

    if (!planName || typeof planName !== "string") {
      throw new Error("Missing or invalid plan name");
    }

    if (fiatAmount === undefined || isNaN(Number(fiatAmount))) {
      throw new Error("Missing or invalid fiat amount");
    }

    const apiKey = Deno.env.get("NOWPAYMENTS_API_KEY");
    if (!apiKey) {
      throw new Error("NOWPayments API key not configured");
    }

    const siteUrl = origin || Deno.env.get("PUBLIC_SITE_URL") || "https://example.com";
    const successUrl = `${siteUrl}/payment-success?method=nowpayments`;
    const cancelUrl = `${siteUrl}/pricing`;

    const payload: Record<string, unknown> = {
      price_amount: Number(fiatAmount),
      price_currency: "usd",
      order_id: `${user.id}-${Date.now()}`,
      order_description: `Subscription ${planName}`,
      success_url: successUrl,
      cancel_url: cancelUrl,
    };

    const ipnUrl = Deno.env.get("NOWPAYMENTS_IPN_URL");
    if (ipnUrl) {
      payload.ipn_callback_url = ipnUrl;
    }

    if (customerEmail) {
      payload.customer_email = customerEmail;
    }

    const allowedCurrencies = new Set(["btc", "eth"]);
    if (payCurrency && allowedCurrencies.has(payCurrency)) {
      payload.pay_currency = payCurrency;
    }

    const response = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`NOWPayments API error: ${errorData}`);
    }

    const invoice = await response.json();
    
    logStep("Invoice created successfully", {
      invoice_keys: Object.keys(invoice),
      invoice_id: invoice.id,
      invoice_invoice_id: invoice.invoice_id,
      invoice_url: invoice.invoice_url,
      invoice_status: invoice.status || invoice.invoice_status,
      order_id: invoice.order_id,
      price_amount: invoice.price_amount
    });
    
    // Extraire l'invoice_id - NOWPayments peut utiliser différents champs
    let invoiceId = invoice.id || invoice.invoice_id || invoice.invoiceId;
    
    // Si on n'a pas d'invoice_id dans la réponse, essayer de l'extraire de l'URL
    if (!invoiceId && invoice.invoice_url) {
      try {
        const url = new URL(invoice.invoice_url);
        const iidFromUrl = url.searchParams.get('iid') || url.searchParams.get('invoice_id');
        if (iidFromUrl) {
          invoiceId = iidFromUrl;
          logStep("Invoice ID extracted from URL", { invoice_id: invoiceId });
        }
        
        // L'invoice_id peut aussi être dans le path de l'URL
        const pathParts = url.pathname.split('/');
        const possibleInvoiceId = pathParts[pathParts.length - 1];
        if (possibleInvoiceId && possibleInvoiceId.match(/^\d+$/)) {
          invoiceId = possibleInvoiceId;
          logStep("Invoice ID extracted from URL path", { invoice_id: invoiceId });
        }
      } catch (e) {
        logStep("Could not extract invoice_id from URL", { error: e instanceof Error ? e.message : String(e) });
      }
    }
    
    logStep("Final invoice_id determined", { invoice_id: invoiceId, user_email: customerEmail });

    // Ajouter l'email comme paramètre dans l'URL de l'invoice pour pré-remplir le champ
    let invoiceUrl = invoice.invoice_url;
    if (customerEmail && invoiceUrl) {
      try {
        const url = new URL(invoiceUrl);
        url.searchParams.set("email", customerEmail);
        invoiceUrl = url.toString();
      } catch (e) {
        // Si l'URL n'est pas valide, utiliser l'URL originale
        logStep("Could not modify invoice URL", { error: e instanceof Error ? e.message : String(e) });
      }
    }

    if (!invoiceId) {
      logStep("WARNING: No invoice_id found in response", { invoice_full_response: JSON.stringify(invoice).substring(0, 500) });
    }

    return new Response(
      JSON.stringify({
        invoice_url: invoiceUrl,
        invoice_id: invoiceId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

