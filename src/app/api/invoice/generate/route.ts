import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const invoiceId = searchParams.get('id')

        if (!invoiceId) {
            return NextResponse.json({ error: 'Invoice ID required' }, { status: 400 })
        }

        // Use service role client to fetch invoice
        // The invoice UUID itself serves as a secret token for access
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                cookies: {
                    getAll: () => [],
                    setAll: () => { },
                },
            }
        )

        // Get invoice by ID (UUID is the secure access token)
        const { data: invoice, error } = await supabase
            .from('invoices')
            .select('*')
            .eq('id', invoiceId)
            .single()

        if (error || !invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
        }

        // Generate invoice HTML
        const invoiceHtml = generateInvoiceHtml(invoice)

        return new NextResponse(invoiceHtml, {
            headers: {
                'Content-Type': 'text/html',
            },
        })
    } catch (error) {
        console.error('Invoice generation error:', error)
        return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 })
    }
}

interface Invoice {
    id: string
    invoice_number: string
    transaction_id: string
    user_id: string
    product_id: string
    amount: number
    discount_amount: number
    promo_code: string | null
    customer_email: string
    customer_name: string | null
    product_name: string
    razorpay_payment_id: string | null
    created_at: string
}

function generateInvoiceHtml(invoice: Invoice): string {
    const date = new Date(invoice.created_at)
    const formattedDate = date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })

    const subtotal = invoice.amount + invoice.discount_amount
    const total = invoice.amount

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${invoice.invoice_number}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
            min-height: 100vh;
            padding: 40px 20px;
            color: #eaeaea;
        }
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: rgba(26, 26, 46, 0.95);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
        }
        .invoice-header {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            padding: 40px;
            text-align: center;
        }
        .logo {
            width: 60px;
            height: 60px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 16px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            color: white;
            margin-bottom: 20px;
        }
        .invoice-title {
            font-size: 28px;
            font-weight: 700;
            color: white;
            margin-bottom: 8px;
        }
        .invoice-number {
            font-size: 16px;
            color: rgba(255, 255, 255, 0.8);
        }
        .invoice-body {
            padding: 40px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 40px;
        }
        .info-section h3 {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #888;
            margin-bottom: 12px;
        }
        .info-section p {
            font-size: 15px;
            line-height: 1.6;
            color: #eaeaea;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .items-table th {
            text-align: left;
            padding: 16px;
            background: rgba(99, 102, 241, 0.1);
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #888;
            border-radius: 8px 8px 0 0;
        }
        .items-table td {
            padding: 20px 16px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .items-table .product-name {
            font-weight: 600;
            color: #fff;
        }
        .items-table .product-type {
            font-size: 13px;
            color: #888;
        }
        .items-table .amount {
            text-align: right;
            font-weight: 600;
            color: #fff;
        }
        .totals {
            background: rgba(99, 102, 241, 0.05);
            border-radius: 12px;
            padding: 24px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            font-size: 15px;
        }
        .total-row.discount {
            color: #22c55e;
        }
        .total-row.final {
            border-top: 2px solid rgba(255, 255, 255, 0.1);
            margin-top: 12px;
            padding-top: 20px;
            font-size: 20px;
            font-weight: 700;
        }
        .total-row.final .amount {
            color: #6366f1;
        }
        .invoice-footer {
            text-align: center;
            padding: 30px 40px;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            color: #666;
            font-size: 13px;
        }
        .payment-badge {
            display: inline-block;
            background: rgba(34, 197, 94, 0.1);
            color: #22c55e;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
            margin-top: 20px;
        }
        .print-btn {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
            border: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
        }
        .print-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
        }
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .invoice-container {
                box-shadow: none;
                border: none;
            }
            .print-btn {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="invoice-header">
            <div class="logo">DP</div>
            <h1 class="invoice-title">INVOICE</h1>
            <p class="invoice-number">${invoice.invoice_number}</p>
        </div>
        
        <div class="invoice-body">
            <div class="info-grid">
                <div class="info-section">
                    <h3>Bill To</h3>
                    <p>
                        <strong>${invoice.customer_name || 'Customer'}</strong><br>
                        ${invoice.customer_email}
                    </p>
                </div>
                <div class="info-section" style="text-align: right;">
                    <h3>Invoice Details</h3>
                    <p>
                        <strong>Date:</strong> ${formattedDate}<br>
                        ${invoice.razorpay_payment_id ? `<strong>Payment ID:</strong> ${invoice.razorpay_payment_id}` : ''}
                    </p>
                </div>
            </div>
            
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th style="text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <div class="product-name">${invoice.product_name}</div>
                            <div class="product-type">Digital Product</div>
                        </td>
                        <td class="amount">₹${subtotal.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
            
            <div class="totals">
                <div class="total-row">
                    <span>Subtotal</span>
                    <span>₹${subtotal.toFixed(2)}</span>
                </div>
                ${invoice.discount_amount > 0 ? `
                <div class="total-row discount">
                    <span>Discount ${invoice.promo_code ? `(${invoice.promo_code})` : ''}</span>
                    <span>-₹${invoice.discount_amount.toFixed(2)}</span>
                </div>
                ` : ''}
                <div class="total-row">
                    <span>Tax (Included)</span>
                    <span>₹0.00</span>
                </div>
                <div class="total-row final">
                    <span>Total</span>
                    <span class="amount">₹${total.toFixed(2)}</span>
                </div>
            </div>
            
            <div style="text-align: center;">
                <span class="payment-badge">✓ Payment Successful</span>
            </div>
        </div>
        
        <div class="invoice-footer">
            <p>Thank you for your purchase!</p>
            <p style="margin-top: 8px;">C&P Videos • support@candpvideos.com</p>
        </div>
    </div>
    
    <button class="print-btn" onclick="window.print()">
        🖨️ Print Invoice
    </button>
</body>
</html>
    `
}
