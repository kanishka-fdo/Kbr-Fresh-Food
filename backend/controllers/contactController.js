const sendEmail = require('../utils/sendEmail');

// @route POST /api/contact
exports.sendContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required.' });
    }

    // Send to admin
    await sendEmail({
      to: process.env.EMAIL_USER || 'admin@kbrfreshfoods.lk',
      subject: `[KBR Contact] ${subject || 'New enquiry'} — from ${name}`,
      html: `
        <div style="font-family:'Roboto',Arial,sans-serif;max-width:600px;margin:auto;background:#f9fafb;border-radius:12px;overflow:hidden;">
          <div style="background:#16a34a;padding:24px 32px;">
            <h1 style="font-family:'Google Sans',Roboto,Arial,sans-serif;color:white;margin:0;font-size:20px;"><svg style="display:inline-block;vertical-align:middle;margin-right:8px;" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>KBR Fresh Foods — Contact Enquiry</h1>
          </div>
          <div style="padding:32px;">
            <p style="margin:0 0 16px;"><strong>Name:</strong> ${name}</p>
            <p style="margin:0 0 16px;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            ${phone ? `<p style="margin:0 0 16px;"><strong>Phone:</strong> ${phone}</p>` : ''}
            ${subject ? `<p style="margin:0 0 16px;"><strong>Subject:</strong> ${subject}</p>` : ''}
            <p style="margin:0 0 8px;"><strong>Message:</strong></p>
            <div style="background:white;border-radius:8px;padding:16px;border:1px solid #e5e7eb;">
              <p style="margin:0;white-space:pre-wrap;">${message}</p>
            </div>
          </div>
        </div>
      `,
    });

    // Send confirmation to customer
    await sendEmail({
      to: email,
      subject: 'Thank you for contacting KBR Fresh Foods!',
      html: `
        <div style="font-family:'Roboto',Arial,sans-serif;max-width:600px;margin:auto;background:#f9fafb;border-radius:12px;overflow:hidden;">
          <div style="background:#16a34a;padding:24px 32px;">
            <h1 style="font-family:'Google Sans',Roboto,Arial,sans-serif;color:white;margin:0;font-size:20px;"><svg style="display:inline-block;vertical-align:middle;margin-right:8px;" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>KBR Fresh Foods</h1>
          </div>
          <div style="padding:32px;font-family:'Roboto',Arial,sans-serif;">
            <h2 style="font-family:'Google Sans',Roboto,Arial,sans-serif;color:#15803d;margin-top:0;">Hi ${name}! We received your message.</h2>
            <p style="color:#4b5563;">Thank you for getting in touch with us. Our team will respond within 24 hours.</p>
            <p style="color:#4b5563;">In the meantime, you can reach us directly at:</p>
            <ul style="color:#4b5563;list-style:none;padding-left:0;">
              <li><strong>Tel:</strong> +94 31 222 1450</li>
              <li><strong>Address:</strong> 45 Senanayake Mawatha, Negombo, Sri Lanka</li>
            </ul>
            <p style="color:#4b5563;font-size:14px;margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;">
              — The KBR Fresh Foods Team
            </p>
          </div>
        </div>
      `,
    });

    return res.json({ message: 'Your message has been sent successfully. We will be in touch soon!' });
  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ message: 'Failed to send message. Please try again.' });
  }
};
