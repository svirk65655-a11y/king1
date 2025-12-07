'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import {
    Plus,
    Trash2,
    Loader2,
    X,
    AlertCircle,
    CheckCircle,
    Tag,
    Copy,
    RefreshCw
} from 'lucide-react'

interface PromoCode {
    id: string
    code: string
    discount_percent: number
    max_uses: number | null
    used_count: number
    is_active: boolean
    expires_at: string | null
    created_at: string
}

export default function AdminPromoCodesPage() {
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const supabase = createClient()

    // Form state
    const [formData, setFormData] = useState({
        code: '',
        discount_percent: '10',
        max_uses: '',
        expires_at: '',
        is_active: true,
    })

    useEffect(() => {
        loadPromoCodes()
    }, [])

    const loadPromoCodes = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('promo_codes')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            setError(error.message)
        } else if (data) {
            setPromoCodes(data)
        }
        setLoading(false)
    }

    const generateRandomCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let code = ''
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        setFormData({ ...formData, code })
    }

    const openModal = () => {
        setFormData({
            code: '',
            discount_percent: '10',
            max_uses: '',
            expires_at: '',
            is_active: true,
        })
        setModalOpen(true)
        setError(null)
    }

    const closeModal = () => {
        setModalOpen(false)
        setError(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError(null)

        try {
            const promoData = {
                code: formData.code.toUpperCase().trim(),
                discount_percent: parseInt(formData.discount_percent),
                max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
                expires_at: formData.expires_at || null,
                is_active: formData.is_active,
            }

            const { error } = await supabase
                .from('promo_codes')
                .insert(promoData)

            if (error) throw error

            setSuccess('Promo code created successfully')
            closeModal()
            loadPromoCodes()
            setTimeout(() => setSuccess(null), 3000)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create promo code')
        } finally {
            setSaving(false)
        }
    }

    const toggleActive = async (promo: PromoCode) => {
        try {
            const { error } = await supabase
                .from('promo_codes')
                .update({ is_active: !promo.is_active })
                .eq('id', promo.id)

            if (error) throw error
            loadPromoCodes()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update promo code')
        }
    }

    const handleDelete = async (promo: PromoCode) => {
        if (!confirm(`Are you sure you want to delete promo code "${promo.code}"?`)) return

        try {
            const { error } = await supabase
                .from('promo_codes')
                .delete()
                .eq('id', promo.id)

            if (error) throw error
            setSuccess('Promo code deleted successfully')
            loadPromoCodes()
            setTimeout(() => setSuccess(null), 3000)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete promo code')
        }
    }

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code)
        setSuccess(`Copied "${code}" to clipboard`)
        setTimeout(() => setSuccess(null), 2000)
    }

    const isExpired = (expiresAt: string | null) => {
        if (!expiresAt) return false
        return new Date(expiresAt) < new Date()
    }

    const isMaxedOut = (promo: PromoCode) => {
        if (!promo.max_uses) return false
        return promo.used_count >= promo.max_uses
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="page-title">Promo Codes</h1>
                    <p className="page-description">Create and manage discount codes</p>
                </div>
                <button onClick={openModal} className="btn btn-primary">
                    <Plus className="w-4 h-4" />
                    Create Code
                </button>
            </div>

            {success && (
                <div className="alert alert-success mb-6">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{success}</span>
                </div>
            )}

            {error && !modalOpen && (
                <div className="alert alert-error mb-6">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            ) : promoCodes.length === 0 ? (
                <div className="card-static">
                    <div className="empty-state">
                        <div className="empty-state-icon">🏷️</div>
                        <h3 className="empty-state-title">No Promo Codes Yet</h3>
                        <p className="mb-4">Create your first promo code to offer discounts.</p>
                        <button onClick={openModal} className="btn btn-primary">
                            <Plus className="w-4 h-4" />
                            Create Code
                        </button>
                    </div>
                </div>
            ) : (
                <div className="card-static">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Discount</th>
                                    <th>Usage</th>
                                    <th>Expires</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {promoCodes.map((promo) => (
                                    <tr key={promo.id}>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <Tag className="w-4 h-4 text-purple-400" />
                                                <span className="font-mono font-semibold">{promo.code}</span>
                                                <button
                                                    onClick={() => copyCode(promo.code)}
                                                    className="btn btn-ghost btn-sm p-1"
                                                    title="Copy code"
                                                >
                                                    <Copy className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="text-green-400 font-semibold">
                                                {promo.discount_percent}% OFF
                                            </span>
                                        </td>
                                        <td>
                                            <span className={isMaxedOut(promo) ? 'text-red-400' : ''}>
                                                {promo.used_count}
                                                {promo.max_uses ? ` / ${promo.max_uses}` : ' / ∞'}
                                            </span>
                                        </td>
                                        <td>
                                            {promo.expires_at ? (
                                                <span className={isExpired(promo.expires_at) ? 'text-red-400' : ''}>
                                                    {formatDate(promo.expires_at)}
                                                    {isExpired(promo.expires_at) && ' (Expired)'}
                                                </span>
                                            ) : (
                                                <span className="text-foreground-muted">Never</span>
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => toggleActive(promo)}
                                                className={`badge cursor-pointer ${promo.is_active && !isExpired(promo.expires_at) && !isMaxedOut(promo)
                                                        ? 'badge-success'
                                                        : 'badge-warning'
                                                    }`}
                                            >
                                                {promo.is_active ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleDelete(promo)}
                                                className="btn btn-ghost btn-sm p-2 text-red-400 hover:text-red-300"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {modalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Create Promo Code</h2>
                            <button onClick={closeModal} className="btn btn-ghost btn-sm p-2">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body space-y-4">
                                {error && (
                                    <div className="alert alert-error">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div className="input-group">
                                    <label className="label">Promo Code</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                            className="input flex-1 font-mono"
                                            placeholder="e.g., SAVE20"
                                            required
                                            maxLength={20}
                                        />
                                        <button
                                            type="button"
                                            onClick={generateRandomCode}
                                            className="btn btn-outline"
                                            title="Generate random code"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-foreground-muted mt-1">
                                        Letters and numbers only, will be uppercase
                                    </p>
                                </div>

                                <div className="input-group">
                                    <label className="label">Discount Percentage</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={formData.discount_percent}
                                            onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                                            className="input pr-10"
                                            min="1"
                                            max="100"
                                            required
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted">
                                            %
                                        </span>
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label className="label">Max Uses (Optional)</label>
                                    <input
                                        type="number"
                                        value={formData.max_uses}
                                        onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                                        className="input"
                                        min="1"
                                        placeholder="Unlimited"
                                    />
                                    <p className="text-xs text-foreground-muted mt-1">
                                        Leave empty for unlimited uses
                                    </p>
                                </div>

                                <div className="input-group">
                                    <label className="label">Expiration Date (Optional)</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.expires_at}
                                        onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                                        className="input"
                                    />
                                    <p className="text-xs text-foreground-muted mt-1">
                                        Leave empty for no expiration
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                        className={`toggle ${formData.is_active ? 'active' : ''}`}
                                    />
                                    <span className="text-sm">Active immediately</span>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" onClick={closeModal} className="btn btn-ghost">
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving} className="btn btn-primary">
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Code'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
