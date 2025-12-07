import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const { code } = await request.json()

        if (!code) {
            return NextResponse.json(
                { error: 'Promo code is required' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        // Get the promo code
        const { data: promo, error } = await supabase
            .from('promo_codes')
            .select('*')
            .eq('code', code.toUpperCase().trim())
            .eq('is_active', true)
            .single()

        if (error || !promo) {
            return NextResponse.json(
                { error: 'Invalid promo code' },
                { status: 400 }
            )
        }

        // Check if expired
        if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
            return NextResponse.json(
                { error: 'This promo code has expired' },
                { status: 400 }
            )
        }

        // Check if max uses reached
        if (promo.max_uses && promo.used_count >= promo.max_uses) {
            return NextResponse.json(
                { error: 'This promo code has reached its usage limit' },
                { status: 400 }
            )
        }

        // Return the discount info
        return NextResponse.json({
            valid: true,
            code: promo.code,
            discount_percent: promo.discount_percent,
            message: `${promo.discount_percent}% discount applied!`
        })

    } catch (error) {
        console.error('Promo validation error:', error)
        return NextResponse.json(
            { error: 'Failed to validate promo code' },
            { status: 500 }
        )
    }
}
