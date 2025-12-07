-- INVOICE FEATURE - DATABASE MIGRATION
-- Run this in Supabase SQL Editor

-- =====================================================
-- STEP 1: Create invoices table
-- =====================================================

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT UNIQUE NOT NULL,
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    amount NUMERIC(10,2) NOT NULL,
    discount_amount NUMERIC(10,2) DEFAULT 0,
    promo_code TEXT,
    customer_email TEXT NOT NULL,
    customer_name TEXT,
    product_name TEXT NOT NULL,
    razorpay_payment_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STEP 2: Enable Row Level Security
-- =====================================================

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 3: Create RLS Policies
-- =====================================================

-- Users can view their own invoices
CREATE POLICY "Users can view own invoices" ON invoices
    FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all invoices (using existing is_admin() function)
CREATE POLICY "Admins can view all invoices" ON invoices
    FOR SELECT USING (public.is_admin() = true);

-- Allow service role to insert invoices (for webhook)
CREATE POLICY "Service role can insert invoices" ON invoices
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- STEP 4: Create indexes for performance
-- =====================================================

-- Index on user_id for quick lookups
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);

-- Index on transaction_id for joins
CREATE INDEX IF NOT EXISTS idx_invoices_transaction_id ON invoices(transaction_id);

-- Index on invoice_number for lookups
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);

-- =====================================================
-- STEP 5: Create function to generate invoice number
-- =====================================================

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    year_month TEXT;
    sequence_num INTEGER;
    invoice_num TEXT;
BEGIN
    year_month := TO_CHAR(NOW(), 'YYMM');
    
    -- Get the count of invoices this month + 1
    SELECT COUNT(*) + 1 INTO sequence_num
    FROM invoices
    WHERE invoice_number LIKE 'INV-' || year_month || '%';
    
    -- Format: INV-YYMM-XXXX (e.g., INV-2412-0001)
    invoice_num := 'INV-' || year_month || '-' || LPAD(sequence_num::TEXT, 4, '0');
    
    RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VERIFICATION: Check table was created
-- =====================================================
-- Run: SELECT * FROM invoices;
-- Run: SELECT generate_invoice_number();
