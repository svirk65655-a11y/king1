import { createClient } from '@/lib/supabase/server'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Terms & Conditions | Digital Products',
    description: 'Terms and conditions for using our digital products marketplace.',
}

export default async function TermsPage() {
    const supabase = await createClient()

    const { data: content } = await supabase
        .from('site_content')
        .select('value')
        .eq('key', 'terms_conditions')
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

const defaultContent = `# Terms & Conditions

## Acceptance of Terms

By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.

## Products

### Digital Products
All digital products (PDFs, courses, etc.) are for personal use only and may not be redistributed, resold, or shared without explicit written permission.

### Telegram Groups
Access to Telegram groups is strictly personal. Sharing invite links or access with others is prohibited and may result in removal from the group.

## Account Responsibilities

- You are responsible for maintaining the confidentiality of your account credentials
- You are responsible for all activities that occur under your account
- You must provide accurate and complete information when creating an account
- You must not create multiple accounts for fraudulent purposes

## Payment Terms

- All prices are displayed in Indian Rupees (INR)
- Payment is processed securely through Razorpay
- You agree to pay all charges incurred on your account at the prices in effect when such charges are incurred

## Intellectual Property

All content on this website, including but not limited to text, graphics, logos, and digital products, is the property of Digital Products and protected by intellectual property laws.

## Limitation of Liability

Digital Products shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use our services.

## Changes to Terms

We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the website.

## Governing Law

These terms shall be governed by and construed in accordance with the laws of India.

## Contact

For questions about these terms, contact us at support@example.com`
