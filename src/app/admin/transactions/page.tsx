'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatDate } from '@/lib/utils'
import {
    Search,
    Loader2,
    Filter,
    Download,
    FileText,
    Users
} from 'lucide-react'
import type { Transaction, Product, Profile } from '@/lib/types'

type TransactionWithRelations = Transaction & {
    product: Product | null
    profile: Profile | null
}

export default function AdminTransactionsPage() {
    const [transactions, setTransactions] = useState<TransactionWithRelations[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const supabase = createClient()

    useEffect(() => {
        loadTransactions()
    }, [])

    const loadTransactions = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('transactions')
            .select(`
        *,
        product:products(*),
        profile:profiles(*)
      `)
            .order('created_at', { ascending: false })

        if (data) {
            setTransactions(data as TransactionWithRelations[])
        }
        setLoading(false)
    }

    const filteredTransactions = transactions.filter(tx => {
        const matchesSearch =
            tx.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.razorpay_order_id?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === 'all' || tx.status === statusFilter

        return matchesSearch && matchesStatus
    })

    const exportCSV = () => {
        const headers = ['Date', 'Customer', 'Product', 'Amount', 'Status', 'Order ID', 'Payment ID']
        const rows = filteredTransactions.map(tx => [
            formatDate(tx.created_at),
            tx.profile?.email || 'Unknown',
            tx.product?.name || 'Unknown',
            tx.amount.toString(),
            tx.status,
            tx.razorpay_order_id || '',
            tx.razorpay_payment_id || ''
        ])

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
    }

    const stats = {
        total: transactions.length,
        success: transactions.filter(t => t.status === 'success').length,
        pending: transactions.filter(t => t.status === 'pending').length,
        failed: transactions.filter(t => t.status === 'failed').length,
        revenue: transactions
            .filter(t => t.status === 'success')
            .reduce((sum, t) => sum + Number(t.amount), 0)
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="page-title">Transactions</h1>
                    <p className="page-description">View and manage payment transactions</p>
                </div>
                <button onClick={exportCSV} className="btn btn-outline">
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
                <div className="card-static text-center">
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="text-sm text-foreground-muted">Total</div>
                </div>
                <div className="card-static text-center">
                    <div className="text-2xl font-bold text-emerald-400">{stats.success}</div>
                    <div className="text-sm text-foreground-muted">Success</div>
                </div>
                <div className="card-static text-center">
                    <div className="text-2xl font-bold text-amber-400">{stats.pending}</div>
                    <div className="text-sm text-foreground-muted">Pending</div>
                </div>
                <div className="card-static text-center">
                    <div className="text-2xl font-bold text-red-400">{stats.failed}</div>
                    <div className="text-sm text-foreground-muted">Failed</div>
                </div>
                <div className="card-static text-center">
                    <div className="text-2xl font-bold text-indigo-400">{formatPrice(stats.revenue)}</div>
                    <div className="text-sm text-foreground-muted">Revenue</div>
                </div>
            </div>

            <div className="card-static">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                        <input
                            type="text"
                            placeholder="Search by email, product, or order ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input pl-10"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-foreground-muted" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="input select w-auto"
                        >
                            <option value="all">All Status</option>
                            <option value="success">Success</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="empty-state py-8">
                        <div className="empty-state-icon">💳</div>
                        <h3 className="empty-state-title">No Transactions Found</h3>
                        <p>
                            {searchTerm || statusFilter !== 'all'
                                ? 'Try adjusting your filters'
                                : 'Transactions will appear here when customers make purchases'}
                        </p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Customer</th>
                                    <th>Product</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Order ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.map((tx) => (
                                    <tr key={tx.id}>
                                        <td className="text-foreground-muted">
                                            {formatDate(tx.created_at)}
                                        </td>
                                        <td>{tx.profile?.email || 'Unknown'}</td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.product?.type === 'pdf' ? 'bg-blue-500/10' : 'bg-emerald-500/10'
                                                    }`}>
                                                    {tx.product?.type === 'pdf' ? (
                                                        <FileText className="w-4 h-4 text-blue-400" />
                                                    ) : (
                                                        <Users className="w-4 h-4 text-emerald-400" />
                                                    )}
                                                </div>
                                                <span>{tx.product?.name || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="font-semibold">{formatPrice(tx.amount)}</td>
                                        <td>
                                            <span className={`badge ${tx.status === 'success' ? 'badge-success' :
                                                    tx.status === 'pending' ? 'badge-warning' :
                                                        'badge-danger'
                                                }`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="text-foreground-muted text-xs font-mono">
                                            {tx.razorpay_order_id || '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="mt-4 text-sm text-foreground-muted">
                    Showing {filteredTransactions.length} of {transactions.length} transactions
                </div>
            </div>
        </div>
    )
}
