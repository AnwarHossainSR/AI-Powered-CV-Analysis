-- Create an admin user (replace with your actual user ID and email)
-- You'll need to run this after creating your first user account

-- Example: INSERT INTO public.admin_users (id, role, permissions) 
-- VALUES ('your-user-id-here', 'super_admin', '["all"]'::jsonb);

-- This is a template - you'll need to replace 'your-user-id-here' with your actual user ID
-- You can get your user ID from the auth.users table or profiles table after signing up

-- Uncomment and modify the line below with your actual user ID:
INSERT INTO public.admin_users (id, role, permissions) 
VALUES ('user_id', 'super_admin', '["all"]'::jsonb)
ON CONFLICT (id) 
DO UPDATE SET role = 'super_admin', permissions = '["all"]'::jsonb;

-- update user_profile table credits to 1000
UPDATE public.user_profile SET credits = 1000 WHERE id = 'user_id';
