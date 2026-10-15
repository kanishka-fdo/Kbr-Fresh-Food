const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return transporter;
};

/**
 * Wraps email content in a beautiful KBR Fresh Foods branded HTML wrapper.
 */
const brandedTemplate = ({ title, preheader, bodyHtml }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f7f4;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;color:#f4f7f4;">${preheader}</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f4;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#143123,#275740);padding:36px 40px;text-align:center;">
              <div style="display:inline-block;background:rgba(255,255,255,0.12);border-radius:16px;padding:12px 20px;margin-bottom:16px;">
                <span style="font-size:28px;">🌿</span>
                <span style="font-size:18px;font-weight:800;color:#fff;letter-spacing:-0.5px;margin-left:8px;">KBR Fresh Foods</span>
              </div>
              <div style="color:rgba(255,255,255,0.6);font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Negombo, Sri Lanka</div>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#143123;line-height:1.2;">${title}</h1>
              ${bodyHtml}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background:#f9fbf9;border-top:1px solid #eef2ee;padding:28px 40px;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">Need help? Contact us at</p>
              <a href="mailto:info@kbrfreshfoods.lk" style="color:#306c4e;font-weight:700;text-decoration:none;font-size:14px;">info@kbrfreshfoods.lk</a>
              <span style="color:#9ca3af;margin:0 8px;">·</span>
              <a href="https://wa.me/94772501450" style="color:#306c4e;font-weight:700;text-decoration:none;font-size:14px;">+94 77 250 1450</a>
              <p style="margin:16px 0 0;font-size:11px;color:#9ca3af;">© ${new Date().getFullYear()} KBR Fresh Foods. All rights reserved.<br/>
              KBR Fresh Foods, Main Street, Negombo 11500, Sri Lanka</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

/**
 * Email template builders — all use the branded wrapper.
 */
const templates = {
  emailVerification: (name, verifyUrl) => ({
    subject: '✅ Verify your KBR Fresh Foods account',
    html: brandedTemplate({
      title: `Welcome, ${name}!`,
      preheader: 'Just one click to activate your account.',
      bodyHtml: `
        <p style="color:#4b5563;font-size:15px;line-height:1.7;margin:16px 0;">
          Thank you for joining KBR Fresh Foods! We're excited to have you on board. Please verify your email address to start shopping the freshest produce in Negombo.
        </p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${verifyUrl}" style="display:inline-block;background:#306c4e;color:#fff;font-size:16px;font-weight:700;padding:16px 40px;border-radius:50px;text-decoration:none;letter-spacing:0.3px;">
            ✅ Verify My Email
          </a>
        </div>
        <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;">
          Or copy this link: <a href="${verifyUrl}" style="color:#306c4e;">${verifyUrl}</a><br/>
          This link expires in <strong>24 hours</strong>.
        </p>
      `,
    }),
  }),

  passwordReset: (name, resetUrl) => ({
    subject: '🔐 Reset your KBR Fresh Foods password',
    html: brandedTemplate({
      title: 'Password Reset',
      preheader: 'Your password reset link is ready.',
      bodyHtml: `
        <p style="color:#4b5563;font-size:15px;line-height:1.7;margin:16px 0;">
          Hi <strong>${name}</strong>, we received a request to reset your password. Click the button below to choose a new password.
        </p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${resetUrl}" style="display:inline-block;background:#306c4e;color:#fff;font-size:16px;font-weight:700;padding:16px 40px;border-radius:50px;text-decoration:none;">
            🔐 Reset My Password
          </a>
        </div>
        <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;">
          Or copy this link: <a href="${resetUrl}" style="color:#306c4e;">${resetUrl}</a><br/>
          This link expires in <strong>1 hour</strong>. If you did not request this, please ignore this email.
        </p>
      `,
    }),
  }),

  emailChangeOtp: (name, otp, newEmail) => ({
    subject: '📧 Your email change OTP — KBR Fresh Foods',
    html: brandedTemplate({
      title: 'Email Change Request',
      preheader: `Your OTP: ${otp}`,
      bodyHtml: `
        <p style="color:#4b5563;font-size:15px;line-height:1.7;margin:16px 0;">
          Hi <strong>${name}</strong>, we received a request to change your account email to <strong>${newEmail}</strong>.
        </p>
        <p style="color:#4b5563;font-size:15px;line-height:1.7;margin:0 0 24px;">
          Enter this one-time password in the app to confirm the change:
        </p>
        <div style="text-align:center;margin:24px 0;">
          <div style="display:inline-block;background:#f0faf4;border:2px dashed #69a686;border-radius:16px;padding:24px 48px;">
            <span style="font-size:42px;font-weight:900;letter-spacing:10px;color:#143123;font-family:monospace;">${otp}</span>
          </div>
        </div>
        <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;">
          This OTP expires in <strong>15 minutes</strong>. If you did not request this, please ignore this email and your account will remain unchanged.
        </p>
      `,
    }),
  }),

  paymentOtp: (name, otp, amount) => ({
    subject: '🔒 Secure Checkout OTP — KBR Fresh Foods',
    html: brandedTemplate({
      title: 'Checkout Verification',
      preheader: `Your checkout OTP: ${otp}`,
      bodyHtml: `
        <p style="color:#4b5563;font-size:15px;line-height:1.7;margin:16px 0;">
          Hi <strong>${name}</strong>, we received a request to authorize a card payment for <strong>Rs. ${amount.toLocaleString()}</strong>.
        </p>
        <p style="color:#4b5563;font-size:15px;line-height:1.7;margin:0 0 24px;">
          To complete your checkout securely, please enter this one-time password:
        </p>
        <div style="text-align:center;margin:24px 0;">
          <div style="display:inline-block;background:#fffbeb;border:2px dashed #f59e0b;border-radius:16px;padding:24px 48px;">
            <span style="font-size:42px;font-weight:900;letter-spacing:10px;color:#92400e;font-family:monospace;">${otp}</span>
          </div>
        </div>
        <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;">
          This OTP is valid for <strong>10 minutes</strong>. If you did not initiate this payment, please secure your account.
        </p>
      `,
    }),
  }),

  orderConfirmation: (name, order) => {
    const {
      orderNumber,
      items = [],
      itemsTotal,
      deliveryFee,
      totalAmount,
      paymentMethod,
      paymentStatus,
      deliveryAddress,
      estimatedDeliveryTime,
      createdAt,
    } = order;

    const paymentLabels = {
      cod: 'Cash on Delivery',
      card: 'Card Payment',
      qr: 'QR / Bank Transfer',
      bank_transfer: 'Bank Transfer',
    };

    const statusLabels = {
      pending: '⏳ Pending',
      paid: '✅ Paid',
    };

    const estimatedTime = estimatedDeliveryTime
      ? new Date(estimatedDeliveryTime).toLocaleString('en-LK', {
          weekday: 'short', day: 'numeric', month: 'short',
          hour: '2-digit', minute: '2-digit',
        })
      : 'To be confirmed';

    const orderDate = createdAt
      ? new Date(createdAt).toLocaleString('en-LK', {
          weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })
      : new Date().toLocaleString('en-LK');

    const addressLine = deliveryAddress
      ? [deliveryAddress.line1, deliveryAddress.line2, deliveryAddress.city]
          .filter(Boolean).join(', ')
      : 'To be confirmed';

    const itemRows = items.map(item => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:14px;color:#374151;">
          ${item.name}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:14px;color:#6b7280;text-align:center;">
          × ${item.quantity}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:14px;color:#374151;text-align:right;">
          Rs. ${Number(item.unitPrice).toLocaleString()}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:14px;font-weight:600;color:#143123;text-align:right;">
          Rs. ${Number(item.subtotal).toLocaleString()}
        </td>
      </tr>
    `).join('');

    return {
      subject: `🛍️ Order Confirmed — ${orderNumber} | KBR Fresh Foods`,
      html: brandedTemplate({
        title: 'Order Confirmed! 🎉',
        preheader: `Your order ${orderNumber} is confirmed and being prepared.`,
        bodyHtml: `
          <p style="color:#4b5563;font-size:15px;line-height:1.7;margin:16px 0 24px;">
            Hi <strong>${name}</strong>, thank you for your order! Our team is preparing your fresh produce right now. 🌿
          </p>

          <!-- Order Meta -->
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px 20px;margin:0 0 24px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;">
            <div>
              <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Order Number</p>
              <p style="margin:0;font-size:18px;font-weight:800;color:#143123;">${orderNumber}</p>
            </div>
            <div>
              <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Order Date</p>
              <p style="margin:0;font-size:14px;color:#374151;">${orderDate}</p>
            </div>
            <div>
              <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Est. Delivery</p>
              <p style="margin:0;font-size:14px;color:#374151;">${estimatedTime}</p>
            </div>
          </div>

          <!-- Items Table -->
          <p style="font-size:13px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Your Items</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;margin:0 0 20px;">
            <thead>
              <tr style="background:#f9fafb;">
                <th style="padding:10px 12px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;text-align:left;">Item</th>
                <th style="padding:10px 12px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;text-align:center;">Qty</th>
                <th style="padding:10px 12px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;text-align:right;">Unit Price</th>
                <th style="padding:10px 12px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;text-align:right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
          </table>

          <!-- Totals -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
            <tr>
              <td style="padding:6px 0;font-size:14px;color:#6b7280;">Items Total</td>
              <td style="padding:6px 0;font-size:14px;color:#374151;text-align:right;">Rs. ${Number(itemsTotal).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:14px;color:#6b7280;">Delivery Fee</td>
              <td style="padding:6px 0;font-size:14px;color:#374151;text-align:right;">Rs. ${Number(deliveryFee).toLocaleString()}</td>
            </tr>
            <tr style="border-top:2px solid #143123;">
              <td style="padding:12px 0 6px;font-size:17px;font-weight:800;color:#143123;">Total Amount</td>
              <td style="padding:12px 0 6px;font-size:17px;font-weight:800;color:#306c4e;text-align:right;">Rs. ${Number(totalAmount).toLocaleString()}</td>
            </tr>
          </table>

          <!-- Payment & Delivery Info -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:0 0 24px;">
            <div style="background:#f9fbf9;border-radius:12px;padding:16px;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Payment</p>
              <p style="margin:0;font-size:14px;font-weight:600;color:#143123;">${paymentLabels[paymentMethod] || paymentMethod}</p>
              <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">${statusLabels[paymentStatus] || paymentStatus}</p>
            </div>
            <div style="background:#f9fbf9;border-radius:12px;padding:16px;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Delivery To</p>
              <p style="margin:0;font-size:14px;font-weight:600;color:#143123;">${addressLine}</p>
            </div>
          </div>

          <!-- Invoice Note -->
          <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:10px;padding:14px 18px;margin:0 0 24px;">
            <p style="margin:0;font-size:13px;color:#92400e;">
              📎 Your digital invoice is attached to this email as a PDF. Keep it for your records.
            </p>
          </div>

          <p style="color:#4b5563;font-size:14px;margin:0;">
            Questions? Call or WhatsApp us at <strong>+94 77 977 9316</strong> or email 
            <a href="mailto:info@kbrfreshfoods.lk" style="color:#306c4e;">info@kbrfreshfoods.lk</a>
          </p>
        `,
      }),
    };
  },
};

/**
 * Sends an email using the configured SMTP transport, or logs to console in dev.
 * Pass a raw { to, subject, html } OR use the template helpers.
 */
const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  const t = getTransporter();

  if (!t) {
    console.log('\n--------------------------------------------------');
    console.log('[DEV EMAIL — no SMTP configured, logging instead]');
    console.log('To:', to);
    console.log('Subject:', subject);
    // Extract and log just the OTP if present
    const otpMatch = html?.match(/font-family:monospace[^>]*>(\d+)</);
    if (otpMatch) console.log('OTP:', otpMatch[1]);
    // Extract verify URL if present
    const urlMatch = html?.match(/href="(http[^"]+verify[^"]+)"/);
    if (urlMatch) console.log('Verify URL:', urlMatch[1]);
    const resetMatch = html?.match(/href="(http[^"]+reset[^"]+)"/);
    if (resetMatch) console.log('Reset URL:', resetMatch[1]);
    if (attachments.length) console.log('Attachments:', attachments.map(a => a.filename).join(', '));
    console.log('--------------------------------------------------\n');
    return { dev: true };
  }

  const info = await t.sendMail({
    from: process.env.EMAIL_FROM || 'KBR Fresh Foods <no-reply@kbrfreshfoods.lk>',
    to,
    subject,
    html,
    attachments,
  });

  if (process.env.EMAIL_HOST === 'smtp.ethereal.email') {
    console.log('\n================ Ethereal Email Sent ================');
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    console.log('=====================================================\n');
  }

  return info;
};

module.exports = sendEmail;
module.exports.templates = templates;
