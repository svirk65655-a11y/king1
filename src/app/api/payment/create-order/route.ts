import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const adminClient = await createAdminClient()

        // Get authenticated user
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { productId, promoCode } = await request.json()

        if (!productId) {
            return NextResponse.json(
                { error: 'Product ID is required' },
                { status: 400 }
            )
        }

        // Get product
        const { data: product, error: productError } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .eq('is_active', true)
            .single()

        if (productError || !product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            )
        }

        // Check if already purchased
        const { data: existingPurchase } = await supabase
            .from('user_purchases')
            .select('id')
            .eq('user_id', user.id)
            .eq('product_id', productId)
            .single()

        if (existingPurchase) {
            return NextResponse.json(
                { error: 'You have already purchased this product' },
                { status: 400 }
            )
        }

        // Calculate price with promo code
        let finalPrice = product.price
        let discountAmount = 0
        let promoCodeId = null

        if (promoCode) {
            const { data: promo } = await adminClient
                .from('promo_codes')
                .select('*')
                .eq('code', promoCode.toUpperCase().trim())
                .eq('is_active', true)
                .single()

            if (promo) {
                // Validate promo code
                const isExpired = promo.expires_at && new Date(promo.expires_at) < new Date()
                const isMaxedOut = promo.max_uses && promo.used_count >= promo.max_uses

                if (!isExpired && !isMaxedOut) {
                    discountAmount = (product.price * promo.discount_percent) / 100
                    finalPrice = product.price - discountAmount
                    promoCodeId = promo.id

                    // Increment used_count
                    await adminClient
                        .from('promo_codes')
                        .update({ used_count: promo.used_count + 1 })
                        .eq('id', promo.id)
                }
            }
        }

        // Ensure price is at least 1 rupee (Razorpay minimum)
        finalPrice = Math.max(finalPrice, 1)

        // Get Razorpay credentials from environment or database
        let razorpayKeyId = process.env.RAZORPAY_KEY_ID
        let razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET

        // Try to get from database if not in env
        if (!razorpayKeyId || !razorpayKeySecret) {
            const { data: keyIdConfig } = await adminClient
                .from('payment_config')
                .select('value')
                .eq('key', 'razorpay_key_id')
                .single()

            const { data: keySecretConfig } = await adminClient
                .from('payment_config')
                .select('value')
                .eq('key', 'razorpay_key_secret')
                .single()

            razorpayKeyId = keyIdConfig?.value || razorpayKeyId
            razorpayKeySecret = keySecretConfig?.value || razorpayKeySecret
        }

        if (!razorpayKeyId || !razorpayKeySecret) {
            return NextResponse.json(
                { error: 'Payment gateway not configured' },
                { status: 500 }
            )
        }

        // Initialize Razorpay
        const razorpay = new Razorpay({
            key_id: razorpayKeyId,
            key_secret: razorpayKeySecret,
        })

        // Create order - amount in paise (multiply by 100)
        const order = await razorpay.orders.create({
            amount: Math.round(finalPrice * 100),
            currency: 'INR',
            receipt: `order_${Date.now()}`,
            notes: {
                product_id: productId,
                user_id: user.id,
                promo_code: promoCode || '',
            },
        })

        // Create pending transaction
        await adminClient.from('transactions').insert({
            user_id: user.id,
            product_id: productId,
            amount: finalPrice,
            discount_amount: discountAmount,
            promo_code_id: promoCodeId,
            status: 'pending',
            razorpay_order_id: order.id,
        })

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            razorpayKeyId: razorpayKeyId,
            email: user.email,
            originalPrice: product.price,
            finalPrice: finalPrice,
            discountAmount: discountAmount,
        })
    } catch (error) {
        console.error('Create order error:', error)
        return NextResponse.json(
            { error: 'Failed to create order' },
            { status: 500 }
        )
    }
}
