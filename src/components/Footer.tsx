import Link from 'next/link'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="border-t border-white/10 mt-auto">
            <div className="container py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">DP</span>
                            </div>
                            <span className="font-bold text-lg">Digital Products</span>
                        </div>
                        <p className="text-foreground-muted text-sm max-w-md">
                            Your one-stop marketplace for premium digital products including exclusive PDFs
                            and Telegram group access. Quality content delivered instantly.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/" className="text-foreground-muted hover:text-foreground transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard" className="text-foreground-muted hover:text-foreground transition-colors">
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link href="/login" className="text-foreground-muted hover:text-foreground transition-colors">
                                    Login
                                </Link>
                            </li>
                            <li>
                                <Link href="/signup" className="text-foreground-muted hover:text-foreground transition-colors">
                                    Sign Up
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-foreground-muted hover:text-foreground transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-semibold mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/privacy-policy" className="text-foreground-muted hover:text-foreground transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/refund-policy" className="text-foreground-muted hover:text-foreground transition-colors">
                                    Refund Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-foreground-muted hover:text-foreground transition-colors">
                                    Terms & Conditions
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="divider" />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-foreground-muted">
                    <p>© {currentYear} Digital Products. All rights reserved.</p>
                    <p>
                        Made with ❤️ for digital creators
                    </p>
                </div>
            </div>
        </footer>
    )
}
