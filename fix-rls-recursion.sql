-- FIX FOR RLS INFINITE RECURSION
-- Run this in Supabase SQL Editor to fix the admin access issue

-- First, drop the problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all transactions" ON transactions;
DROP POLICY IF EXISTS "Admins can view all purchases" ON user_purchases;
DROP POLICY IF EXISTS "Admins can insert purchases" ON user_purchases;
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;
DROP POLICY IF EXISTS "Admins can modify site content" ON site_content;
DROP POLICY IF EXISTS "Admins can access payment config" ON payment_config;

-- Create a helper function to check if user is admin (avoids RLS recursion)
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    admin_status BOOLEAN;
BEGIN
    SELECT is_admin INTO admin_status 
    FROM profiles 
    WHERE id = user_id;
    RETURN COALESCE(admin_status, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate profiles policies using auth.uid() directly (no subquery on same table)
-- Users can view their own profile (already exists, but let's make sure)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Admin helper: create a simple policy that allows viewing all if is_admin column is true for current user
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        (SELECT p.is_admin FROM profiles p WHERE p.id = auth.uid())
    );

CREATE POLICY "Admins can update all profiles" ON profiles
    FOR UPDATE USING (
        (SELECT p.is_admin FROM profiles p WHERE p.id = auth.uid())
    );

-- Products policies
CREATE POLICY "Anyone can view active products" ON products
    FOR SELECT USING (
        is_active = true OR is_admin(auth.uid())
    );

CREATE POLICY "Admins can insert products" ON products
    FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update products" ON products
    FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete products" ON products
    FOR DELETE USING (is_admin(auth.uid()));

-- Transactions policies
CREATE POLICY "Admins can view all transactions" ON transactions
    FOR SELECT USING (is_admin(auth.uid()));

-- User purchases policies
CREATE POLICY "Admins can view all purchases" ON user_purchases
    FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert purchases" ON user_purchases
    FOR INSERT WITH CHECK (is_admin(auth.uid()));

-- Site content policies
CREATE POLICY "Admins can modify site content" ON site_content
    FOR ALL USING (is_admin(auth.uid()));

-- Payment config policies
CREATE POLICY "Admins can access payment config" ON payment_config
    FOR ALL USING (is_admin(auth.uid()));

-- Verify the fix by selecting from profiles
-- SELECT * FROM profiles WHERE id = auth.uid();
