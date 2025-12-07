'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Menu, X, User, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react'
import type { Profile } from '@/lib/types'

export default function Navbar() {
    const pathname = usePathname()
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [user, setUser] = useState<{ email: string } | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUser({ email: user.email || '' })
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()
                if (profileData) {
                    setProfile(profileData)
                }
            }
        }
        getUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                setUser({ email: session.user.email || '' })
            } else {
                setUser(null)
                setProfile(null)
            }
        })

        return () => subscription.unsubscribe()
    }, [supabase])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        setUser(null)
        setProfile(null)
        router.push('/')
        router.refresh()
    }

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/privacy-policy', label: 'Privacy' },
        { href: '/refund-policy', label: 'Refunds' },
        { href: '/terms', label: 'Terms' },
        { href: '/contact', label: 'Contact' },
    ]

    return (
        <nav className="glass sticky top-0 z-50">
            <div className="container">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">DP</span>
                        </div>
                        <span className="font-bold text-lg hidden sm:inline">Digital Products</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`nav-link ${pathname === link.href ? 'active' : ''}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Auth Section */}
                    <div className="flex items-center gap-3">
                        {user ? (
                            <div className="relative dropdown">
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center gap-2 btn btn-ghost btn-sm"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                        <User className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="hidden sm:inline text-sm max-w-[120px] truncate">
                                        {profile?.full_name || user.email}
                                    </span>
                                </button>

                                {dropdownOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-30"
                                            onClick={() => setDropdownOpen(false)}
                                        />
                                        <div className="dropdown-menu">
                                            <Link
                                                href="/dashboard"
                                                className="dropdown-item"
                                                onClick={() => setDropdownOpen(false)}
                                            >
                                                <LayoutDashboard className="w-4 h-4" />
                                                Dashboard
                                            </Link>
                                            {profile?.is_admin && (
                                                <Link
                                                    href="/admin"
                                                    className="dropdown-item"
                                                    onClick={() => setDropdownOpen(false)}
                                                >
                                                    <ShieldCheck className="w-4 h-4" />
                                                    Admin Panel
                                                </Link>
                                            )}
                                            <div className="dropdown-divider" />
                                            <button
                                                onClick={handleLogout}
                                                className="dropdown-item w-full text-left text-red-400"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Logout
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/login" className="btn btn-ghost btn-sm">
                                    Login
                                </Link>
                                <Link href="/signup" className="btn btn-primary btn-sm">
                                    Sign Up
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden btn btn-ghost btn-sm p-2"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isOpen && (
                    <div className="md:hidden py-4 border-t border-white/10 animate-slide-down">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`block py-2 px-4 rounded-lg transition-colors ${pathname === link.href
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-foreground-muted hover:bg-white/5'
                                    }`}
                                onClick={() => setIsOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    )
}
