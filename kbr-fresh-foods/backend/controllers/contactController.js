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
        <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#f9fafb;border-radius:12px;overflow:hidden;">
          <div style="background:#16a34a;padding:24px 32px;">
            <h1 style="color:white;margin:0;font-size:20px;">🌿 KBR Fresh Foods — Contact Enquiry</h1>
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
        <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#f9fafb;border-radius:12px;overflow:hidden;">
          <div style="background:#16a34a;padding:24px 32px;">
            <h1 style="color:white;margin:0;font-size:20px;">🌿 KBR Fresh Foods</h1>
          </div>
          <div style="padding:32px;">
            <h2 style="color:#15803d;margin-top:0;">Hi ${name}! We received your message.</h2>
            <p style="color:#4b5563;">Thank you for getting in touch with us. Our team will respond within 24 hours.</p>
            <p style="color:#4b5563;">In the meantime, you can reach us directly at:</p>
            <ul style="color:#4b5563;">
              <li>📞 +94 31 222 1450</li>
              <li>📍 45 Senanayake Mawatha, Negombo, Sri Lanka</li>
            </ul>
            <p style="color:#4b5563;font-size:14px;margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;">
              — The KBR Fresh Foods Team 🌿
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
