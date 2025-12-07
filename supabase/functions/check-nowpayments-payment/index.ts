import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Logging helper function for debugging
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

    let requestBody;
    try {
      const bodyText = await req.text();
      logStep("Request body received", { bodyLength: bodyText.length, bodyPreview: bodyText.substring(0, 200) });
      
      if (!bodyText || bodyText.trim().length === 0) {
        logStep("WARNING: Empty request body");
        requestBody = {};
      } else {
        requestBody = JSON.parse(bodyText);
      }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      logStep("ERROR parsing request body", { error: errorMsg });
      return new Response(JSON.stringify({ 
        error: "Invalid request body",
        message: "Le corps de la requête est invalide ou vide. Veuillez vérifier que invoice_id ou payment_id est fourni.",
        processed: false,
        subscription_activated: false
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    const { payment_id, invoice_id } = requestBody;
    
    // Normaliser les valeurs - s'assurer qu'on n'a pas de chaînes vides
    const normalizedPaymentId = payment_id && typeof payment_id === 'string' && payment_id.trim() ? payment_id.trim() : null;
    const normalizedInvoiceId = invoice_id && typeof invoice_id === 'string' && invoice_id.trim() ? invoice_id.trim() : null;
    
    logStep("Request received", { 
      payment_id: normalizedPaymentId, 
      invoice_id: normalizedInvoiceId,
      original_payment_id: payment_id,
      original_invoice_id: invoice_id,
      user_id: userData.user.id,
      user_email: userData.user.email
    });
    
    // IMPORTANT: Vérifier d'abord si l'utilisateur est déjà abonné
    // Le webhook peut avoir déjà traité le paiement même si l'invoice n'existe plus
    const serviceRoleClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    const { data: existingSubscription, error: subscriptionError } = await serviceRoleClient
      .from("subscribers")
      .select("*")
      .eq("email", userData.user.email || "")
      .single();
    
    if (subscriptionError && subscriptionError.code !== "PGRST116") { // PGRST116 = no rows returned
      logStep("ERROR checking existing subscription", { error: subscriptionError.message });
    } else if (existingSubscription && existingSubscription.subscribed) {
      const subscriptionEnd = existingSubscription.subscription_end 
        ? new Date(existingSubscription.subscription_end) 
        : null;
      const isSubscriptionActive = subscriptionEnd && subscriptionEnd > new Date();
      
      logStep("User already has subscription", {
        subscribed: existingSubscription.subscribed,
        subscription_tier: existingSubscription.subscription_tier,
        subscription_end: existingSubscription.subscription_end,
        is_active: isSubscriptionActive
      });
      
      if (isSubscriptionActive) {
        // L'utilisateur est déjà abonné - le webhook a probablement déjà traité le paiement
        return new Response(JSON.stringify({
          payment_status: "already_processed",
          processed: true,
          subscription_activated: true,
          already_subscribed: true,
          message: "Votre abonnement est déjà actif. Le paiement a été traité avec succès."
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }
    
    let actualPaymentId = normalizedPaymentId;
    let invoiceData: any = null;
    
    // Si on a un invoice_id mais pas de payment_id, récupérer le payment depuis l'invoice
    if (!actualPaymentId && normalizedInvoiceId) {
      logStep("Fetching payment from invoice", { invoice_id: normalizedInvoiceId });
      try {
        const invoiceResponse = await fetch(`https://api.nowpayments.io/v1/invoice/${normalizedInvoiceId}`, {
          method: "GET",
          headers: {
            "x-api-key": apiKey,
          },
        });
        
        logStep("Invoice API response", { 
          status: invoiceResponse.status, 
          ok: invoiceResponse.ok,
          invoice_id: normalizedInvoiceId 
        });
        
        if (invoiceResponse.ok) {
          invoiceData = await invoiceResponse.json();
          logStep("Invoice data retrieved", { 
            invoice_id: normalizedInvoiceId, 
            invoice_keys: Object.keys(invoiceData),
            status: invoiceData.status,
            invoice_status: invoiceData.invoice_status,
            payment_id: invoiceData.payment_id,
            payment_status: invoiceData.payment_status,
            full_data: JSON.stringify(invoiceData).substring(0, 500) // Log partiel pour debug
          });
          
          if (invoiceData.payment_id) {
            actualPaymentId = invoiceData.payment_id;
            logStep("Payment ID found from invoice", { payment_id: actualPaymentId });
          } else {
            // Vérifier si l'invoice est payée même sans payment_id
            // NOWPayments peut utiliser différents noms de champs pour le statut
            const invoiceStatus = (invoiceData.status || invoiceData.invoice_status || "").toLowerCase();
            const paymentStatus = (invoiceData.payment_status || "").toLowerCase();
            
            logStep("Checking invoice payment status", { 
              invoice_id: normalizedInvoiceId,
              invoiceStatus,
              paymentStatus,
              has_payment_id: !!invoiceData.payment_id
            });
            
            const isInvoicePaid = invoiceStatus === "paid" || 
                                 invoiceStatus === "finished" || 
                                 invoiceStatus === "confirmed" ||
                                 invoiceStatus === "completed" ||
                                 paymentStatus === "finished" ||
                                 paymentStatus === "confirmed" ||
                                 paymentStatus === "paid";
            
            logStep("Invoice payment check result", { invoice_id: normalizedInvoiceId, isInvoicePaid });
            
            if (isInvoicePaid) {
              logStep("Invoice is paid but no payment_id - activating subscription directly", { invoice_id: normalizedInvoiceId, invoice_status: invoiceStatus });
              
              // 🔒 SÉCURITÉ: Vérifier que l'utilisateur qui appelle est bien celui qui a payé
              const invoiceEmail = (invoiceData.customer_email || "").toLowerCase().trim();
              const currentUserEmail = (userData.user.email || "").toLowerCase().trim();
              
              // Extraire et vérifier le user_id de l'order_id
              let orderUserId: string | null = null;
              if (invoiceData.order_id) {
                const parts = invoiceData.order_id.split("-");
                if (parts.length >= 5) {
                  const possibleUserId = parts.slice(0, 5).join("-");
                  if (possibleUserId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                    orderUserId = possibleUserId;
                  }
                }
              }
              
              // Vérifier que l'utilisateur correspond
              const emailMatches = invoiceEmail && currentUserEmail && invoiceEmail === currentUserEmail;
              const userIdMatches = orderUserId && orderUserId === userData.user.id;
              
              logStep("Security check", {
                invoiceEmail,
                currentUserEmail,
                emailMatches,
                orderUserId,
                currentUserId: userData.user.id,
                userIdMatches
              });
              
              // 🚫 BLOQUER si ni l'email ni le user_id ne correspondent
              if (!emailMatches && !userIdMatches) {
                logStep("🚨 SECURITY BLOCK: User mismatch - invoice belongs to different user", {
                  invoice_id: normalizedInvoiceId,
                  invoiceEmail,
                  currentUserEmail,
                  orderUserId,
                  currentUserId: userData.user.id
                });
                
                return new Response(JSON.stringify({
                  error: "Accès non autorisé",
                  message: "Ce paiement n'appartient pas à votre compte. Veuillez utiliser le compte avec lequel vous avez effectué le paiement.",
                  payment_status: "unauthorized",
                  processed: false,
                  subscription_activated: false
                }), {
                  headers: { ...corsHeaders, "Content-Type": "application/json" },
                  status: 403,
                });
              }
              
              // Utiliser l'email vérifié
              const emailToUse = invoiceEmail || currentUserEmail;
              const userId = orderUserId || userData.user.id;

              // Determine subscription tier
              let subscriptionTier: string | null = null;
              const amount = Number(invoiceData.price_amount) || 0;
              
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
                email: emailToUse,
                user_id: userId,
                stripe_customer_id: null,
                subscribed: true,
                subscription_tier: subscriptionTier,
                subscription_end: subscriptionEndISO,
                updated_at: new Date().toISOString(),
              }, { onConflict: 'email' });

              if (result.error) {
                logStep("ERROR updating database from invoice", { error: result.error.message });
                throw new Error(`Database update failed: ${result.error.message}`);
              }

              logStep("✅ Successfully updated subscription from invoice", {
                email: emailToUse,
                subscribed: true,
                subscriptionTier,
              });

              return new Response(JSON.stringify({
                payment_status: invoiceData.payment_status || "finished",
                processed: true,
                subscription_activated: true,
                from_invoice: true
              }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
              });
            } else {
              logStep("Invoice found but not paid yet", { invoice_id: normalizedInvoiceId, invoice_status: invoiceData.status });
              return new Response(JSON.stringify({
                error: "Paiement en attente",
                message: "L'invoice a été créée mais le paiement n'a pas encore été complété. Veuillez patienter quelques instants.",
                payment_status: "waiting",
                invoice_status: invoiceData.status || "pending",
                processed: false,
                subscription_activated: false
              }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
              });
            }
          }
        } else if (invoiceResponse.status === 404) {
          logStep("Invoice not found as invoice - trying as payment_id", { 
            invoice_id: normalizedInvoiceId,
            user_email: userData.user.email 
          });
          
          // Si l'invoice n'existe pas (404), essayer de l'utiliser comme payment_id
          // NP_id peut être un payment_id plutôt qu'un invoice_id
          try {
            logStep("Trying invoice_id as payment_id", { id: normalizedInvoiceId });
            const paymentResponse = await fetch(`https://api.nowpayments.io/v1/payment/${normalizedInvoiceId}`, {
              method: "GET",
              headers: {
                "x-api-key": apiKey,
              },
            });
            
            if (paymentResponse.ok) {
              // C'était un payment_id, pas un invoice_id !
              logStep("Found payment using invoice_id as payment_id", { payment_id: normalizedInvoiceId });
              actualPaymentId = normalizedInvoiceId;
              // Continuer avec la logique de vérification du payment plus bas
            } else {
              // Ce n'est ni un invoice_id ni un payment_id
              logStep("Not found as payment_id either - checking if user is already subscribed", { 
                invoice_id: normalizedInvoiceId,
                user_email: userData.user.email 
              });
              
              // Si l'invoice n'existe pas (404), vérifier à nouveau si l'utilisateur est déjà abonné
              // Le webhook peut avoir déjà traité le paiement et l'invoice peut avoir été supprimée
              const { data: subscriptionCheck, error: checkError } = await serviceRoleClient
                .from("subscribers")
                .select("*")
                .eq("email", userData.user.email || "")
                .single();
              
              if (!checkError && subscriptionCheck && subscriptionCheck.subscribed) {
                const subscriptionEnd = subscriptionCheck.subscription_end 
                  ? new Date(subscriptionCheck.subscription_end) 
                  : null;
                const isActive = subscriptionEnd && subscriptionEnd > new Date();
                
                if (isActive) {
                  logStep("User is already subscribed despite 404 invoice/payment - webhook processed payment", {
                    invoice_id: normalizedInvoiceId,
                    subscription_tier: subscriptionCheck.subscription_tier
                  });
                  
                  return new Response(JSON.stringify({ 
                    payment_status: "already_processed",
                    processed: true,
                    subscription_activated: true,
                    already_subscribed: true,
                    message: "Votre abonnement est déjà actif. Le paiement a été traité avec succès par le webhook.",
                    invoice_id: normalizedInvoiceId
                  }), {
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                    status: 200,
                  });
                }
              }
              
              // L'invoice n'existe pas et l'utilisateur n'est pas encore abonné
              logStep("Invoice/payment not found and user not subscribed yet", { invoice_id: normalizedInvoiceId });
              return new Response(JSON.stringify({ 
                error: "Invoice introuvable",
                message: "L'invoice n'a pas été trouvée dans NOWPayments. Elle peut ne pas exister encore ou avoir été supprimée. Le webhook activera automatiquement l'abonnement une fois le paiement confirmé.",
                payment_status: "not_found",
                invoice_id: normalizedInvoiceId,
                processed: false,
                subscription_activated: false
              }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200, // Retourner 200 pour ne pas bloquer l'utilisateur
              });
            }
          } catch (paymentError) {
            const errorMsg = paymentError instanceof Error ? paymentError.message : String(paymentError);
            logStep("Error checking invoice_id as payment_id", { invoice_id: normalizedInvoiceId, error: errorMsg });
            // Continuer avec la logique normale
          }
        } else {
          const errorText = await invoiceResponse.text();
          logStep("Error fetching invoice", { invoice_id: normalizedInvoiceId, status: invoiceResponse.status, error: errorText });
          return new Response(JSON.stringify({ 
            error: "Erreur lors de la récupération de l'invoice",
            message: `L'API NOWPayments a retourné une erreur: ${invoiceResponse.status}`,
            processed: false,
            subscription_activated: false
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200, // Retourner 200 pour ne pas bloquer l'utilisateur
          });
        }
      } catch (invoiceError) {
        const errorMsg = invoiceError instanceof Error ? invoiceError.message : String(invoiceError);
        logStep("Exception while fetching invoice", { invoice_id: normalizedInvoiceId, error: errorMsg, stack: invoiceError instanceof Error ? invoiceError.stack : undefined });
        // En cas d'erreur, retourner un message informatif au lieu de continuer silencieusement
        return new Response(JSON.stringify({
          error: "Erreur lors de la récupération de l'invoice",
          message: `Une erreur s'est produite lors de la vérification de l'invoice. Veuillez réessayer dans quelques instants.`,
          payment_status: "error",
          processed: false,
          subscription_activated: false
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200, // Retourner 200 pour ne pas bloquer l'utilisateur
        });
      }
    }
    
    if (!actualPaymentId && !normalizedInvoiceId) {
      logStep("ERROR: No payment_id or invoice_id provided");
      return new Response(JSON.stringify({ error: "payment_id or invoice_id is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    if (!actualPaymentId && normalizedInvoiceId) {
      // Si on n'a toujours pas de payment_id après avoir essayé avec l'invoice
      logStep("No payment_id found, returning waiting status", { invoice_id: normalizedInvoiceId });
      return new Response(JSON.stringify({
        error: "Paiement en attente",
        message: "Le paiement n'a pas encore été initié. Veuillez patienter quelques instants et réessayer.",
        payment_status: "waiting",
        invoice_id: normalizedInvoiceId,
        processed: false,
        subscription_activated: false
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("Checking payment status", { payment_id: actualPaymentId });

    // Check payment status via NOWPayments API
    let response = await fetch(`https://api.nowpayments.io/v1/payment/${actualPaymentId}`, {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
      },
    });

    // Si le payment_id n'existe pas (404) et qu'on a un invoice_id, essayer avec l'invoice
    if (!response.ok && response.status === 404 && normalizedInvoiceId && normalizedInvoiceId !== actualPaymentId) {
      logStep("Payment ID not found, trying with invoice_id as fallback", { 
        payment_id: actualPaymentId, 
        invoice_id: normalizedInvoiceId 
      });
      
      // Réessayer avec l'invoice_id
      try {
        const invoiceResponse = await fetch(`https://api.nowpayments.io/v1/invoice/${normalizedInvoiceId}`, {
          method: "GET",
          headers: {
            "x-api-key": apiKey,
          },
        });
        
        if (invoiceResponse.ok) {
          invoiceData = await invoiceResponse.json();
          logStep("Invoice found as fallback", { 
            invoice_id: normalizedInvoiceId,
            invoice_status: invoiceData.status,
            payment_id_from_invoice: invoiceData.payment_id
          });
          
          if (invoiceData.payment_id) {
            actualPaymentId = invoiceData.payment_id;
            logStep("Using payment_id from invoice", { payment_id: actualPaymentId });
            
            // Réessayer avec le payment_id de l'invoice
            response = await fetch(`https://api.nowpayments.io/v1/payment/${actualPaymentId}`, {
              method: "GET",
              headers: {
                "x-api-key": apiKey,
              },
            });
          } else {
            // Pas de payment_id dans l'invoice, vérifier si l'invoice est payée directement
            const invoiceStatus = (invoiceData.status || invoiceData.invoice_status || "").toLowerCase();
            const paymentStatus = (invoiceData.payment_status || "").toLowerCase();
            const isInvoicePaid = invoiceStatus === "paid" || 
                                 invoiceStatus === "finished" || 
                                 invoiceStatus === "confirmed" ||
                                 invoiceStatus === "completed" ||
                                 paymentStatus === "finished" ||
                                 paymentStatus === "confirmed" ||
                                 paymentStatus === "paid";
            
            if (isInvoicePaid) {
              logStep("Invoice is paid, activating subscription from invoice fallback", { invoice_id: normalizedInvoiceId });
              
              // 🔒 SÉCURITÉ: Vérifier que l'utilisateur est bien celui qui a payé
              const invoiceEmailFb = (invoiceData.customer_email || "").toLowerCase().trim();
              const currentUserEmailFb = (userData.user.email || "").toLowerCase().trim();
              
              let orderUserIdFb: string | null = null;
              if (invoiceData.order_id) {
                const parts = invoiceData.order_id.split("-");
                if (parts.length >= 5) {
                  const possibleUserId = parts.slice(0, 5).join("-");
                  if (possibleUserId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                    orderUserIdFb = possibleUserId;
                  }
                }
              }
              
              const emailMatchesFb = invoiceEmailFb && currentUserEmailFb && invoiceEmailFb === currentUserEmailFb;
              const userIdMatchesFb = orderUserIdFb && orderUserIdFb === userData.user.id;
              
              logStep("Security check (fallback)", { invoiceEmailFb, currentUserEmailFb, emailMatchesFb, orderUserIdFb, userIdMatchesFb });
              
              // 🚫 BLOQUER si ni l'email ni le user_id ne correspondent
              if (!emailMatchesFb && !userIdMatchesFb) {
                logStep("🚨 SECURITY BLOCK (fallback): User mismatch", { invoice_id: normalizedInvoiceId });
                return new Response(JSON.stringify({
                  error: "Accès non autorisé",
                  message: "Ce paiement n'appartient pas à votre compte.",
                  payment_status: "unauthorized",
                  processed: false,
                  subscription_activated: false
                }), {
                  headers: { ...corsHeaders, "Content-Type": "application/json" },
                  status: 403,
                });
              }
              
              const emailToUseFb = invoiceEmailFb || currentUserEmailFb;
              const userId = orderUserIdFb || userData.user.id;

              let subscriptionTier: string | null = null;
              const amount = Number(invoiceData.price_amount) || 0;
              
              if (amount <= 9) {
                subscriptionTier = "Basic";
              } else if (amount <= 19) {
                subscriptionTier = "Premium";
              } else {
                subscriptionTier = "Enterprise";
              }

              const subscriptionEnd = new Date();
              subscriptionEnd.setDate(subscriptionEnd.getDate() + 30);
              const subscriptionEndISO = subscriptionEnd.toISOString();

              const result = await serviceRoleClient.from("subscribers").upsert({
                email: emailToUseFb,
                user_id: userId,
                stripe_customer_id: null,
                subscribed: true,
                subscription_tier: subscriptionTier,
                subscription_end: subscriptionEndISO,
                updated_at: new Date().toISOString(),
              }, { onConflict: 'email' });

              if (result.error) {
                logStep("ERROR updating database from invoice fallback", { error: result.error.message });
                throw new Error(`Database update failed: ${result.error.message}`);
              }

              return new Response(JSON.stringify({
                payment_status: invoiceData.payment_status || "finished",
                processed: true,
                subscription_activated: true,
                from_invoice_fallback: true
              }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
              });
            }
          }
        }
      } catch (fallbackError) {
        logStep("Error in invoice fallback", { error: fallbackError instanceof Error ? fallbackError.message : String(fallbackError) });
      }
    }

    if (!response.ok) {
      const errorData = await response.text();
      logStep("Payment API error", { status: response.status, error: errorData });
      
      // Si c'est un 404, retourner un message informatif
      if (response.status === 404) {
        return new Response(JSON.stringify({ 
          error: "Payment introuvable",
          message: "Le paiement n'a pas été trouvé dans NOWPayments. Il peut ne pas exister encore ou avoir été supprimé. Le webhook activera automatiquement l'abonnement une fois le paiement confirmé.",
          payment_status: "not_found",
          payment_id: actualPaymentId,
          processed: false,
          subscription_activated: false
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
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
      // serviceRoleClient déjà créé plus haut

      // 🔒 SÉCURITÉ: Vérifier que l'utilisateur est bien celui qui a payé
      const paymentEmail = (payment.customer_email || "").toLowerCase().trim();
      const currentUserEmailPmt = (userData.user.email || "").toLowerCase().trim();
      
      // Extract user_id from order_id
      let orderUserIdPmt: string | null = null;
      if (payment.order_id) {
        const parts = payment.order_id.split("-");
        if (parts.length >= 5) {
          const possibleUserId = parts.slice(0, 5).join("-");
          if (possibleUserId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            orderUserIdPmt = possibleUserId;
          }
        }
      }
      
      const emailMatchesPmt = paymentEmail && currentUserEmailPmt && paymentEmail === currentUserEmailPmt;
      const userIdMatchesPmt = orderUserIdPmt && orderUserIdPmt === userData.user.id;
      
      logStep("Security check (payment)", { paymentEmail, currentUserEmailPmt, emailMatchesPmt, orderUserIdPmt, userIdMatchesPmt });
      
      // 🚫 BLOQUER si ni l'email ni le user_id ne correspondent
      if (!emailMatchesPmt && !userIdMatchesPmt) {
        logStep("🚨 SECURITY BLOCK (payment): User mismatch - payment belongs to different user", {
          payment_id: actualPaymentId,
          paymentEmail,
          currentUserEmail: currentUserEmailPmt
        });
        
        return new Response(JSON.stringify({
          error: "Accès non autorisé",
          message: "Ce paiement n'appartient pas à votre compte. Veuillez utiliser le compte avec lequel vous avez effectué le paiement.",
          payment_status: "unauthorized",
          processed: false,
          subscription_activated: false
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403,
        });
      }
      
      const emailToUsePmt = paymentEmail || currentUserEmailPmt;
      let userId = orderUserIdPmt || userData.user.id;

      // Find user by email if needed (seulement si l'email correspond)
      if (!userId && paymentEmail && emailMatchesPmt) {
        const { data: users } = await serviceRoleClient.auth.admin.listUsers();
        const user = users?.users?.find(u => u.email === paymentEmail);
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
        email: emailToUsePmt,
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

      logStep("✅ Successfully updated subscription", {
        email: emailToUsePmt,
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

