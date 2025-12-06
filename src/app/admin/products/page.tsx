'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatDate } from '@/lib/utils'
import {
    Plus,
    Pencil,
    Trash2,
    FileText,
    Users,
    Loader2,
    X,
    Upload,
    AlertCircle,
    CheckCircle
} from 'lucide-react'
import type { Product } from '@/lib/types'

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const supabase = createClient()

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        type: 'pdf' as 'pdf' | 'telegram',
        file_url: '',
        telegram_link: '',
        image_url: '',
        is_active: true,
    })

    useEffect(() => {
        loadProducts()
    }, [])

    const loadProducts = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false })
        if (data) setProducts(data)
        setLoading(false)
    }

    const openModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product)
            setFormData({
                name: product.name,
                description: product.description || '',
                price: product.price.toString(),
                type: product.type,
                file_url: product.file_url || '',
                telegram_link: product.telegram_link || '',
                image_url: product.image_url || '',
                is_active: product.is_active,
            })
        } else {
            setEditingProduct(null)
            setFormData({
                name: '',
                description: '',
                price: '',
                type: 'pdf',
                file_url: '',
                telegram_link: '',
                image_url: '',
                is_active: true,
            })
        }
        setModalOpen(true)
        setError(null)
    }

    const closeModal = () => {
        setModalOpen(false)
        setEditingProduct(null)
        setError(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError(null)

        try {
            const productData = {
                name: formData.name,
                description: formData.description || null,
                price: parseFloat(formData.price),
                type: formData.type,
                file_url: formData.type === 'pdf' ? formData.file_url : null,
                telegram_link: formData.type === 'telegram' ? formData.telegram_link : null,
                image_url: formData.image_url || null,
                is_active: formData.is_active,
            }

            if (editingProduct) {
                const { error } = await supabase
                    .from('products')
                    .update(productData)
                    .eq('id', editingProduct.id)
                if (error) throw error
                setSuccess('Product updated successfully')
            } else {
                const { error } = await supabase
                    .from('products')
                    .insert(productData)
                if (error) throw error
                setSuccess('Product created successfully')
            }

            closeModal()
            loadProducts()
            setTimeout(() => setSuccess(null), 3000)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save product')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (product: Product) => {
        if (!confirm(`Are you sure you want to delete "${product.name}"?`)) return

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', product.id)
            if (error) throw error
            setSuccess('Product deleted successfully')
            loadProducts()
            setTimeout(() => setSuccess(null), 3000)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete product')
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'file_url' | 'image_url') => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            // Sanitize filename: remove special characters, keep only alphanumeric, dots, dashes, underscores
            const sanitizedName = file.name
                .replace(/[^a-zA-Z0-9.\-_]/g, '_')  // Replace invalid chars with underscore
                .replace(/_+/g, '_')  // Replace multiple underscores with single
            const fileName = `${Date.now()}-${sanitizedName}`

            const { data, error } = await supabase.storage
                .from('products')
                .upload(fileName, file)

            if (error) throw error

            const { data: { publicUrl } } = supabase.storage
                .from('products')
                .getPublicUrl(data.path)

            setFormData(prev => ({ ...prev, [field]: publicUrl }))
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to upload file')
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="page-title">Products</h1>
                    <p className="page-description">Manage your digital products</p>
                </div>
                <button onClick={() => openModal()} className="btn btn-primary">
                    <Plus className="w-4 h-4" />
                    Add Product
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
            ) : products.length === 0 ? (
                <div className="card-static">
                    <div className="empty-state">
                        <div className="empty-state-icon">📦</div>
                        <h3 className="empty-state-title">No Products Yet</h3>
                        <p className="mb-4">Create your first product to get started.</p>
                        <button onClick={() => openModal()} className="btn btn-primary">
                            <Plus className="w-4 h-4" />
                            Add Product
                        </button>
                    </div>
                </div>
            ) : (
                <div className="card-static">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Type</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${product.type === 'pdf' ? 'bg-blue-500/10' : 'bg-emerald-500/10'
                                                    }`}>
                                                    {product.type === 'pdf' ? (
                                                        <FileText className="w-5 h-5 text-blue-400" />
                                                    ) : (
                                                        <Users className="w-5 h-5 text-emerald-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{product.name}</div>
                                                    {product.description && (
                                                        <div className="text-sm text-foreground-muted line-clamp-1">
                                                            {product.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${product.type === 'pdf' ? 'badge-info' : 'badge-success'
                                                }`}>
                                                {product.type}
                                            </span>
                                        </td>
                                        <td className="font-semibold">{formatPrice(product.price)}</td>
                                        <td>
                                            <span className={`badge ${product.is_active ? 'badge-success' : 'badge-warning'
                                                }`}>
                                                {product.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="text-foreground-muted">
                                            {formatDate(product.created_at)}
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openModal(product)}
                                                    className="btn btn-ghost btn-sm p-2"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product)}
                                                    className="btn btn-ghost btn-sm p-2 text-red-400 hover:text-red-300"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {modalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal max-w-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header flex items-center justify-between">
                            <h2 className="text-lg font-semibold">
                                {editingProduct ? 'Edit Product' : 'Add Product'}
                            </h2>
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
                                    <label className="label">Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="input"
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <label className="label">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="input textarea"
                                        rows={3}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="input-group">
                                        <label className="label">Price (₹)</label>
                                        <input
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className="input"
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                    </div>

                                    <div className="input-group">
                                        <label className="label">Type</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value as 'pdf' | 'telegram' })}
                                            className="input select"
                                        >
                                            <option value="pdf">PDF</option>
                                            <option value="telegram">Telegram</option>
                                        </select>
                                    </div>
                                </div>

                                {formData.type === 'pdf' ? (
                                    <div className="input-group">
                                        <label className="label">PDF File URL</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="url"
                                                value={formData.file_url}
                                                onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                                                className="input flex-1"
                                                placeholder="https://..."
                                            />
                                            <label className="btn btn-outline cursor-pointer">
                                                <Upload className="w-4 h-4" />
                                                <input
                                                    type="file"
                                                    accept=".pdf"
                                                    className="hidden"
                                                    onChange={(e) => handleFileUpload(e, 'file_url')}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="input-group">
                                        <label className="label">Telegram Invite Link</label>
                                        <input
                                            type="url"
                                            value={formData.telegram_link}
                                            onChange={(e) => setFormData({ ...formData, telegram_link: e.target.value })}
                                            className="input"
                                            placeholder="https://t.me/..."
                                        />
                                    </div>
                                )}

                                <div className="input-group">
                                    <label className="label">Product Image URL (Optional)</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="url"
                                            value={formData.image_url}
                                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                            className="input flex-1"
                                            placeholder="https://..."
                                        />
                                        <label className="btn btn-outline cursor-pointer">
                                            <Upload className="w-4 h-4" />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => handleFileUpload(e, 'image_url')}
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                        className={`toggle ${formData.is_active ? 'active' : ''}`}
                                    />
                                    <span className="text-sm">Active (visible to customers)</span>
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
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Product'
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
