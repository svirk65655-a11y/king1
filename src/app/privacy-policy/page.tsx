import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Privacy Policy | C&P Videos',
    description: 'Privacy Policy for C&P Videos - Learn how we collect, use, and protect your personal information.',
}

export default function PrivacyPolicyPage() {
    return (
        <div className="container py-12">
            <div className="max-w-4xl mx-auto">
                <div className="card-static p-8 md:p-12">
                    <div className="prose prose-invert max-w-none">
                        <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-2">Privacy Policy</h1>
                        <p className="text-white/60 mb-8">Last Updated: December 7, 2024</p>

                        <p className="text-white/80 leading-relaxed">
                            At C&P Videos (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), we are committed to protecting your privacy.
                            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you
                            visit our website <strong>www.candpvideos.com</strong> and use our services.
                        </p>

                        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Information We Collect</h2>

                        <h3 className="text-xl font-medium text-white/90 mt-6 mb-3">1.1 Personal Information</h3>
                        <p className="text-white/70 mb-4">We may collect personal information that you voluntarily provide, including:</p>
                        <ul className="list-disc list-inside text-white/70 space-y-2 mb-4">
                            <li>Name and email address</li>
                            <li>Phone number (optional)</li>
                            <li>Billing information and payment details</li>
                            <li>Account credentials</li>
                            <li>Any other information you choose to provide</li>
                        </ul>

                        <h3 className="text-xl font-medium text-white/90 mt-6 mb-3">1.2 Automatically Collected Information</h3>
                        <p className="text-white/70 mb-4">When you access our website, we may automatically collect:</p>
                        <ul className="list-disc list-inside text-white/70 space-y-2 mb-4">
                            <li>IP address and browser type</li>
                            <li>Device information</li>
                            <li>Pages visited and time spent</li>
                            <li>Referring website addresses</li>
                            <li>Cookies and similar tracking technologies</li>
                        </ul>

                        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. How We Use Your Information</h2>
                        <p className="text-white/70 mb-4">We use the collected information for the following purposes:</p>
                        <ul className="list-disc list-inside text-white/70 space-y-2 mb-4">
                            <li>To process and fulfill your orders</li>
                            <li>To provide access to purchased digital products</li>
                            <li>To send order confirmations and receipts</li>
                            <li>To communicate with you about your account or transactions</li>
                            <li>To send promotional emails (with your consent)</li>
                            <li>To improve our website and services</li>
                            <li>To prevent fraud and enhance security</li>
                            <li>To comply with legal obligations</li>
                        </ul>

                        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. Payment Information</h2>
                        <p className="text-white/70 mb-4">
                            We use <strong>Razorpay</strong> as our payment gateway. When you make a purchase:
                        </p>
                        <ul className="list-disc list-inside text-white/70 space-y-2 mb-4">
                            <li>Your payment information is processed directly by Razorpay</li>
                            <li>We do not store your complete credit/debit card details</li>
                            <li>Razorpay&apos;s privacy policy applies to payment processing</li>
                            <li>We only receive transaction confirmation and partial card details for records</li>
                        </ul>

                        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">4. Sharing of Information</h2>
                        <p className="text-white/70 mb-4">We may share your information with:</p>
                        <ul className="list-disc list-inside text-white/70 space-y-2 mb-4">
                            <li><strong>Service Providers:</strong> Third-party vendors who assist in our operations (payment processors, email services, hosting)</li>
                            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                            <li><strong>Business Transfers:</strong> In connection with any merger, sale, or acquisition</li>
                        </ul>
                        <p className="text-white/70 mb-4">
                            <strong>We do not sell your personal information to third parties.</strong>
                        </p>

                        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">5. Data Security</h2>
                        <p className="text-white/70 mb-4">
                            We implement appropriate technical and organizational security measures to protect your personal
                            information, including:
                        </p>
                        <ul className="list-disc list-inside text-white/70 space-y-2 mb-4">
                            <li>SSL/TLS encryption for data transmission</li>
                            <li>Secure password hashing</li>
                            <li>Regular security assessments</li>
                            <li>Limited access to personal data</li>
                        </ul>

                        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">6. Cookies</h2>
                        <p className="text-white/70 mb-4">
                            We use cookies and similar technologies to enhance your experience. Cookies help us:
                        </p>
                        <ul className="list-disc list-inside text-white/70 space-y-2 mb-4">
                            <li>Remember your preferences and login status</li>
                            <li>Understand how you use our website</li>
                            <li>Improve our services</li>
                        </ul>
                        <p className="text-white/70 mb-4">
                            You can control cookies through your browser settings. Disabling cookies may affect website functionality.
                        </p>

                        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">7. Your Rights</h2>
                        <p className="text-white/70 mb-4">You have the right to:</p>
                        <ul className="list-disc list-inside text-white/70 space-y-2 mb-4">
                            <li>Access the personal information we hold about you</li>
                            <li>Request correction of inaccurate information</li>
                            <li>Request deletion of your personal data</li>
                            <li>Opt-out of marketing communications</li>
                            <li>Withdraw consent where applicable</li>
                        </ul>

                        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">8. Third-Party Links</h2>
                        <p className="text-white/70 mb-4">
                            Our website may contain links to third-party websites. We are not responsible for the privacy
                            practices of these external sites. We encourage you to read their privacy policies.
                        </p>

                        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">9. Children&apos;s Privacy</h2>
                        <p className="text-white/70 mb-4">
                            Our services are not intended for individuals under 18 years of age. We do not knowingly collect
                            personal information from children.
                        </p>

                        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">10. Changes to This Policy</h2>
                        <p className="text-white/70 mb-4">
                            We may update this Privacy Policy from time to time. Changes will be posted on this page with an
                            updated &quot;Last Updated&quot; date. Your continued use of our services after changes constitutes acceptance.
                        </p>

                        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">11. Contact Us</h2>
                        <p className="text-white/70 mb-4">
                            If you have any questions about this Privacy Policy or our data practices, please contact us at:
                        </p>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mt-4">
                            <p className="text-white mb-2"><strong>C&P Videos</strong></p>
                            <p className="text-white/70">Email: <a href="mailto:support@candpvideos.com" className="text-purple-400 hover:underline">support@candpvideos.com</a></p>
                            <p className="text-white/70">Website: <a href="https://www.candpvideos.com" className="text-purple-400 hover:underline">www.candpvideos.com</a></p>
                        </div>

                        <div className="mt-10 pt-6 border-t border-white/10">
                            <p className="text-white/50 text-sm">
                                By using our website and services, you acknowledge that you have read and understood this Privacy Policy.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Link href="/" className="text-purple-400 hover:underline">← Back to Home</Link>
                </div>
            </div>
        </div>
    )
}
