-- Add a policy that prevents blocked users from accessing anything
-- This is the simplest approach - just add this to your existing schema

-- First, create a helper function to check if current user is blocked
CREATE OR REPLACE FUNCTION public.is_user_blocked()
RETURNS BOOLEAN AS $$
DECLARE
  user_blocked BOOLEAN;
BEGIN
  -- If no user is authenticated, return false (not blocked)
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check if the current user is blocked
  SELECT COALESCE(is_blocked, FALSE) INTO user_blocked
  FROM public.profiles
  WHERE id = auth.uid();

  RETURN COALESCE(user_blocked, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add blocking policies to all your tables
-- This will prevent blocked users from accessing ANY data

-- Profiles table - blocked users can't even see their own profile
DROP POLICY IF EXISTS "Block access for blocked users" ON public.profiles;
CREATE POLICY "Block access for blocked users"
ON public.profiles
FOR ALL
USING (NOT public.is_user_blocked())
WITH CHECK (NOT public.is_user_blocked());

-- Resumes table - blocked users can't access resumes
DROP POLICY IF EXISTS "Block resumes for blocked users" ON public.resumes;
CREATE POLICY "Block resumes for blocked users"
ON public.resumes
FOR ALL
USING (NOT public.is_user_blocked())
WITH CHECK (NOT public.is_user_blocked());

-- Parsed data table - blocked users can't access parsed data
DROP POLICY IF EXISTS "Block parsed_data for blocked users" ON public.parsed_data;
CREATE POLICY "Block parsed_data for blocked users"
ON public.parsed_data
FOR ALL
USING (NOT public.is_user_blocked())
WITH CHECK (NOT public.is_user_blocked());

-- Credit transactions - blocked users can't see transactions
DROP POLICY IF EXISTS "Block transactions for blocked users" ON public.credit_transactions;
CREATE POLICY "Block transactions for blocked users"
ON public.credit_transactions
FOR ALL
USING (NOT public.is_user_blocked())
WITH CHECK (NOT public.is_user_blocked());

-- Note: These policies will be checked BEFORE your existing policies
-- So even if a user passes your "Users can view own profile" policy,
-- they'll be blocked by this policy if they're marked as blocked