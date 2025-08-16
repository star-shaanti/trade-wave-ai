-- Enable Row Level Security for stripe_user_orders table
ALTER TABLE public.stripe_user_orders ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security for stripe_user_subscriptions table (also missing RLS)
ALTER TABLE public.stripe_user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for stripe_user_orders to ensure users only see their own orders
CREATE POLICY "Users can view their own order data" ON public.stripe_user_orders
FOR SELECT
USING (
  customer_id IN (
    SELECT stripe_customers.customer_id
    FROM stripe_customers
    WHERE stripe_customers.user_id = auth.uid() 
    AND stripe_customers.deleted_at IS NULL
  )
);

-- Create RLS policy for stripe_user_subscriptions to ensure users only see their own subscriptions
CREATE POLICY "Users can view their own subscription data" ON public.stripe_user_subscriptions
FOR SELECT
USING (
  customer_id IN (
    SELECT stripe_customers.customer_id
    FROM stripe_customers
    WHERE stripe_customers.user_id = auth.uid() 
    AND stripe_customers.deleted_at IS NULL
  )
);

-- Note: These are view-only tables, so we only need SELECT policies
-- INSERT/UPDATE/DELETE operations should be handled by edge functions using service role