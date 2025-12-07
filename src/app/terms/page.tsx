import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Terms & Conditions | C&P Videos',
    description: 'Terms and Conditions for using C&P Videos - Read our terms of service before making a purchase.',
}

export default function TermsPage() {
    return (
        <div className="container py-12">
            <div className="max-w-4xl mx-auto">
                <div className="card-static p-8 md:p-12">
                    <div className="prose prose-invert max-w-none">
                        <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-2">Terms & Conditions</h1>
                        <p className="text-white/60 mb-8">Last Updated: December 7, 2024</p>

                        <p className="text-white/80 leading-relaxed">
                            Welcome to C&P Videos. These Terms and Conditions (&quot;Terms&quot;) govern your use of our website
                            <strong> www.candpvideos.com</strong> and the purchase of digital products from our platform.
                            By accessing our website or making a purchase, you agree to be bound by these Terms.
                        </p>

                        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Definitions</h2>
                        <ul className="list-disc list-inside text-white/70 space-y-2 mb-4">
                            <li><strong>&quot;We,&quot; &quot;Us,&quot; &quot;Our&quot;</strong> refers to C&P Videos</li>
                            <li><strong>&quot;You,&quot; &quot;Your,&quot; &quot;User&quot;</strong> refers to the person accessing our website or making a purchase</li>
                            <li><strong>&quot;Products&quot;</strong> refers to digital goods including PDFs, eBooks, courses, and Telegram group access</li>
                            <li><strong>&quot;Website&quot;</strong> refers to www.candpvideos.com</li>
                        </ul>

                        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. Acceptance of Terms</h2>
                        <p className="text-white/70 mb-4">
                            By accessing this website and/or making a purchase, you acknowledge that you have read, understood,
                            and agree to be bound by these Terms. If you do not agree with any part of these Terms, you must
                            not use our website or services.
                        </p>

                        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. Eligibility</h2>
                        <p className="text-white/70 mb-4">To use our services and make purchases, you must:</p>
                        <ul className="list-disc list-inside text-white/70 space-y-2 mb-4">
                            <li>Be at least 18 years of age</li>
                            <li>Have the legal capacity to enter into a binding contract</li>
                            <li>Provide accurate and complete information during registration</li>
                            <li>Have a valid payment method for purchases</li>
                        </ul>

                        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">4. Account Registration</h2>
                        <p className="text-white/70 mb-4">When creating an account, you agree to:</p>
                        <ul className="list-disc list-inside text-white/70 space-y-2 mb-4">
                            <li>Provide accurate, current, and complete information</li>
                            <li>Maintain and update your information as needed</li>
                            <li>Keep your password confidential and secure</li>
                            <li>Be responsible for all activities under your account</li>
                            <li>Notify us immediately of any unauthorized use</li>
                        </ul>

                        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">5. Products and Services</h2>

                        <h3 className="text-xl font-medium text-white/90 mt-6 mb-3">5.1 Digital Products</h3>
                        <p className="text-white/70 mb-4">We offer the following types of digital products:</p>
                        <ul className="list-disc list-inside text-white/70 space-y-2 mb-4">
                            <li>PDF documents and eBooks</li>
                            <li>Digital courses and tutorials</li>
                            <li>Telegram group access and memberships</li>
                            <li>Other downloadable digital content</li>
                        </ul>

                        <h3 className="text-xl font-medium text-white/90 mt-6 mb-3">5.2 Product Delivery</h3>
                        <p className="text-white/70 mb-4">
                            Digital products are delivered immediately after successful payment. You will receive:
                        </p>
                        <ul className="list-disc list-inside text-white/70 space-y-2 mb-4">
                            <li>Access to products via your dashboard</li>
                            <li>Email confirmation with access details</li>
                            <li>For Telegram groups: An invite link to join the group</li>
                        </ul>

                        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">6. Pricing and Payment</h2>
                        <ul className="list-disc list-inside text-white/70 space-y-2 mb-4">
                            <li>All prices are displayed in Indian Rupees (INR)</li>
                            <li>Prices are inclusive of applicable taxes unless stated otherwise</li>
                            <li>We reserve the right to modify prices at any time</li>
                            <li>Payment is processed securely through Razorpay</li>
                            <li>We accept UPI, credit/debit cards, net banking, and digital wallets</li>
                        </ul>

                        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">7. Intellectual Property Rights</h2>
                        <p className="text-white/70 mb-4">All content on this website and in our products is protected by intellectual property laws:</p>
                        <ul className="list-disc list-inside text-white/70 space-y-2 mb-4">
                            <li>Products are licensed, not sold, for personal use only</li>
                            <li>You may not copy, reproduce, distribute, or share products</li>
                            <li>Sharing Telegram invite links with non-purchasers is prohibited</li>
                            <li>Reselling or commercial use of our content is strictly forbidden</li>
                            <li>Violation may result in legal action and account termination</li>
                        </ul>

                        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">8. User Conduct</h2>
                        <p className="text-white/70 mb-4">You agree NOT to:</p>
                        <ul className="list-disc list-inside text-white/70 space-y-2 mb-4">
                            <li>Share or distribute purchased content to others</li>
                            <li>Attempt to hack, disrupt, or damage our systems</li>
                            <li>Use our services for any illegal purpose</li>
                            <li>Impersonate others or provide false information</li>
                            <li>Engage in abusive behavior in Telegram groups</li>
                            <li>Violate any applicable laws or regulations</li>
                        </ul>

                        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">9. Refund Policy</h2>
                        <p className="text-white/70 mb-4">
                            Due to the digital nature of our products, all sales are generally final. For complete details,
                            please review our <Link href="/refund-policy" className="text-purple-400 hover:underline">Refund Policy</Link>.
                        </p>
                        <p className="text-white/70 mb-4">Key points:</p>
                        <ul className="list-disc list-inside text-white/70 space-y-2 mb-4">
                            <li>Refunds may be considered for technical issues on our end</li>
                            <li>No refunds after content has been accessed or downloaded</li>
                            <li>Refund requests must be made within 48 hours of purchase</li>
                        </ul>

                        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">10. Telegram Group Rules</h2>
                        <p className="text-white/70 mb-4">For Telegram group access products:</p>
                        <ul className="list-disc list-inside text-white/70 space-y-2 mb-4">
                            <li>Access is granted to the purchaser only</li>
                            <li>Do not share invite links with others</li>
                            <li>Respect all group rules and other members</li>
                            <li>Violation of rules may result in removal without refund</li>
                        </ul>

                        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">11. Disclaimer of Warranties</h2>
                        <p className="text-white/70 mb-4">
                            Our website and products are provided &quot;as is&quot; without warranties of any kind, either express
                            or implied. We do not guarantee that:
                        </p>
                        <ul className="list-disc list-inside text-white/70 space-y-2 mb-4">
                            <li>The website will be uninterrupted or error-free</li>
                            <li>Products will meet your specific requirements</li>
                            <li>Any errors will be corrected</li>
                        </ul>

                        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">12. Limitation of Liability</h2>
                        <p className="text-white/70 mb-4">
                            To the maximum extent permitted by law, we shall not be liable for any indirect, incidental,
                            special, consequential, or punitive damages arising from your use of our website or products.
                            Our total liability shall not exceed the amount paid by you for the specific product in question.
                        </p>

                        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">13. Indemnification</h2>
                        <p className="text-white/70 mb-4">
                            You agree to indemnify and hold us harmless from any claims, damages, losses, or expenses
                            arising from your violation of these Terms or misuse of our services.
                        </p>

                        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">14. Termination</h2>
                        <p className="text-white/70 mb-4">We reserve the right to:</p>
                        <ul className="list-disc list-inside text-white/70 space-y-2 mb-4">
                            <li>Suspend or terminate your account for violations</li>
                            <li>Revoke access to purchased products for Terms violations</li>
                            <li>Refuse service to anyone at our discretion</li>
                        </ul>

                        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">15. Governing Law</h2>
                        <p className="text-white/70 mb-4">
                            These Terms shall be governed by and construed in accordance with the laws of India.
                            Any disputes arising shall be subject to the exclusive jurisdiction of the courts in India.
                        </p>

                        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">16. Changes to Terms</h2>
                        <p className="text-white/70 mb-4">
                            We reserve the right to modify these Terms at any time. Changes will be effective immediately
                            upon posting. Your continued use of our services after changes constitutes acceptance of the
                            modified Terms.
                        </p>

                        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">17. Severability</h2>
                        <p className="text-white/70 mb-4">
                            If any provision of these Terms is found to be unenforceable, the remaining provisions
                            shall continue in full force and effect.
                        </p>

                        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">18. Contact Information</h2>
                        <p className="text-white/70 mb-4">
                            For any questions regarding these Terms, please contact us:
                        </p>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mt-4">
                            <p className="text-white mb-2"><strong>C&P Videos</strong></p>
                            <p className="text-white/70">Email: <a href="mailto:support@candpvideos.com" className="text-purple-400 hover:underline">support@candpvideos.com</a></p>
                            <p className="text-white/70">Website: <a href="https://www.candpvideos.com" className="text-purple-400 hover:underline">www.candpvideos.com</a></p>
                        </div>

                        <div className="mt-10 pt-6 border-t border-white/10">
                            <p className="text-white/50 text-sm">
                                By using our website and making purchases, you acknowledge that you have read, understood,
                                and agree to be bound by these Terms and Conditions.
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
