-- Drop the security definer views and recreate them properly
DROP VIEW IF EXISTS public.stripe_user_orders;
DROP VIEW IF EXISTS public.stripe_user_subscriptions;

-- Recreate stripe_user_orders view with security_invoker (uses caller's permissions)
CREATE VIEW public.stripe_user_orders WITH (security_invoker=true) AS
SELECT 
    o.customer_id,
    o.id AS order_id,
    o.checkout_session_id,
    o.payment_intent_id,
    o.amount_subtotal,
    o.amount_total,
    o.currency,
    o.payment_status,
    o.status AS order_status,
    o.created_at AS order_date
FROM stripe_orders o
WHERE o.customer_id IN (
    SELECT customer_id 
    FROM stripe_customers 
    WHERE user_id = auth.uid() AND deleted_at IS NULL
) AND o.deleted_at IS NULL;

-- Recreate stripe_user_subscriptions view with security_invoker (uses caller's permissions)
CREATE VIEW public.stripe_user_subscriptions WITH (security_invoker=true) AS
SELECT 
    s.customer_id,
    s.subscription_id,
    s.status AS subscription_status,
    s.price_id,
    s.current_period_start,
    s.current_period_end,
    s.cancel_at_period_end,
    s.payment_method_brand,
    s.payment_method_last4
FROM stripe_subscriptions s
WHERE s.customer_id IN (
    SELECT customer_id 
    FROM stripe_customers 
    WHERE user_id = auth.uid() AND deleted_at IS NULL
) AND s.deleted_at IS NULL;

-- Grant appropriate permissions
GRANT SELECT ON public.stripe_user_orders TO authenticated;
GRANT SELECT ON public.stripe_user_subscriptions TO authenticated;