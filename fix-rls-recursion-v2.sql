-- FIX FOR RLS INFINITE RECURSION (VERSION 2)
-- Run this in Supabase SQL Editor to fix the admin access issue

-- =====================================================
-- STEP 1: Drop ALL existing problematic policies
-- =====================================================

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Transactions policies
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON transactions;

-- User purchases policies
DROP POLICY IF EXISTS "Users can view own purchases" ON user_purchases;
DROP POLICY IF EXISTS "Admins can view all purchases" ON user_purchases;
DROP POLICY IF EXISTS "Admins can insert purchases" ON user_purchases;

-- Products policies
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;

-- Other table policies
DROP POLICY IF EXISTS "Admins can modify site content" ON site_content;
DROP POLICY IF EXISTS "Admins can access payment config" ON payment_config;
DROP POLICY IF EXISTS "Anyone can read site content" ON site_content;

-- =====================================================
-- STEP 2: Create a SECURITY DEFINER function
-- This bypasses RLS when checking admin status
-- =====================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM profiles WHERE id = auth.uid()),
    false
  );
$$;

-- =====================================================
-- STEP 3: Create new policies that don't cause recursion
-- =====================================================

-- PROFILES TABLE
-- Users can view their own profile (no recursion - direct comparison)
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Admins can view all profiles (uses SECURITY DEFINER function)
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (public.is_admin() = true);

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON profiles
    FOR UPDATE USING (public.is_admin() = true);

-- TRANSACTIONS TABLE
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions" ON transactions
    FOR SELECT USING (public.is_admin() = true);

-- USER_PURCHASES TABLE
CREATE POLICY "Users can view own purchases" ON user_purchases
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all purchases" ON user_purchases
    FOR SELECT USING (public.is_admin() = true);

CREATE POLICY "Admins can insert purchases" ON user_purchases
    FOR INSERT WITH CHECK (public.is_admin() = true);

-- PRODUCTS TABLE
CREATE POLICY "Anyone can view active products" ON products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage products" ON products
    FOR ALL USING (public.is_admin() = true);

-- SITE_CONTENT TABLE
CREATE POLICY "Anyone can read site content" ON site_content
    FOR SELECT USING (true);

CREATE POLICY "Admins can modify site content" ON site_content
    FOR ALL USING (public.is_admin() = true);

-- PAYMENT_CONFIG TABLE
CREATE POLICY "Admins can access payment config" ON payment_config
    FOR ALL USING (public.is_admin() = true);

-- =====================================================
-- STEP 4: Grant execute permission on the function
-- =====================================================
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- =====================================================
-- VERIFICATION: Check that policies are created
-- =====================================================
-- Run this to verify: SELECT * FROM pg_policies WHERE tablename = 'profiles';
