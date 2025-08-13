-- Create users table extension for additional profile data
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    credits INTEGER DEFAULT 10,
    subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'basic', 'premium')),
    subscription_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create resumes table
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    filename TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    error_message TEXT,
    ai_summary TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create parsed_data table for AI analysis results
CREATE TABLE IF NOT EXISTS public.parsed_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
    personal_info JSONB,
    experience JSONB,
    education JSONB,
    skills JSONB,
    certifications JSONB,
    languages JSONB,
    projects JSONB,
    summary TEXT,
    raw_text TEXT,
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create credit_transactions table
CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'refund', 'bonus')),
    description TEXT,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    permissions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parsed_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can insert own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can update own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Admins can view all resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can view own parsed data" ON public.parsed_data;
DROP POLICY IF EXISTS "Users can insert own parsed data" ON public.parsed_data;
DROP POLICY IF EXISTS "Admins can insert any parsed data" ON public.parsed_data;
DROP POLICY IF EXISTS "Admins can view all parsed data" ON public.parsed_data;
DROP POLICY IF EXISTS "Users can view own transactions" ON public.credit_transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.credit_transactions;
DROP POLICY IF EXISTS "Admins can view all admin users" ON public.admin_users;

-- Create policies for profiles
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Create service role policy for profiles (for server-side operations)
CREATE POLICY "Service role can access all profiles"
ON public.profiles
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Create policies for resumes
CREATE POLICY "Users can view own resumes" ON public.resumes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resumes" ON public.resumes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes" ON public.resumes
    FOR UPDATE USING (auth.uid() = user_id);

-- Service role policy for resumes
CREATE POLICY "Service role can access all resumes"
ON public.resumes
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Create policies for parsed_data
CREATE POLICY "Users can view own parsed data" ON public.parsed_data
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.resumes 
            WHERE resumes.id = parsed_data.resume_id 
            AND resumes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own parsed data" ON public.parsed_data
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.resumes
            WHERE resumes.id = parsed_data.resume_id
            AND resumes.user_id = auth.uid()
        )
    );

-- Service role policy for parsed_data
CREATE POLICY "Service role can access all parsed data"
ON public.parsed_data
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Create policies for credit_transactions
CREATE POLICY "Users can view own transactions" ON public.credit_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Service role policy for credit_transactions
CREATE POLICY "Service role can access all transactions"
ON public.credit_transactions
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Admin policies for admin_users table
-- FIXED: Use a function to avoid infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin users can view other admin users (using the function)
CREATE POLICY "Admins can view admin users" ON public.admin_users
    FOR SELECT USING (public.is_admin());

-- Service role policy for admin_users
CREATE POLICY "Service role can access all admin users"
ON public.admin_users
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Admin policies using the function (admins can view all data)
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can view all resumes" ON public.resumes
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can view all parsed data" ON public.parsed_data
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can view all transactions" ON public.credit_transactions
    FOR SELECT USING (public.is_admin());