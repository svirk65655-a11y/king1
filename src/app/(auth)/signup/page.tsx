'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, User, Loader2, AlertCircle, CheckCircle, MailOpen } from 'lucide-react'

function SignupForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirectTo = searchParams.get('redirectTo') || '/dashboard'

    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [needsEmailVerification, setNeedsEmailVerification] = useState(false)

    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccessMessage(null)
        setNeedsEmailVerification(false)

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            })

            if (error) throw error

            // Check if email confirmation is required
            // If identities array is empty, it means email confirmation is needed
            // or user already exists
            if (data.user && data.user.identities && data.user.identities.length === 0) {
                setError('An account with this email already exists. Please sign in instead.')
                setLoading(false)
                return
            }

            // Check if session exists (email confirmation disabled)
            if (data.session) {
                // Auto-logged in, redirect directly
                setSuccessMessage('Account created successfully! Redirecting...')
                setTimeout(() => {
                    router.push(redirectTo)
                    router.refresh()
                }, 1000)
            } else {
                // Email confirmation required
                setNeedsEmailVerification(true)
                setSuccessMessage('Account created! Please check your email to verify your account.')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create account')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                <div className="card-static">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                            <span className="text-white font-bold text-2xl">DP</span>
                        </div>
                        <h1 className="text-2xl font-bold">Create Account</h1>
                        <p className="text-foreground-muted mt-2">Join us and start exploring</p>
                    </div>

                    {error && (
                        <div className="alert alert-error mb-6">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {needsEmailVerification ? (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto mb-6">
                                <MailOpen className="w-10 h-10 text-indigo-400" />
                            </div>
                            <h2 className="text-xl font-semibold mb-2">Check Your Email</h2>
                            <p className="text-foreground-muted mb-6">
                                We&apos;ve sent a verification link to<br />
                                <strong className="text-foreground">{email}</strong>
                            </p>
                            <p className="text-sm text-foreground-muted mb-6">
                                Click the link in the email to verify your account and start shopping.
                            </p>
                            <Link href="/login" className="btn btn-primary">
                                Go to Login
                            </Link>
                        </div>
                    ) : (
                        <>
                            {successMessage && !needsEmailVerification && (
                                <div className="alert alert-success mb-6">
                                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                    <span>{successMessage}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="input-group">
                                    <label htmlFor="fullName" className="label">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                                        <input
                                            id="fullName"
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="John Doe"
                                            className="input pl-10"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label htmlFor="email" className="label">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            className="input pl-10"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label htmlFor="password" className="label">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                                        <input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="input pl-10"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                    <p className="text-xs text-foreground-muted mt-1">
                                        Must be at least 6 characters
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !!successMessage}
                                    className="btn btn-primary w-full mt-6"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Creating account...
                                        </>
                                    ) : (
                                        'Create Account'
                                    )}
                                </button>
                            </form>

                            <p className="text-center text-sm text-foreground-muted mt-6">
                                Already have an account?{' '}
                                <Link href={`/login?redirectTo=${redirectTo}`} className="text-indigo-400 hover:text-indigo-300">
                                    Sign in
                                </Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

function SignupFallback() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                <div className="card-static">
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function SignupPage() {
    return (
        <Suspense fallback={<SignupFallback />}>
            <SignupForm />
        </Suspense>
    )
}
