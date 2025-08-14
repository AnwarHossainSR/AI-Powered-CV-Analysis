-- Add detailed features columns to billing_plans table
ALTER TABLE billing_plans ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}';
ALTER TABLE billing_plans ADD COLUMN IF NOT EXISTS limitations TEXT[] DEFAULT '{}';
ALTER TABLE billing_plans ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE billing_plans ADD COLUMN IF NOT EXISTS interval VARCHAR(10) DEFAULT 'month';
ALTER TABLE billing_plans ADD COLUMN IF NOT EXISTS credits_per_period INTEGER DEFAULT 0;

-- Update existing plans with detailed features
UPDATE billing_plans 
SET 
  features = ARRAY[
    '10 resume analyses',
    'Basic AI parsing', 
    'PDF & Word support',
    'Email support'
  ],
  limitations = ARRAY[
    'No priority support',
    'Basic insights only',
    'No bulk processing'
  ],
  description = 'Perfect for trying out our service',
  credits_per_period = 10
WHERE name = 'Free' AND plan_type = 'subscription';

UPDATE billing_plans 
SET 
  features = ARRAY[
    '100 resume analyses per month',
    'Advanced AI parsing',
    'All file formats supported', 
    'Priority email support',
    'Detailed insights & recommendations',
    'Export to multiple formats'
  ],
  limitations = ARRAY[
    'No bulk processing',
    'Standard processing speed'
  ],
  description = 'Great for job seekers and professionals',
  credits_per_period = 100
WHERE name = 'Basic' AND plan_type = 'subscription';

UPDATE billing_plans 
SET 
  features = ARRAY[
    '500 resume analyses per month',
    'Premium AI parsing with highest accuracy',
    'All file formats supported',
    '24/7 priority support', 
    'Advanced insights & recommendations',
    'Bulk processing capabilities',
    'API access',
    'Custom integrations',
    'Team collaboration tools'
  ],
  limitations = ARRAY[]::TEXT[],
  description = 'Perfect for recruiters and HR teams',
  credits_per_period = 500
WHERE name = 'Premium' AND plan_type = 'subscription';
