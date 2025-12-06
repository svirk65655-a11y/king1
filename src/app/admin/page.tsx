import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import {
    TrendingUp,
    Users,
    Package,
    CreditCard,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboardPage() {
    const supabase = await createClient()

    // Get stats
    const [
        { count: totalUsers },
        { count: totalProducts },
        { data: transactions },
        { data: recentTransactions },
    ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('transactions').select('amount, status'),
        supabase
            .from('transactions')
            .select('*, product:products(name), profile:profiles(email)')
            .order('created_at', { ascending: false })
            .limit(5),
    ])

    const successfulTransactions = transactions?.filter(t => t.status === 'success') || []
    const totalRevenue = successfulTransactions.reduce((sum, t) => sum + Number(t.amount), 0)
    const totalTransactions = transactions?.length || 0

    // Get this month's stats
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: monthTransactions } = await supabase
        .from('transactions')
        .select('amount, status')
        .gte('created_at', startOfMonth.toISOString())

    const monthlyRevenue = monthTransactions
        ?.filter(t => t.status === 'success')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0

    const { count: monthlyUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString())

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-description">Overview of your business metrics</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="stat-card">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-indigo-400" />
                        </div>
                        <span className="badge badge-success flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3" />
                            {monthlyRevenue > 0 ? '+' + formatPrice(monthlyRevenue) : '—'}
                        </span>
                    </div>
                    <div className="stat-value">{formatPrice(totalRevenue)}</div>
                    <div className="stat-label">Total Revenue</div>
                </div>

                <div className="stat-card">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <Users className="w-6 h-6 text-emerald-400" />
                        </div>
                        <span className="badge badge-success flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3" />
                            +{monthlyUsers || 0}
                        </span>
                    </div>
                    <div className="stat-value">{totalUsers || 0}</div>
                    <div className="stat-label">Total Users</div>
                </div>

                <div className="stat-card">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                            <Package className="w-6 h-6 text-purple-400" />
                        </div>
                    </div>
                    <div className="stat-value">{totalProducts || 0}</div>
                    <div className="stat-label">Total Products</div>
                </div>

                <div className="stat-card">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-amber-400" />
                        </div>
                    </div>
                    <div className="stat-value">{totalTransactions}</div>
                    <div className="stat-label">Total Transactions</div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="card-static">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Recent Transactions</h2>
                    <Link href="/admin/transactions" className="btn btn-ghost btn-sm">
                        View All
                    </Link>
                </div>

                {!recentTransactions || recentTransactions.length === 0 ? (
                    <div className="empty-state py-8">
                        <div className="empty-state-icon">💳</div>
                        <h3 className="empty-state-title">No Transactions Yet</h3>
                        <p>Transactions will appear here once customers make purchases.</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Product</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTransactions.map((tx: any) => (
                                    <tr key={tx.id}>
                                        <td>
                                            <span className="text-foreground-muted">
                                                {tx.profile?.email || 'Unknown'}
                                            </span>
                                        </td>
                                        <td>{tx.product?.name || 'Unknown Product'}</td>
                                        <td className="font-semibold">{formatPrice(tx.amount)}</td>
                                        <td>
                                            <span className={`badge ${tx.status === 'success' ? 'badge-success' :
                                                    tx.status === 'pending' ? 'badge-warning' :
                                                        'badge-danger'
                                                }`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
