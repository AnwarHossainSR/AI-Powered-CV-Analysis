-- Create settings table for dynamic system configuration
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  key VARCHAR(100) NOT NULL,
  value TEXT,
  description TEXT,
  type VARCHAR(20) DEFAULT 'text', -- text, boolean, number, email, password
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category, key)
);

-- Insert dummy settings data
INSERT INTO settings (category, key, value, description, type, is_public) VALUES
-- System Settings
('system', 'site_name', 'CV Analyzer', 'Website name displayed in header', 'text', true),
('system', 'site_description', 'AI-Powered Resume Analysis Platform', 'Site description for SEO', 'text', true),
('system', 'maintenance_mode', 'false', 'Enable maintenance mode', 'boolean', false),
('system', 'max_file_size', '10', 'Maximum file upload size in MB', 'number', false),
('system', 'allowed_file_types', 'pdf,doc,docx,txt', 'Allowed file types for upload', 'text', false),

-- Email Settings
('email', 'from_email', 'noreply@cvanalyzer.com', 'Default from email address', 'email', false),
('email', 'support_email', 'support@cvanalyzer.com', 'Support email address', 'email', true),
('email', 'notifications_enabled', 'true', 'Enable email notifications', 'boolean', false),
('email', 'smtp_host', 'smtp.gmail.com', 'SMTP server host', 'text', false),
('email', 'smtp_port', '587', 'SMTP server port', 'number', false),

-- AI Settings
('ai', 'gemini_model', 'gemini-1.5-flash', 'Google Gemini model to use', 'text', false),
('ai', 'max_tokens', '8192', 'Maximum tokens for AI responses', 'number', false),
('ai', 'temperature', '0.7', 'AI response creativity (0-1)', 'number', false),
('ai', 'processing_enabled', 'true', 'Enable AI processing', 'boolean', false),

-- Stripe Settings
('stripe', 'webhook_endpoint_secret', '', 'Stripe webhook endpoint secret', 'password', false),
('stripe', 'default_currency', 'usd', 'Default currency for payments', 'text', false),
('stripe', 'tax_rate', '0', 'Default tax rate percentage', 'number', false),

-- UI Settings
('ui', 'primary_color', '#000000', 'Primary brand color', 'text', true),
('ui', 'secondary_color', '#6b7280', 'Secondary brand color', 'text', true),
('ui', 'logo_text', 'CV Analyzer', 'Logo text', 'text', true),
('ui', 'footer_text', '© 2024 CV Analyzer. All rights reserved.', 'Footer copyright text', 'text', true);

-- db sync timestamp
('sync', 'last_synced_at', to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS'), 'Last time the database was synced', 'text', true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_settings_updated_at_trigger
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_updated_at();

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admin users can manage settings" ON settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Public settings are readable by everyone" ON settings
  FOR SELECT USING (is_public = true);
