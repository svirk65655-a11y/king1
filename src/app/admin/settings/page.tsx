'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Loader2,
    Save,
    AlertCircle,
    CheckCircle,
    Eye,
    EyeOff,
    CreditCard,
    Mail,
    Globe
} from 'lucide-react'

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [showSecrets, setShowSecrets] = useState(false)
    const supabase = createClient()

    // Razorpay settings
    const [razorpayKeyId, setRazorpayKeyId] = useState('')
    const [razorpayKeySecret, setRazorpayKeySecret] = useState('')
    const [razorpayWebhookSecret, setRazorpayWebhookSecret] = useState('')

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        setLoading(true)

        try {
            const { data } = await supabase
                .from('payment_config')
                .select('key, value')

            if (data) {
                data.forEach((config) => {
                    switch (config.key) {
                        case 'razorpay_key_id':
                            setRazorpayKeyId(config.value)
                            break
                        case 'razorpay_key_secret':
                            setRazorpayKeySecret(config.value)
                            break
                        case 'razorpay_webhook_secret':
                            setRazorpayWebhookSecret(config.value)
                            break
                    }
                })
            }
        } catch (err) {
            console.error('Failed to load settings:', err)
        }

        setLoading(false)
    }

    const handleSavePayment = async () => {
        setSaving(true)
        setError(null)

        try {
            const configs = [
                { key: 'razorpay_key_id', value: razorpayKeyId },
                { key: 'razorpay_key_secret', value: razorpayKeySecret },
                { key: 'razorpay_webhook_secret', value: razorpayWebhookSecret },
            ]

            for (const config of configs) {
                if (config.value) {
                    const { error } = await supabase
                        .from('payment_config')
                        .upsert(config)
                    if (error) throw error
                }
            }

            setSuccess('Payment settings saved successfully')
            setTimeout(() => setSuccess(null), 3000)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save settings')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Settings</h1>
                <p className="page-description">Configure payment gateway and other settings</p>
            </div>

            {success && (
                <div className="alert alert-success mb-6">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{success}</span>
                </div>
            )}

            {error && (
                <div className="alert alert-error mb-6">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Razorpay Settings */}
                    <div className="card-static">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">Razorpay Configuration</h2>
                                <p className="text-sm text-foreground-muted">Configure your payment gateway credentials</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="input-group">
                                <label className="label">Key ID</label>
                                <input
                                    type="text"
                                    value={razorpayKeyId}
                                    onChange={(e) => setRazorpayKeyId(e.target.value)}
                                    className="input font-mono"
                                    placeholder="rzp_test_xxxxxxxx"
                                />
                            </div>

                            <div className="input-group">
                                <label className="label flex items-center justify-between">
                                    Key Secret
                                    <button
                                        type="button"
                                        onClick={() => setShowSecrets(!showSecrets)}
                                        className="btn btn-ghost btn-sm p-1"
                                    >
                                        {showSecrets ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </label>
                                <input
                                    type={showSecrets ? 'text' : 'password'}
                                    value={razorpayKeySecret}
                                    onChange={(e) => setRazorpayKeySecret(e.target.value)}
                                    className="input font-mono"
                                    placeholder="••••••••••••••••"
                                />
                            </div>

                            <div className="input-group">
                                <label className="label">Webhook Secret</label>
                                <input
                                    type={showSecrets ? 'text' : 'password'}
                                    value={razorpayWebhookSecret}
                                    onChange={(e) => setRazorpayWebhookSecret(e.target.value)}
                                    className="input font-mono"
                                    placeholder="••••••••••••••••"
                                />
                                <p className="text-xs text-foreground-muted mt-1">
                                    Set up webhook URL: {typeof window !== 'undefined' ? window.location.origin : ''}/api/payment/webhook
                                </p>
                            </div>

                            <button
                                onClick={handleSavePayment}
                                disabled={saving}
                                className="btn btn-primary"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Payment Settings
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Environment Info */}
                    <div className="card-static">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                <Globe className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">Environment Information</h2>
                                <p className="text-sm text-foreground-muted">Current configuration status</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-white/10">
                                <span className="text-foreground-muted">Supabase</span>
                                <span className="badge badge-success">Connected</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-white/10">
                                <span className="text-foreground-muted">Razorpay Key ID</span>
                                <span className={`badge ${razorpayKeyId ? 'badge-success' : 'badge-warning'}`}>
                                    {razorpayKeyId ? 'Configured' : 'Not Set'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-white/10">
                                <span className="text-foreground-muted">Razorpay Secret</span>
                                <span className={`badge ${razorpayKeySecret ? 'badge-success' : 'badge-warning'}`}>
                                    {razorpayKeySecret ? 'Configured' : 'Not Set'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-foreground-muted">Webhook Secret</span>
                                <span className={`badge ${razorpayWebhookSecret ? 'badge-success' : 'badge-warning'}`}>
                                    {razorpayWebhookSecret ? 'Configured' : 'Not Set'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Email Info */}
                    <div className="card-static">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                <Mail className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">Email Configuration</h2>
                                <p className="text-sm text-foreground-muted">SMTP settings for sending emails</p>
                            </div>
                        </div>

                        <div className="alert alert-info">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <div>
                                <p className="font-medium">Email configuration is set via environment variables</p>
                                <p className="text-sm mt-1">
                                    Configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and EMAIL_FROM in your .env.local file or deployment settings.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
