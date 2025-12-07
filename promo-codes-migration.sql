-- PROMO CODE FEATURE - DATABASE MIGRATION
-- Run this in Supabase SQL Editor

-- =====================================================
-- STEP 1: Create promo_codes table
-- =====================================================

CREATE TABLE IF NOT EXISTS promo_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
    max_uses INTEGER DEFAULT NULL,  -- NULL = unlimited uses
    used_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMPTZ DEFAULT NULL,  -- NULL = never expires
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STEP 2: Add columns to transactions table
-- =====================================================

-- Add promo_code_id column (nullable, references promo_codes)
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS promo_code_id UUID REFERENCES promo_codes(id);

-- Add discount_amount column to track the discount applied
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2) DEFAULT 0;

-- =====================================================
-- STEP 3: Enable Row Level Security
-- =====================================================

ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 4: Create RLS Policies
-- =====================================================

-- Anyone can validate (read) active promo codes
CREATE POLICY "Anyone can validate promo codes" ON promo_codes
    FOR SELECT USING (is_active = true);

-- Admins can do everything (using existing is_admin() function)
CREATE POLICY "Admins can manage promo codes" ON promo_codes
    FOR ALL USING (public.is_admin() = true);

-- =====================================================
-- STEP 5: Create indexes for performance
-- =====================================================

-- Index on code for quick lookups
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);

-- Index on is_active for filtering
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(is_active);

-- =====================================================
-- VERIFICATION: Check tables were created
-- =====================================================
-- Run: SELECT * FROM promo_codes;
-- Run: SELECT column_name FROM information_schema.columns WHERE table_name = 'transactions' AND column_name IN ('promo_code_id', 'discount_amount');
