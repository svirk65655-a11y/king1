-- STORAGE BUCKET SETUP
-- Run this in Supabase SQL Editor to create the products storage bucket with proper policies

-- Create the storage bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Delete existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin deletes" ON storage.objects;

-- Allow public read access to products bucket
CREATE POLICY "Allow public read access" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'products');

-- Allow authenticated users to upload to products bucket
CREATE POLICY "Allow authenticated uploads" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'products' 
        AND auth.role() = 'authenticated'
    );

-- Allow authenticated users to update/delete their uploads
CREATE POLICY "Allow authenticated updates" ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'products' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Allow authenticated deletes" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'products' 
        AND auth.role() = 'authenticated'
    );
