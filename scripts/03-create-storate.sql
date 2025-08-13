-- First, check if the bucket exists and create it if needed
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Service role can manage all files" ON storage.objects;

-- Create new storage policies
CREATE POLICY "Users can upload their own resumes"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'resumes' AND 
  auth.uid()::text = (string_to_array(name, '/'))[1]
);

CREATE POLICY "Users can view their own resumes"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'resumes' AND 
  auth.uid()::text = (string_to_array(name, '/'))[1]
);

CREATE POLICY "Users can update their own resumes"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'resumes' AND 
  auth.uid()::text = (string_to_array(name, '/'))[1]
);

CREATE POLICY "Users can delete their own resumes"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'resumes' AND 
  auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Allow service role to manage all files (for processing)
CREATE POLICY "Service role can manage all files"
ON storage.objects FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Alternative: If the above policies still don't work, try these simpler ones
-- (Uncomment these if the above don't work)

/*
DROP POLICY IF EXISTS "Allow authenticated users to upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to view their own files" ON storage.objects;

CREATE POLICY "Allow authenticated users to upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'resumes' AND auth.role() = 'authenticated');

CREATE POLICY "Allow users to view their own files"
ON storage.objects FOR SELECT
USING (bucket_id = 'resumes' AND auth.role() = 'authenticated');
*/