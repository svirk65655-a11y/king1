import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendPurchaseEmail } from '@/lib/email'

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

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json()

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json(
                { error: 'Missing payment details' },
                { status: 400 }
            )
        }

        // Get Razorpay secret
        let razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET

        if (!razorpayKeySecret) {
            const { data: keySecretConfig } = await adminClient
                .from('payment_config')
                .select('value')
                .eq('key', 'razorpay_key_secret')
                .single()

            razorpayKeySecret = keySecretConfig?.value
        }

        if (!razorpayKeySecret) {
            return NextResponse.json(
                { error: 'Payment gateway not configured' },
                { status: 500 }
            )
        }

        // Verify signature
        const body = razorpay_order_id + '|' + razorpay_payment_id
        const expectedSignature = crypto
            .createHmac('sha256', razorpayKeySecret)
            .update(body)
            .digest('hex')

        if (expectedSignature !== razorpay_signature) {
            // Update transaction as failed
            await adminClient
                .from('transactions')
                .update({ status: 'failed' })
                .eq('razorpay_order_id', razorpay_order_id)

            return NextResponse.json(
                { error: 'Invalid payment signature' },
                { status: 400 }
            )
        }

        // Get transaction
        const { data: transaction, error: txError } = await adminClient
            .from('transactions')
            .select('*, product:products(*)')
            .eq('razorpay_order_id', razorpay_order_id)
            .single()

        if (txError || !transaction) {
            return NextResponse.json(
                { error: 'Transaction not found' },
                { status: 404 }
            )
        }

        // Update transaction to success
        await adminClient
            .from('transactions')
            .update({
                status: 'success',
                razorpay_payment_id,
                razorpay_signature,
            })
            .eq('id', transaction.id)

        // Create user purchase
        const accessLink = transaction.product?.type === 'pdf'
            ? transaction.product.file_url
            : transaction.product?.telegram_link

        await adminClient.from('user_purchases').insert({
            user_id: user.id,
            product_id: transaction.product_id,
            access_link: accessLink,
        })

        // Send confirmation email
        try {
            await sendPurchaseEmail({
                to: user.email!,
                productName: transaction.product?.name || 'Your Product',
                productType: transaction.product?.type || 'pdf',
                accessLink: accessLink || '',
            })
        } catch (emailError) {
            console.error('Failed to send email:', emailError)
            // Don't fail the request if email fails
        }

        return NextResponse.json({
            success: true,
            message: 'Payment verified successfully',
        })
    } catch (error) {
        console.error('Verify payment error:', error)
        return NextResponse.json(
            { error: 'Failed to verify payment' },
            { status: 500 }
        )
    }
}
