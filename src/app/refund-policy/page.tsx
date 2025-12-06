import { createClient } from '@/lib/supabase/server'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Refund Policy | Digital Products',
    description: 'Our refund policy for digital products and services.',
}

export default async function RefundPolicyPage() {
    const supabase = await createClient()

    const { data: content } = await supabase
        .from('site_content')
        .select('value')
        .eq('key', 'refund_policy')
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

const defaultContent = `# Refund Policy

## Digital Products

Due to the nature of digital products, all sales are final. We do not offer refunds for downloaded PDFs or accessed Telegram groups.

## Exceptions

If you experience technical issues accessing your purchased content, please contact us within 24 hours of purchase.

### Eligible for Refund:
- Technical issues preventing access
- Duplicate purchases
- Billing errors

### Not Eligible:
- Change of mind
- Downloaded content
- Accessed Telegram groups

## How to Request a Refund

If you believe you qualify for a refund, please email us at support@example.com with:
- Your order ID
- Reason for refund request
- Any relevant screenshots

## Processing Time

Refund requests are processed within 5-7 business days. Approved refunds will be credited to your original payment method.

## Contact

For refund inquiries, email us at support@example.com`
