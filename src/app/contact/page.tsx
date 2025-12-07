import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Contact Us | C&P Videos',
    description: 'Get in touch with us. We\'re here to help with any questions about our products and services.',
}

export default function ContactPage() {
    return (
        <div className="container py-12">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="text-gradient">Get in Touch</span>
                    </h1>
                    <p className="text-white/70 text-lg max-w-2xl mx-auto">
                        Have questions about our products or need assistance? We&apos;re here to help!
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Contact Info Card */}
                    <div className="card-static p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-white">Email Us</h2>
                                <p className="text-white/60 text-sm">We&apos;ll respond within 24-48 hours</p>
                            </div>
                        </div>

                        <a
                            href="mailto:support@candpvideos.com"
                            className="text-2xl font-bold text-gradient hover:opacity-80 transition-opacity block mb-6"
                        >
                            support@candpvideos.com
                        </a>

                        <div className="space-y-4 text-white/70">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="text-white font-medium">Response Time</p>
                                    <p className="text-sm">24-48 hours on business days</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                </svg>
                                <div>
                                    <p className="text-white font-medium">Website</p>
                                    <p className="text-sm">www.candpvideos.com</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links Card */}
                    <div className="card-static p-8">
                        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            Quick Links
                        </h2>

                        <div className="space-y-3">
                            <Link
                                href="/dashboard"
                                className="block p-4 rounded-xl border border-white/10 hover:border-purple-500/50 hover:bg-white/5 transition-all group"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-white group-hover:text-purple-400 transition-colors">My Dashboard</span>
                                    <svg className="w-5 h-5 text-white/40 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                                <p className="text-sm text-white/50 mt-1">Access your purchased products</p>
                            </Link>

                            <Link
                                href="/refund-policy"
                                className="block p-4 rounded-xl border border-white/10 hover:border-purple-500/50 hover:bg-white/5 transition-all group"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-white group-hover:text-purple-400 transition-colors">Refund Policy</span>
                                    <svg className="w-5 h-5 text-white/40 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                                <p className="text-sm text-white/50 mt-1">Read our refund policy</p>
                            </Link>

                            <Link
                                href="/"
                                className="block p-4 rounded-xl border border-white/10 hover:border-purple-500/50 hover:bg-white/5 transition-all group"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-white group-hover:text-purple-400 transition-colors">Browse Products</span>
                                    <svg className="w-5 h-5 text-white/40 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                                <p className="text-sm text-white/50 mt-1">Explore our digital products</p>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mt-12 card-static p-8">
                    <h2 className="text-2xl font-bold text-white mb-6 text-center">
                        Frequently Asked Questions
                    </h2>

                    <div className="space-y-4 max-w-3xl mx-auto">
                        <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                            <h3 className="text-white font-semibold mb-2">How do I access my purchased products?</h3>
                            <p className="text-white/60 text-sm">After purchase, you can access all your products from your Dashboard. You&apos;ll also receive an email with access links.</p>
                        </div>

                        <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                            <h3 className="text-white font-semibold mb-2">I didn&apos;t receive my download link. What should I do?</h3>
                            <p className="text-white/60 text-sm">First, check your spam folder. If you still can&apos;t find it, email us at support@candpvideos.com with your order details.</p>
                        </div>

                        <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                            <h3 className="text-white font-semibold mb-2">What payment methods do you accept?</h3>
                            <p className="text-white/60 text-sm">We accept all major payment methods through Razorpay including UPI, credit/debit cards, net banking, and wallets.</p>
                        </div>

                        <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                            <h3 className="text-white font-semibold mb-2">Can I get a refund?</h3>
                            <p className="text-white/60 text-sm">Due to the digital nature of our products, refunds are handled on a case-by-case basis. Please read our <Link href="/refund-policy" className="text-purple-400 hover:underline">Refund Policy</Link> for details.</p>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="mt-12 text-center">
                    <div className="inline-block p-8 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30">
                        <h3 className="text-xl font-semibold text-white mb-2">Still have questions?</h3>
                        <p className="text-white/60 mb-4">Don&apos;t hesitate to reach out!</p>
                        <a
                            href="mailto:support@candpvideos.com"
                            className="btn-primary inline-flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Email Support
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
