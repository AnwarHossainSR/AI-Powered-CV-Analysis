-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    
    -- Add welcome credits
    INSERT INTO public.credit_transactions (user_id, amount, type, description)
    VALUES (NEW.id, 10, 'bonus', 'Welcome bonus credits');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update user credits
CREATE OR REPLACE FUNCTION public.update_user_credits(
    user_uuid UUID,
    credit_amount INTEGER,
    transaction_type TEXT,
    description_text TEXT DEFAULT NULL,
    resume_uuid UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    current_credits INTEGER;
BEGIN
    -- Get current credits
    SELECT credits INTO current_credits
    FROM public.profiles
    WHERE id = user_uuid;
    
    -- Check if user has enough credits for usage
    IF transaction_type = 'usage' AND current_credits < ABS(credit_amount) THEN
        RETURN FALSE;
    END IF;
    
    -- Update credits
    UPDATE public.profiles
    SET credits = credits + credit_amount,
        updated_at = NOW()
    WHERE id = user_uuid;
    
    -- Record transaction
    INSERT INTO public.credit_transactions (user_id, amount, type, description, resume_id)
    VALUES (user_uuid, credit_amount, transaction_type, description_text, resume_uuid);
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user stats for admin
CREATE OR REPLACE FUNCTION public.get_user_stats()
RETURNS TABLE (
    total_users BIGINT,
    active_users BIGINT,
    total_resumes BIGINT,
    total_credits_used BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM public.profiles) as total_users,
        (SELECT COUNT(*) FROM public.profiles WHERE updated_at > NOW() - INTERVAL '30 days') as active_users,
        (SELECT COUNT(*) FROM public.resumes) as total_resumes,
        (SELECT COALESCE(SUM(ABS(amount)), 0) FROM public.credit_transactions WHERE type = 'usage') as total_credits_used;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
