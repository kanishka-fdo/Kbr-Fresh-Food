const nodemailer = require('nodemailer');

// In development, we can log the email content or use Ethereal for testing
// Ethereal creates fake mailboxes so we don't accidentally email real customers.

const createTransporter = async () => {
  // If you want to use a real Gmail/SMTP account, provide these in .env:
  // SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback: Generate Ethereal test account dynamically if no env vars exist
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });
};

/**
 * Send an email using Nodemailer
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject line
 * @param {string} text - Plain text body
 * @param {string} html - HTML body (optional)
 * @param {Array} attachments - Array of attachment objects { filename, path, contentType } (optional)
 */
exports.sendEmail = async (to, subject, text, html, attachments = []) => {
  try {
    const transporter = await createTransporter();
    
    const mailOptions = {
      from: '"KBR Fresh Foods" <noreply@kbrfreshfoods.com>',
      to,
      subject,
      text,
      html,
      attachments
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✉️  Email sent to ${to}: ${subject}`);
    
    if (info.messageId && !process.env.SMTP_USER) {
      // Ethereal provides a preview URL!
      console.log(`🔗 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};
