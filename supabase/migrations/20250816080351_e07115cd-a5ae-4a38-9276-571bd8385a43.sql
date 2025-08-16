-- Enable RLS on stripe_user_orders and stripe_user_subscriptions tables
ALTER TABLE public.stripe_user_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for stripe_user_orders - users can only view their own order data
CREATE POLICY "Users can view their own order data" ON public.stripe_user_orders
FOR SELECT
USING (
  customer_id IN (
    SELECT customer_id 
    FROM public.stripe_customers 
    WHERE user_id = auth.uid() AND deleted_at IS NULL
  )
);

-- Add RLS policy for stripe_user_subscriptions - users can only view their own subscription data  
CREATE POLICY "Users can view their own subscription data" ON public.stripe_user_subscriptions
FOR SELECT
USING (
  customer_id IN (
    SELECT customer_id 
    FROM public.stripe_customers 
    WHERE user_id = auth.uid() AND deleted_at IS NULL
  )
);