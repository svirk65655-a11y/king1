import { createClient } from '@/lib/supabase/server'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Privacy Policy | Digital Products',
    description: 'Our privacy policy explains how we collect, use, and protect your personal information.',
}

export default async function PrivacyPolicyPage() {
    const supabase = await createClient()

    const { data: content } = await supabase
        .from('site_content')
        .select('value')
        .eq('key', 'privacy_policy')
        .single()

    const markdown = (content?.value as { content?: string })?.content || defaultContent

    return (
        <div className="container py-12">
            <div className="max-w-3xl mx-auto">
                <div className="card-static">
                    <div className="prose" dangerouslySetInnerHTML={{ __html: parseMarkdown(markdown) }} />
                </div>
            </div>
        </div>
    )
}

function parseMarkdown(markdown: string): string {
    return markdown
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/\n/gim, '<br />')
}

const defaultContent = `# Privacy Policy

Your privacy is important to us. This policy outlines how we collect, use, and protect your personal information.

## Information We Collect

We collect information you provide directly to us, such as your name, email address, and payment information.

## How We Use Your Information

We use the information to process transactions, send communications, and improve our services.

## Data Security

We implement appropriate security measures to protect your personal information against unauthorized access.

## Cookies

We use cookies to enhance your experience on our website. You can disable cookies in your browser settings.

## Third-Party Services

We may use third-party services (like payment processors) that have their own privacy policies.

## Contact Us

If you have questions about this policy, please contact us at support@example.com.`
