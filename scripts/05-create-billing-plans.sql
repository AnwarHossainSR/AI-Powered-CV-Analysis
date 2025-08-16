-- Create billing_plans table for dynamic pricing
CREATE TABLE IF NOT EXISTS public.billing_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'usd',
    interval_type TEXT NOT NULL CHECK (interval_type IN ('one_time', 'monthly', 'yearly')),
    credits INTEGER, -- For credit packages
    features JSONB DEFAULT '[]'::jsonb,
    stripe_price_id TEXT UNIQUE,
    stripe_product_id TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.billing_plans ENABLE ROW LEVEL SECURITY;

-- Create policies for billing_plans
CREATE POLICY "Anyone can view active billing plans"
ON public.billing_plans
FOR SELECT
USING (is_active = true);

-- Service role policy for billing_plans
CREATE POLICY "Service role can access all billing plans"
ON public.billing_plans
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Admin policy for billing_plans
CREATE POLICY "Admins can manage billing plans"
ON public.billing_plans
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Insert default billing plans
-- INSERT INTO public.billing_plans (name, description, price, interval_type, credits, features, sort_order) VALUES
-- ('Starter Pack', '50 resume analyses to get you started', 9.99, 'one_time', 50, '["50 AI resume analyses", "Basic insights", "PDF export"]', 1),
-- ('Professional Pack', '100 resume analyses for job seekers', 17.99, 'one_time', 100, '["100 AI resume analyses", "Advanced insights", "PDF export", "Cover letter generation"]', 2),
-- ('Career Booster', '250 resume analyses for active job hunting', 39.99, 'one_time', 250, '["250 AI resume analyses", "Premium insights", "PDF export", "Cover letter generation", "Priority support"]', 3),
-- ('Enterprise Pack', '500 resume analyses for recruiters', 69.99, 'one_time', 500, '["500 AI resume analyses", "Enterprise insights", "PDF export", "Cover letter generation", "Priority support", "Bulk processing"]', 4),
-- ('Basic Plan', 'Monthly subscription with 25 analyses', 14.99, 'monthly', 25, '["25 monthly analyses", "Basic insights", "PDF export", "Email support"]', 5),
-- ('Premium Plan', 'Monthly subscription with unlimited analyses', 29.99, 'monthly', -1, '["Unlimited analyses", "Premium insights", "PDF export", "Cover letter generation", "Priority support", "Advanced analytics"]', 6);
