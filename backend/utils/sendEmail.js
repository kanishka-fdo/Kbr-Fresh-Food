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
  <meta name="format-detection" content="telephone=no,date=no,address=no,email=no" />
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Roboto:wght@300;400;500;700&display=swap');
    body, table, td, p, a, li, span {
      font-family: 'Roboto', Arial, sans-serif;
    }
    h1, h2, h3, h4, .brand-heading {
      font-family: 'Google Sans', Roboto, Arial, sans-serif !important;
    }
    table { border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    td, th { vertical-align: top; }
    p { line-height: 1.7; }
    @media only screen and (max-width: 620px) {
      .email-shell { padding: 16px 8px !important; }
      .email-padding { padding: 28px 20px !important; }
      .email-title { font-size: 24px !important; }
      .stack-column { display: block !important; width: 100% !important; box-sizing: border-box !important; }
      .stack-gap { display: block !important; width: 100% !important; height: 12px !important; }
      .items-table td, .items-table th { padding: 12px 5px !important; font-size: 11px !important; letter-spacing: 0 !important; }
      .email-button { padding: 16px 24px !important; }
      .otp-box { padding: 20px 16px !important; }
      .otp-code { font-size: 32px !important; letter-spacing: 6px !important; }
      .footer-contact { display: block !important; }
      .footer-separator { display: none !important; }
    }
  </style>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, p, a, span, h1, h2, h3 {
      font-family: Arial, sans-serif !important;
    }
  </style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background:#f4f7f4;font-family:'Roboto',Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;color:#f4f7f4;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f4;font-family:'Roboto',Arial,sans-serif;">
    <tr>
      <td class="email-shell" align="center" style="padding:40px 20px;">
        <!--[if mso]><table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;table-layout:fixed;background:#fff;border:1px solid #e3ebe5;border-radius:16px;overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td class="email-padding" bgcolor="#143123" style="background-color:#143123;background-image:linear-gradient(135deg,#143123,#275740);padding:32px 40px;text-align:left;border-bottom:4px solid #69a686;">
              <p style="margin:0 0 8px;font-family:'Google Sans',Roboto,Arial,sans-serif;font-size:24px;line-height:1.3;font-weight:700;color:#fff;letter-spacing:-0.5px;">KBR Fresh Foods</p>
              <p style="margin:0;font-family:'Roboto',Arial,sans-serif;color:#c5d9cc;font-size:11px;line-height:1.5;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Negombo, Sri Lanka</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td class="email-padding" style="padding:36px 40px;font-family:'Roboto',Arial,sans-serif;overflow-wrap:anywhere;">
              <h1 class="email-title" style="margin:0 0 16px;font-family:'Google Sans',Roboto,Arial,sans-serif;font-size:28px;font-weight:700;color:#143123;line-height:1.3;overflow-wrap:anywhere;">${title}</h1>
              ${bodyHtml}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td class="email-padding" style="background:#f9fbf9;border-top:1px solid #e3ebe5;padding:24px 40px;text-align:center;line-height:1.7;font-family:'Roboto',Arial,sans-serif;">
              <p style="margin:0 0 8px;font-family:'Roboto',Arial,sans-serif;font-size:13px;color:#6b7280;">Need help? Contact us at</p>
              <a class="footer-contact" href="mailto:info@kbrfreshfoods.lk" style="font-family:'Roboto',Arial,sans-serif;color:#306c4e;font-weight:700;text-decoration:none;font-size:14px;">info@kbrfreshfoods.lk</a>
              <span class="footer-separator" style="color:#9ca3af;"> &nbsp;·&nbsp; </span>
              <a class="footer-contact" href="https://wa.me/94772501450" style="font-family:'Roboto',Arial,sans-serif;color:#306c4e;font-weight:700;text-decoration:none;font-size:14px;">+94 77 250 1450</a>
              <p style="margin:16px 0 0;font-family:'Roboto',Arial,sans-serif;font-size:11px;color:#9ca3af;">&copy; ${new Date().getFullYear()} KBR Fresh Foods. All rights reserved.<br/>
              KBR Fresh Foods, Main Street, Negombo 11500, Sri Lanka</p>
            </td>
          </tr>

        </table>
        <!--[if mso]></td></tr></table><![endif]-->
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
    subject: 'Verify your KBR Fresh Foods account',
    html: brandedTemplate({
      title: `Welcome, ${name}!`,
      preheader: 'Just one click to activate your account.',
      bodyHtml: `
        <p style="color:#4b5563;font-size:15px;line-height:1.7;margin:16px 0;">
          Thank you for joining KBR Fresh Foods! We're excited to have you on board. Please verify your email address to start shopping the freshest produce in Negombo.
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
          <tr>
            <td align="left">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td bgcolor="#306c4e" style="background:#306c4e;border-radius:8px;text-align:center;mso-padding-alt:16px 32px;">
                    <a class="email-button" href="${verifyUrl}" style="display:inline-block;border:1px solid #306c4e;border-radius:8px;color:#fff;font-family:'Roboto',Arial,sans-serif;font-size:15px;line-height:20px;font-weight:700;padding:16px 32px;text-decoration:none;mso-padding-alt:0;">Verify My Email</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <p style="color:#6b7280;font-size:12px;line-height:1.8;text-align:left;margin:0;">
          Or copy this link: <a href="${verifyUrl}" style="color:#306c4e;word-break:break-all;overflow-wrap:anywhere;">${verifyUrl}</a><br/>
          This link expires in <strong>24 hours</strong>.
        </p>
      `,
    }),
  }),

  passwordReset: (name, resetUrl) => ({
    subject: 'Reset your KBR Fresh Foods password',
    html: brandedTemplate({
      title: 'Password Reset',
      preheader: 'Your password reset link is ready.',
      bodyHtml: `
        <p style="color:#4b5563;font-size:15px;line-height:1.7;margin:16px 0;">
          Hi <strong>${name}</strong>, we received a request to reset your password. Click the button below to choose a new password.
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
          <tr>
            <td align="left">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td bgcolor="#306c4e" style="background:#306c4e;border-radius:8px;text-align:center;mso-padding-alt:16px 32px;">
                    <a class="email-button" href="${resetUrl}" style="display:inline-block;border:1px solid #306c4e;border-radius:8px;color:#fff;font-family:'Roboto',Arial,sans-serif;font-size:15px;line-height:20px;font-weight:700;padding:16px 32px;text-decoration:none;mso-padding-alt:0;">Reset My Password</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <p style="color:#6b7280;font-size:12px;line-height:1.8;text-align:left;margin:0;">
          Or copy this link: <a href="${resetUrl}" style="color:#306c4e;word-break:break-all;overflow-wrap:anywhere;">${resetUrl}</a><br/>
          This link expires in <strong>1 hour</strong>. If you did not request this, please ignore this email.
        </p>
      `,
    }),
  }),

  emailChangeOtp: (name, otp, newEmail) => ({
    subject: 'Your email change OTP — KBR Fresh Foods',
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
          <div class="otp-box" style="display:inline-block;background:#f0faf4;border:2px dashed #69a686;border-radius:16px;padding:24px 48px;">
            <span class="otp-code" style="font-size:42px;font-weight:900;letter-spacing:10px;color:#143123;font-family:monospace;">${otp}</span>
          </div>
        </div>
        <p style="color:#6b7280;font-size:12px;line-height:1.8;text-align:left;margin:0;">
          This OTP expires in <strong>15 minutes</strong>. If you did not request this, please ignore this email and your account will remain unchanged.
        </p>
      `,
    }),
  }),

  paymentOtp: (name, otp, amount) => ({
    subject: 'Secure Checkout OTP — KBR Fresh Foods',
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
          <div class="otp-box" style="display:inline-block;background:#fffbeb;border:2px dashed #f59e0b;border-radius:16px;padding:24px 48px;">
            <span class="otp-code" style="font-size:42px;font-weight:900;letter-spacing:10px;color:#92400e;font-family:monospace;">${otp}</span>
          </div>
        </div>
        <p style="color:#6b7280;font-size:12px;line-height:1.8;text-align:left;margin:0;">
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
      pending: 'Pending',
      paid: 'Paid',
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
        <td style="padding:14px 8px;line-height:1.6;overflow-wrap:anywhere;border-bottom:1px solid #e9eeea;font-size:14px;color:#374151;">
          ${item.name}
        </td>
        <td style="padding:14px 8px;line-height:1.6;overflow-wrap:anywhere;border-bottom:1px solid #e9eeea;font-size:14px;color:#6b7280;text-align:center;">
          × ${item.quantity}
        </td>
        <td style="padding:14px 8px;line-height:1.6;overflow-wrap:anywhere;border-bottom:1px solid #e9eeea;font-size:14px;color:#374151;text-align:right;">
          Rs. ${Number(item.unitPrice).toLocaleString()}
        </td>
        <td style="padding:14px 8px;line-height:1.6;overflow-wrap:anywhere;border-bottom:1px solid #e9eeea;font-size:14px;font-weight:600;color:#143123;text-align:right;">
          Rs. ${Number(item.subtotal).toLocaleString()}
        </td>
      </tr>
    `).join('');

    return {
      subject: `Order Confirmed — ${orderNumber} | KBR Fresh Foods`,
      html: brandedTemplate({
        title: 'Order Confirmed!',
        preheader: `Your order ${orderNumber} is confirmed and being prepared.`,
        bodyHtml: `
          <p style="color:#4b5563;font-size:15px;line-height:1.7;margin:16px 0 24px;">
            Hi <strong>${name}</strong>, thank you for your order! Our team is preparing your fresh produce right now.
          </p>

          <!-- Order Meta -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="table-layout:fixed;background:#f0faf4;border:1px solid #d5e8dc;border-radius:10px;margin:0 0 28px;">
            <tr>
              <td style="padding:18px 20px;border-bottom:1px solid #d5e8dc;">
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Order Number</p>
                <p style="margin:0;font-family:'Google Sans',Roboto,Arial,sans-serif;font-size:18px;line-height:1.4;font-weight:700;color:#143123;overflow-wrap:anywhere;">${orderNumber}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 20px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="table-layout:fixed;">
                  <tr>
                    <td class="stack-column" width="50%" style="padding:0 16px 0 0;">
                      <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Order Date</p>
                      <p style="margin:0;font-size:13px;line-height:1.6;color:#374151;">${orderDate}</p>
                    </td>
                    <td class="stack-gap" width="0" style="font-size:0;line-height:0;"></td>
                    <td class="stack-column" width="50%">
                      <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Est. Delivery</p>
                      <p style="margin:0;font-size:13px;line-height:1.6;color:#374151;">${estimatedTime}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Items Table -->
          <p style="font-size:13px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Your Items</p>
          <table class="items-table" width="100%" cellpadding="0" cellspacing="0" style="table-layout:fixed;border-collapse:collapse;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;margin:0 0 20px;">
            <thead>
              <tr style="background:#f9fafb;">
                <th scope="col" style="padding:14px 8px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;text-align:left;width:34%;">Item</th>
                <th scope="col" style="padding:14px 8px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;text-align:center;width:12%;">Qty</th>
                <th scope="col" style="padding:14px 8px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;text-align:right;width:27%;">Unit Price</th>
                <th scope="col" style="padding:14px 8px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;text-align:right;width:27%;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
          </table>

          <!-- Totals -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 28px;">
            <tr>
              <td style="padding:8px 8px;font-size:14px;color:#6b7280;">Items Total</td>
              <td style="padding:8px 8px;font-size:14px;color:#374151;text-align:right;">Rs. ${Number(itemsTotal).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding:8px 8px;font-size:14px;color:#6b7280;">Delivery Fee</td>
              <td style="padding:8px 8px;font-size:14px;color:#374151;text-align:right;">Rs. ${Number(deliveryFee).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="border-top:2px solid #143123;background:#f0faf4;padding:16px 8px;font-family:'Google Sans',Roboto,Arial,sans-serif;font-size:17px;font-weight:800;color:#143123;">Total Amount</td>
              <td style="border-top:2px solid #143123;background:#f0faf4;padding:16px 8px;font-family:'Google Sans',Roboto,Arial,sans-serif;font-size:17px;font-weight:800;color:#306c4e;text-align:right;">Rs. ${Number(totalAmount).toLocaleString()}</td>
            </tr>
          </table>

          <!-- Payment & Delivery Info -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="table-layout:fixed;margin:0 0 24px;">
            <tr>
              <td class="stack-column" width="48%" style="background:#f9fbf9;border:1px solid #e3ebe5;border-radius:10px;padding:18px;">
                <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Payment</p>
                <p style="margin:0;font-size:14px;line-height:1.6;font-weight:600;color:#143123;">${paymentLabels[paymentMethod] || paymentMethod}</p>
                <p style="margin:4px 0 0;font-size:12px;line-height:1.6;color:#6b7280;">${statusLabels[paymentStatus] || paymentStatus}</p>
              </td>
              <td class="stack-gap" width="4%" style="font-size:0;line-height:0;"></td>
              <td class="stack-column" width="48%" style="background:#f9fbf9;border:1px solid #e3ebe5;border-radius:10px;padding:18px;">
                <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Delivery To</p>
                <p style="margin:0;font-size:14px;line-height:1.6;font-weight:600;color:#143123;overflow-wrap:anywhere;">${addressLine}</p>
              </td>
            </tr>
          </table>

          <!-- Invoice Note -->
          <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:10px;padding:14px 18px;margin:0 0 24px;">
            <p style="margin:0;font-size:13px;color:#92400e;">
              Your digital invoice is attached to this email as a PDF. Keep it for your records.
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
