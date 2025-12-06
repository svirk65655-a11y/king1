-- Supabase SQL Schema for E-Commerce Platform
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    is_banned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    type TEXT CHECK (type IN ('pdf', 'telegram')) NOT NULL,
    file_url TEXT,
    telegram_link TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    amount NUMERIC(10,2) NOT NULL,
    status TEXT CHECK (status IN ('pending', 'success', 'failed')) DEFAULT 'pending',
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Purchases table
CREATE TABLE IF NOT EXISTS user_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    access_link TEXT,
    purchased_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Site Content table
CREATE TABLE IF NOT EXISTS site_content (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Config table
CREATE TABLE IF NOT EXISTS payment_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_content_updated_at
    BEFORE UPDATE ON site_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_config_updated_at
    BEFORE UPDATE ON payment_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, is_admin)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        CASE WHEN NEW.email = current_setting('app.admin_email', true) THEN TRUE ELSE FALSE END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Row Level Security Policies

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_config ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

CREATE POLICY "Admins can update all profiles" ON profiles
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- Products policies (public read, admin write)
CREATE POLICY "Anyone can view active products" ON products
    FOR SELECT USING (is_active = true OR 
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

CREATE POLICY "Admins can insert products" ON products
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

CREATE POLICY "Admins can update products" ON products
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

CREATE POLICY "Admins can delete products" ON products
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions" ON transactions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- User purchases policies
CREATE POLICY "Users can view own purchases" ON user_purchases
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all purchases" ON user_purchases
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

CREATE POLICY "Admins can insert purchases" ON user_purchases
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- Site content policies (public read, admin write)
CREATE POLICY "Anyone can read site content" ON site_content
    FOR SELECT USING (true);

CREATE POLICY "Admins can modify site content" ON site_content
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- Payment config policies (admin only)
CREATE POLICY "Admins can access payment config" ON payment_config
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- Insert default site content
INSERT INTO site_content (key, value) VALUES 
    ('homepage_hero', '{"title": "Digital Products Marketplace", "subtitle": "Access premium PDFs and exclusive Telegram groups", "cta_text": "Browse Products"}'),
    ('privacy_policy', '{"content": "# Privacy Policy\n\nYour privacy is important to us. This policy outlines how we collect, use, and protect your personal information.\n\n## Information We Collect\n\nWe collect information you provide directly to us, such as your name, email address, and payment information.\n\n## How We Use Your Information\n\nWe use the information to process transactions, send communications, and improve our services.\n\n## Contact Us\n\nIf you have questions about this policy, please contact us."}'),
    ('refund_policy', '{"content": "# Refund Policy\n\n## Digital Products\n\nDue to the nature of digital products, all sales are final. We do not offer refunds for downloaded PDFs or accessed Telegram groups.\n\n## Exceptions\n\nIf you experience technical issues accessing your purchased content, please contact us within 24 hours.\n\n## Contact\n\nFor refund inquiries, email us at support@example.com"}'),
    ('terms_conditions', '{"content": "# Terms & Conditions\n\n## Acceptance\n\nBy using our service, you agree to these terms.\n\n## Products\n\nDigital products are for personal use only and may not be redistributed.\n\n## Account\n\nYou are responsible for maintaining the security of your account.\n\n## Changes\n\nWe reserve the right to modify these terms at any time."}')
ON CONFLICT (key) DO NOTHING;

-- Create storage bucket for PDFs (run in Supabase dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', false);
