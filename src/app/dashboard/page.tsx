import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FileText, Users, Download, ExternalLink, Package, Receipt } from 'lucide-react'
import { formatDate, formatPrice } from '@/lib/utils'
import type { UserPurchase, Product } from '@/lib/types'

interface Invoice {
    id: string
    invoice_number: string
    amount: number
    created_at: string
}

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Get user purchases with product details
    const { data: purchases } = await supabase
        .from('user_purchases')
        .select(`
      *,
      product:products(*)
    `)
        .eq('user_id', user.id)
        .order('purchased_at', { ascending: false })

    // Get user invoices
    const { data: invoices } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    const typedPurchases = purchases as (UserPurchase & { product: Product })[] | null
    const typedInvoices = invoices as Invoice[] | null

    // Create a map of product_id to invoice
    const invoiceMap = new Map<string, Invoice>()
    typedInvoices?.forEach(inv => {
        // We'll need to match invoices to purchases by checking the product relationship
        // Since invoice has product_id, we can use that
    })

    return (
        <div className="container py-12">
            {/* Header */}
            <div className="page-header">
                <h1 className="page-title">My Dashboard</h1>
                <p className="page-description">
                    Welcome back, {profile?.full_name || user.email}!
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                <div className="stat-card">
                    <Package className="w-8 h-8 text-indigo-400 mb-3" />
                    <div className="stat-value">{typedPurchases?.length || 0}</div>
                    <div className="stat-label">Total Purchases</div>
                </div>
                <div className="stat-card">
                    <FileText className="w-8 h-8 text-blue-400 mb-3" />
                    <div className="stat-value">
                        {typedPurchases?.filter(p => p.product?.type === 'pdf').length || 0}
                    </div>
                    <div className="stat-label">PDFs Owned</div>
                </div>
                <div className="stat-card">
                    <Users className="w-8 h-8 text-emerald-400 mb-3" />
                    <div className="stat-value">
                        {typedPurchases?.filter(p => p.product?.type === 'telegram').length || 0}
                    </div>
                    <div className="stat-label">Group Memberships</div>
                </div>
            </div>

            {/* Purchases */}
            <div className="card-static mb-8">
                <h2 className="text-xl font-semibold mb-6">My Purchases</h2>

                {!typedPurchases || typedPurchases.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📦</div>
                        <h3 className="empty-state-title">No Purchases Yet</h3>
                        <p className="mb-4">Browse our products and make your first purchase!</p>
                        <a href="/#products" className="btn btn-primary">
                            Browse Products
                        </a>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {typedPurchases.map((purchase) => {
                            // Find matching invoice for this purchase
                            const matchingInvoice = typedInvoices?.find(
                                inv => inv.id && purchase.product_id
                            )

                            return (
                                <div
                                    key={purchase.id}
                                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                    {/* Icon */}
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${purchase.product?.type === 'pdf'
                                        ? 'bg-blue-500/10'
                                        : 'bg-emerald-500/10'
                                        }`}>
                                        {purchase.product?.type === 'pdf' ? (
                                            <FileText className="w-6 h-6 text-blue-400" />
                                        ) : (
                                            <Users className="w-6 h-6 text-emerald-400" />
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold truncate">
                                            {purchase.product?.name || 'Unknown Product'}
                                        </h3>
                                        <div className="flex items-center gap-3 text-sm text-foreground-muted mt-1">
                                            <span className="capitalize">{purchase.product?.type}</span>
                                            <span>•</span>
                                            <span>{formatDate(purchase.purchased_at)}</span>
                                            {purchase.product?.price && (
                                                <>
                                                    <span>•</span>
                                                    <span>{formatPrice(purchase.product.price)}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {purchase.product?.type === 'pdf' ? (
                                            <a
                                                href={purchase.access_link || purchase.product?.file_url || '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-primary btn-sm"
                                            >
                                                <Download className="w-4 h-4" />
                                                Download
                                            </a>
                                        ) : (
                                            <a
                                                href={purchase.access_link || purchase.product?.telegram_link || '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-secondary btn-sm"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                Join
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Invoices Section */}
            {typedInvoices && typedInvoices.length > 0 && (
                <div className="card-static">
                    <h2 className="text-xl font-semibold mb-6">My Invoices</h2>
                    <div className="space-y-3">
                        {typedInvoices.map((invoice) => (
                            <div
                                key={invoice.id}
                                className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                        <Receipt className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="font-semibold font-mono">{invoice.invoice_number}</p>
                                        <p className="text-sm text-foreground-muted">
                                            {formatDate(invoice.created_at)} • {formatPrice(invoice.amount)}
                                        </p>
                                    </div>
                                </div>
                                <a
                                    href={`/api/invoice/generate?id=${invoice.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-outline btn-sm"
                                >
                                    <Receipt className="w-4 h-4" />
                                    View Invoice
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
