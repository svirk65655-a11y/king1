import { createClient } from '@/lib/supabase/server'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Refund & Cancellation Policy | C&P Videos',
    description: 'Our refund and cancellation policy for digital products and services at C&P Videos.',
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
            <div className="max-w-4xl mx-auto">
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

const defaultContent = `# Refund & Cancellation Policy

**Last Updated: December 7, 2024**

At C&P Videos, we strive to provide high-quality digital products and excellent customer service. Please read our refund and cancellation policy carefully before making a purchase.

## 1. Digital Products - General Policy

Due to the **instant-access nature of digital products**, all sales are generally considered **final**. Once a digital product has been purchased and access has been provided, we cannot offer refunds as the product cannot be "returned."

### This applies to:
- PDF documents and eBooks
- Digital courses and tutorials
- Telegram group access
- Any other downloadable or instantly accessible content

## 2. Eligible Refund Situations

We understand that issues can occur. The following situations **may qualify** for a refund:

### 2.1 Technical Issues
- **Unable to access content:** If you're unable to download or access your purchased content due to technical issues on our end
- **Broken links:** If download links or access links are not working
- **Corrupted files:** If the delivered file is corrupted or incomplete

### 2.2 Billing Errors
- **Duplicate charges:** If you were charged multiple times for the same product
- **Wrong amount charged:** If you were charged more than the displayed price
- **Unauthorized transactions:** Charges you did not authorize

### 2.3 Product Issues
- **Significantly different from description:** If the product is materially different from what was advertised
- **Product not delivered:** If you did not receive access to your purchased product within 24 hours

## 3. Non-Refundable Situations

The following situations **do NOT qualify** for a refund:

- **Change of mind** after purchase
- **Downloaded content** (once a PDF has been downloaded)
- **Accessed Telegram groups** (once you've joined the group)
- **Completed courses** or partially consumed content
- **Failure to meet prerequisites** for a product/course
- **Dissatisfaction with content quality** (subjective opinions)
- **Failure to use the product** or forgetting about the purchase
- **Technical issues on your end** (internet, device compatibility)

## 4. Telegram Group Access - Special Terms

### 4.1 No Refunds After Access
Once you receive and use the Telegram group invite link:
- The sale is considered final
- No refunds will be provided
- You have permanently consumed the product

### 4.2 Removal from Group
If you are removed from a Telegram group due to:
- Violation of group rules
- Sharing access with others
- Inappropriate behavior

**No refund will be provided** as the removal was due to your actions.

## 5. How to Request a Refund

If you believe you qualify for a refund, follow these steps:

### Step 1: Contact Us
Email us at **support@candpvideos.com** within **48 hours** of your purchase.

### Step 2: Provide Required Information
Include the following in your email:
- **Subject Line:** Refund Request - [Order ID]
- **Your registered email address**
- **Order/Transaction ID** (from your receipt)
- **Product name** purchased
- **Detailed reason** for the refund request
- **Screenshots** (if applicable - showing the issue)

### Step 3: Wait for Review
Our team will review your request within **3-5 business days** and respond with a decision.

## 6. Refund Processing

### 6.1 Approved Refunds
If your refund is approved:
- Refund will be processed within **7-10 business days**
- Amount will be credited to your **original payment method**
- You will receive an email confirmation

### 6.2 Partial Refunds
In some cases, we may offer a partial refund based on:
- Amount of content consumed
- Time elapsed since purchase
- Nature of the issue

## 7. Cancellation Policy

### 7.1 Before Payment Completion
You can cancel your purchase at any time before completing payment. Simply close the payment window.

### 7.2 After Payment
Once payment is successfully processed and confirmation is received:
- The transaction is complete
- Standard refund policy applies
- Contact us for any issues

## 8. Disputes

### 8.1 Before Filing a Dispute
We encourage you to contact us at **support@candpvideos.com** before filing a payment dispute or chargeback. We are committed to resolving issues fairly.

### 8.2 Chargeback Policy
Filing a fraudulent chargeback may result in:
- Permanent account suspension
- Ban from future purchases
- Legal action where applicable

## 9. Modifications to This Policy

We reserve the right to modify this refund policy at any time. Changes will be effective immediately upon posting. The policy in effect at the time of your purchase will apply to that transaction.

## 10. Contact Us

For refund inquiries, cancellation requests, or any questions about this policy:

**Email:** support@candpvideos.com
**Response Time:** 24-48 hours (business days)
**Website:** www.candpvideos.com

---

**Important:** By making a purchase on our website, you acknowledge that you have read, understood, and agreed to this Refund & Cancellation Policy.`
