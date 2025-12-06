import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient, getServiceRoleClient } from '@/lib/supabase/server'
import {
    LayoutDashboard,
    Package,
    Users,
    FileText,
    CreditCard,
    Settings,
    Receipt,
    ArrowLeft
} from 'lucide-react'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Check if admin using pure service role client (bypasses RLS completely)
    const supabaseAdmin = getServiceRoleClient()
    const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

    console.log('Admin check for user:', user.id, 'Profile:', profile, 'Error:', error)

    if (!profile?.is_admin) {
        redirect('/dashboard')
    }

    const navItems = [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/products', label: 'Products', icon: Package },
        { href: '/admin/users', label: 'Users', icon: Users },
        { href: '/admin/transactions', label: 'Transactions', icon: Receipt },
        { href: '/admin/content', label: 'Content', icon: FileText },
        { href: '/admin/settings', label: 'Settings', icon: Settings },
    ]

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="admin-sidebar hidden lg:block">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-bold">DP</span>
                        </div>
                        <div>
                            <h1 className="font-bold">Admin Panel</h1>
                            <p className="text-xs text-foreground-muted">Digital Products</p>
                        </div>
                    </div>
                </div>

                <nav className="space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="admin-nav-item"
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="mt-auto pt-8 border-t border-white/10">
                    <Link href="/" className="admin-nav-item text-foreground-muted">
                        <ArrowLeft className="w-5 h-5" />
                        Back to Site
                    </Link>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-40 glass px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">DP</span>
                        </div>
                        <span className="font-bold">Admin</span>
                    </div>
                    <Link href="/" className="btn btn-ghost btn-sm">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                </div>
                <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="btn btn-ghost btn-sm whitespace-nowrap"
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 p-6 lg:p-8 lg:ml-0 mt-28 lg:mt-0">
                {children}
            </main>
        </div>
    )
}
