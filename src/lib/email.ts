import nodemailer from 'nodemailer'

interface PurchaseEmailParams {
  to: string
  productName: string
  productType: 'pdf' | 'telegram'
  accessLink: string
}

// Create transporter
const createTransporter = () => {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || '587')
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    return null
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  })
}

export async function sendPurchaseEmail(params: PurchaseEmailParams) {
  const transporter = createTransporter()

  if (!transporter) {
    console.log('Email not configured, skipping...')
    return
  }

  const { to, productName, productType, accessLink } = params
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER

  const subject = `Your purchase: ${productName}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Purchase Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f0f23; color: #eaeaea;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px;">
          <div style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 12px; line-height: 60px; font-size: 24px; font-weight: bold; color: white;">
            DP
          </div>
          <h1 style="margin: 20px 0 0; font-size: 28px; font-weight: 700; color: #ffffff;">
            Thank You for Your Purchase!
          </h1>
        </div>

        <!-- Content -->
        <div style="background: rgba(26, 26, 46, 0.8); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 32px; margin-bottom: 24px;">
          <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #b4b4b4;">
            Your payment has been successfully processed. Here are your access details:
          </p>

          <div style="background: rgba(99, 102, 241, 0.1); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <h2 style="margin: 0 0 8px; font-size: 20px; font-weight: 600; color: #ffffff;">
              ${productName}
            </h2>
            <p style="margin: 0; font-size: 14px; color: #888888; text-transform: capitalize;">
              ${productType === 'pdf' ? '📄 PDF Document' : '👥 Telegram Group'}
            </p>
          </div>

          <div style="text-align: center;">
            <a href="${accessLink}" 
               style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 10px; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);">
              ${productType === 'pdf' ? 'Download PDF' : 'Join Telegram Group'}
            </a>
          </div>
        </div>

        <!-- Info -->
        <div style="background: rgba(26, 26, 46, 0.8); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 24px;">
          <p style="margin: 0 0 12px; font-size: 14px; color: #888888;">
            <strong style="color: #ffffff;">📌 Note:</strong> You can also access your purchased products anytime from your dashboard.
          </p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" 
             style="color: #6366f1; text-decoration: none; font-size: 14px;">
            Go to Dashboard →
          </a>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 40px; padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
          <p style="margin: 0; font-size: 14px; color: #666666;">
            © ${new Date().getFullYear()} Digital Products. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
Thank You for Your Purchase!

Your payment has been successfully processed.

Product: ${productName}
Type: ${productType}

Access your product here: ${accessLink}

You can also access your purchased products anytime from your dashboard:
${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard

Thank you for choosing Digital Products!
  `

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  })
}

interface InvoiceEmailParams {
  to: string
  invoiceNumber: string
  customerName: string
  productName: string
  amount: number
  discountAmount: number
  promoCode: string | null
  paymentId: string
  invoiceId: string
  purchaseDate: string
}

export async function sendInvoiceEmail(params: InvoiceEmailParams) {
  const transporter = createTransporter()

  if (!transporter) {
    console.log('Email not configured, skipping invoice email...')
    return
  }

  const {
    to,
    invoiceNumber,
    customerName,
    productName,
    amount,
    discountAmount,
    promoCode,
    paymentId,
    invoiceId,
    purchaseDate,
  } = params

  const from = process.env.EMAIL_FROM || process.env.SMTP_USER
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const subtotal = amount + discountAmount
  const date = new Date(purchaseDate).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const subject = `Invoice ${invoiceNumber} - Your Purchase Receipt`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice ${invoiceNumber}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f0f23; color: #eaeaea;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px;">
          <div style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 12px; line-height: 60px; font-size: 24px; font-weight: bold; color: white;">
            DP
          </div>
          <h1 style="margin: 20px 0 0; font-size: 28px; font-weight: 700; color: #ffffff;">
            Invoice
          </h1>
          <p style="margin: 8px 0 0; font-size: 16px; color: #888888;">
            ${invoiceNumber}
          </p>
        </div>

        <!-- Invoice Details Card -->
        <div style="background: rgba(26, 26, 46, 0.8); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 32px; margin-bottom: 24px;">
          <div style="margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
            <p style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #888888;">BILL TO</p>
            <p style="margin: 0; font-size: 16px; font-weight: 600; color: #ffffff;">${customerName}</p>
            <p style="margin: 4px 0 0; font-size: 14px; color: #b4b4b4;">${to}</p>
          </div>

          <div style="margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
            <p style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #888888;">PURCHASE DETAILS</p>
            <p style="margin: 0; font-size: 16px; font-weight: 600; color: #ffffff;">${productName}</p>
            <p style="margin: 4px 0 0; font-size: 14px; color: #b4b4b4;">Date: ${date}</p>
            <p style="margin: 4px 0 0; font-size: 14px; color: #b4b4b4;">Payment ID: ${paymentId}</p>
          </div>

          <!-- Amount Summary -->
          <table style="width: 100%; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #b4b4b4;">Subtotal</td>
              <td style="padding: 8px 0; text-align: right; color: #ffffff;">₹${subtotal.toFixed(2)}</td>
            </tr>
            ${discountAmount > 0 ? `
            <tr>
              <td style="padding: 8px 0; color: #22c55e;">Discount ${promoCode ? `(${promoCode})` : ''}</td>
              <td style="padding: 8px 0; text-align: right; color: #22c55e;">-₹${discountAmount.toFixed(2)}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px 0; color: #b4b4b4;">Tax (Included)</td>
              <td style="padding: 8px 0; text-align: right; color: #ffffff;">₹0.00</td>
            </tr>
            <tr style="border-top: 2px solid rgba(255, 255, 255, 0.1);">
              <td style="padding: 16px 0 8px; font-size: 18px; font-weight: 700; color: #ffffff;">Total Paid</td>
              <td style="padding: 16px 0 8px; text-align: right; font-size: 18px; font-weight: 700; color: #6366f1;">₹${amount.toFixed(2)}</td>
            </tr>
          </table>

          <div style="text-align: center; margin-top: 24px;">
            <span style="display: inline-block; background: rgba(34, 197, 94, 0.1); color: #22c55e; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600;">
              ✓ Payment Successful
            </span>
          </div>
        </div>

        <!-- Download Button -->
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${appUrl}/api/invoice/generate?id=${invoiceId}" 
             style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 10px; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);">
            View Full Invoice →
          </a>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 40px; padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
          <p style="margin: 0; font-size: 14px; color: #666666;">
            Thank you for your purchase!
          </p>
          <p style="margin: 8px 0 0; font-size: 13px; color: #666666;">
            C&P Videos • support@candpvideos.com
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
Invoice ${invoiceNumber}

Bill To: ${customerName} (${to})
Date: ${date}

Product: ${productName}
Subtotal: ₹${subtotal.toFixed(2)}
${discountAmount > 0 ? `Discount${promoCode ? ` (${promoCode})` : ''}: -₹${discountAmount.toFixed(2)}` : ''}
Total Paid: ₹${amount.toFixed(2)}

Payment ID: ${paymentId}

View your invoice: ${appUrl}/api/invoice/generate?id=${invoiceId}

Thank you for your purchase!
C&P Videos • support@candpvideos.com
  `

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  })
}
