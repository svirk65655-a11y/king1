export type ProductType = 'pdf' | 'telegram'

export interface Product {
    id: string
    name: string
    description: string | null
    price: number
    type: ProductType
    file_url: string | null
    telegram_link: string | null
    image_url: string | null
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface Profile {
    id: string
    email: string
    full_name: string | null
    is_admin: boolean
    is_banned: boolean
    created_at: string
    updated_at: string
}

export interface Transaction {
    id: string
    user_id: string
    product_id: string
    amount: number
    status: 'pending' | 'success' | 'failed'
    razorpay_order_id: string | null
    razorpay_payment_id: string | null
    razorpay_signature: string | null
    created_at: string
    product?: Product
    profile?: Profile
}

export interface UserPurchase {
    id: string
    user_id: string
    product_id: string
    access_link: string | null
    purchased_at: string
    product?: Product
}

export interface SiteContent {
    key: string
    value: Record<string, unknown>
    updated_at: string
}

export interface PaymentConfig {
    key: string
    value: string
    updated_at: string
}

// Database schema types for Supabase
export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: Profile
                Insert: Omit<Profile, 'created_at' | 'updated_at'>
                Update: Partial<Omit<Profile, 'id'>>
            }
            products: {
                Row: Product
                Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Product, 'id'>>
            }
            transactions: {
                Row: Transaction
                Insert: Omit<Transaction, 'id' | 'created_at'>
                Update: Partial<Omit<Transaction, 'id'>>
            }
            user_purchases: {
                Row: UserPurchase
                Insert: Omit<UserPurchase, 'id' | 'purchased_at'>
                Update: Partial<Omit<UserPurchase, 'id'>>
            }
            site_content: {
                Row: SiteContent
                Insert: Omit<SiteContent, 'updated_at'>
                Update: Partial<SiteContent>
            }
            payment_config: {
                Row: PaymentConfig
                Insert: Omit<PaymentConfig, 'updated_at'>
                Update: Partial<PaymentConfig>
            }
        }
    }
}
