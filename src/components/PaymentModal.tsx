'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, CreditCard, CheckCircle, XCircle, Tag } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/lib/types'

interface PaymentModalProps {
    product: Product
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => RazorpayInstance
    }
}

interface RazorpayOptions {
    key: string
    amount: number
    currency: string
    name: string
    description: string
    order_id: string
    prefill: {
        email: string
    }
    theme: {
        color: string
    }
    handler: (response: RazorpayResponse) => void
    modal: {
        ondismiss: () => void
    }
}

interface RazorpayInstance {
    open: () => void
}

interface RazorpayResponse {
    razorpay_payment_id: string
    razorpay_order_id: string
    razorpay_signature: string
}

type PaymentStatus = 'idle' | 'creating' | 'processing' | 'verifying' | 'success' | 'error'

export default function PaymentModal({ product, isOpen, onClose, onSuccess }: PaymentModalProps) {
    const [status, setStatus] = useState<PaymentStatus>('idle')
    const [error, setError] = useState<string | null>(null)

    // Promo code state
    const [promoCode, setPromoCode] = useState('')
    const [promoLoading, setPromoLoading] = useState(false)
    const [promoError, setPromoError] = useState<string | null>(null)
    const [appliedPromo, setAppliedPromo] = useState<{
        code: string
        discount_percent: number
    } | null>(null)

    // Calculate prices
    const originalPrice = product.price
    const discountAmount = appliedPromo
        ? (originalPrice * appliedPromo.discount_percent) / 100
        : 0
    const finalPrice = originalPrice - discountAmount

    useEffect(() => {
        // Load Razorpay script
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.async = true
        document.body.appendChild(script)

        return () => {
            document.body.removeChild(script)
        }
    }, [])

    useEffect(() => {
        if (isOpen) {
            setStatus('idle')
            setError(null)
            setPromoCode('')
            setPromoError(null)
            setAppliedPromo(null)
        }
    }, [isOpen])

    const applyPromoCode = async () => {
        if (!promoCode.trim()) return

        setPromoLoading(true)
        setPromoError(null)

        try {
            const res = await fetch('/api/promo/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: promoCode }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Invalid promo code')
            }

            setAppliedPromo({
                code: data.code,
                discount_percent: data.discount_percent,
            })
            setPromoCode('')
        } catch (err) {
            setPromoError(err instanceof Error ? err.message : 'Invalid promo code')
        } finally {
            setPromoLoading(false)
        }
    }

    const removePromoCode = () => {
        setAppliedPromo(null)
        setPromoError(null)
    }

    const handlePayment = async () => {
        try {
            setStatus('creating')
            setError(null)

            // Create order with promo code
            const orderRes = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: product.id,
                    promoCode: appliedPromo?.code || null,
                }),
            })

            const orderData = await orderRes.json()

            if (!orderRes.ok) {
                throw new Error(orderData.error || 'Failed to create order')
            }

            setStatus('processing')

            // Initialize Razorpay
            const options: RazorpayOptions = {
                key: orderData.razorpayKeyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'Digital Products',
                description: product.name,
                order_id: orderData.orderId,
                prefill: {
                    email: orderData.email,
                },
                theme: {
                    color: '#6366f1',
                },
                handler: async (response: RazorpayResponse) => {
                    setStatus('verifying')

                    try {
                        // Verify payment
                        const verifyRes = await fetch('/api/payment/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        })

                        const verifyData = await verifyRes.json()

                        if (!verifyRes.ok) {
                            throw new Error(verifyData.error || 'Payment verification failed')
                        }

                        setStatus('success')
                        setTimeout(() => {
                            onSuccess()
                        }, 2000)
                    } catch (err) {
                        setError(err instanceof Error ? err.message : 'Payment verification failed')
                        setStatus('error')
                    }
                },
                modal: {
                    ondismiss: () => {
                        setStatus('idle')
                    },
                },
            }

            const razorpay = new window.Razorpay(options)
            razorpay.open()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
            setStatus('error')
        }
    }

    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Complete Purchase</h2>
                    <button onClick={onClose} className="btn btn-ghost btn-sm p-2">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="modal-body">
                    {status === 'success' ? (
                        <div className="text-center py-8">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
                            <p className="text-foreground-muted">
                                Your purchase is complete. Check your email for access details.
                            </p>
                        </div>
                    ) : status === 'error' ? (
                        <div className="text-center py-8">
                            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Payment Failed</h3>
                            <p className="text-foreground-muted mb-4">{error}</p>
                            <button onClick={() => setStatus('idle')} className="btn btn-primary">
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Product Summary */}
                            <div className="card-static mb-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                                        <CreditCard className="w-8 h-8 text-indigo-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold mb-1 truncate">{product.name}</h3>
                                        <p className="text-sm text-foreground-muted capitalize">{product.type} Product</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-xl font-bold ${appliedPromo ? 'text-foreground-muted line-through text-base' : 'text-indigo-400'}`}>
                                            {formatPrice(originalPrice)}
                                        </span>
                                        {appliedPromo && (
                                            <div className="text-xl font-bold text-green-400">
                                                {formatPrice(finalPrice)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Promo Code Section */}
                            <div className="mb-6">
                                <label className="label mb-2">Promo Code</label>
                                {appliedPromo ? (
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                                        <div className="flex items-center gap-2">
                                            <Tag className="w-4 h-4 text-green-400" />
                                            <span className="font-mono font-semibold text-green-400">
                                                {appliedPromo.code}
                                            </span>
                                            <span className="text-green-400 text-sm">
                                                ({appliedPromo.discount_percent}% OFF)
                                            </span>
                                        </div>
                                        <button
                                            onClick={removePromoCode}
                                            className="text-green-400 hover:text-green-300 text-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                            placeholder="Enter code"
                                            className="input flex-1 font-mono"
                                            onKeyDown={(e) => e.key === 'Enter' && applyPromoCode()}
                                        />
                                        <button
                                            onClick={applyPromoCode}
                                            disabled={promoLoading || !promoCode.trim()}
                                            className="btn btn-outline"
                                        >
                                            {promoLoading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                'Apply'
                                            )}
                                        </button>
                                    </div>
                                )}
                                {promoError && (
                                    <p className="text-red-400 text-sm mt-2">{promoError}</p>
                                )}
                            </div>

                            {/* Order Details */}
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-foreground-muted">Subtotal</span>
                                    <span>{formatPrice(originalPrice)}</span>
                                </div>
                                {appliedPromo && (
                                    <div className="flex justify-between text-sm text-green-400">
                                        <span>Discount ({appliedPromo.discount_percent}%)</span>
                                        <span>-{formatPrice(discountAmount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-foreground-muted">Tax</span>
                                    <span>Included</span>
                                </div>
                                <div className="divider" />
                                <div className="flex justify-between font-semibold">
                                    <span>Total</span>
                                    <span className="text-indigo-400">{formatPrice(finalPrice)}</span>
                                </div>
                            </div>

                            {error && (
                                <div className="alert alert-error mb-4">
                                    <XCircle className="w-5 h-5 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <button
                                onClick={handlePayment}
                                disabled={status !== 'idle'}
                                className="btn btn-primary w-full"
                            >
                                {status === 'creating' && (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Creating Order...
                                    </>
                                )}
                                {status === 'processing' && (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Processing...
                                    </>
                                )}
                                {status === 'verifying' && (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Verifying Payment...
                                    </>
                                )}
                                {status === 'idle' && (
                                    <>
                                        <CreditCard className="w-4 h-4" />
                                        Pay {formatPrice(finalPrice)}
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-center text-foreground-muted mt-4">
                                Secured by Razorpay. Your payment information is encrypted and secure.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
