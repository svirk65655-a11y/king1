import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServerClient } from '@supabase/ssr'
import { sendPurchaseEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
    try {
        const body = await request.text()
        const signature = request.headers.get('x-razorpay-signature')

        if (!signature) {
            return NextResponse.json(
                { error: 'Missing signature' },
                { status: 400 }
            )
        }

        // Verify webhook signature
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

        if (!webhookSecret) {
            console.error('Webhook secret not configured')
            return NextResponse.json(
                { error: 'Webhook not configured' },
                { status: 500 }
            )
        }

        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(body)
            .digest('hex')

        if (expectedSignature !== signature) {
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 400 }
            )
        }

        const payload = JSON.parse(body)
        const event = payload.event

        // Create admin Supabase client
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                cookies: {
                    getAll: () => [],
                    setAll: () => { },
                },
            }
        )

        if (event === 'payment.captured') {
            const payment = payload.payload.payment.entity
            const orderId = payment.order_id
            const paymentId = payment.id

            // Get transaction
            const { data: transaction, error: txError } = await supabase
                .from('transactions')
                .select('*, product:products(*), profile:profiles(*)')
                .eq('razorpay_order_id', orderId)
                .single()

            if (txError || !transaction) {
                console.error('Transaction not found for order:', orderId)
                return NextResponse.json({ received: true })
            }

            // Skip if already processed
            if (transaction.status === 'success') {
                return NextResponse.json({ received: true })
            }

            // Update transaction
            await supabase
                .from('transactions')
                .update({
                    status: 'success',
                    razorpay_payment_id: paymentId,
                })
                .eq('id', transaction.id)

            // Create user purchase if not exists
            const { data: existingPurchase } = await supabase
                .from('user_purchases')
                .select('id')
                .eq('user_id', transaction.user_id)
                .eq('product_id', transaction.product_id)
                .single()

            if (!existingPurchase) {
                const accessLink = transaction.product?.type === 'pdf'
                    ? transaction.product.file_url
                    : transaction.product?.telegram_link

                await supabase.from('user_purchases').insert({
                    user_id: transaction.user_id,
                    product_id: transaction.product_id,
                    access_link: accessLink,
                })

                // Send email
                try {
                    await sendPurchaseEmail({
                        to: transaction.profile?.email || '',
                        productName: transaction.product?.name || 'Your Product',
                        productType: transaction.product?.type || 'pdf',
                        accessLink: accessLink || '',
                    })
                } catch (emailError) {
                    console.error('Failed to send email:', emailError)
                }
            }
        }

        if (event === 'payment.failed') {
            const payment = payload.payload.payment.entity
            const orderId = payment.order_id

            await supabase
                .from('transactions')
                .update({ status: 'failed' })
                .eq('razorpay_order_id', orderId)
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        )
    }
}
