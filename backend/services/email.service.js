const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send emergency alert email to a contact.
 */
const sendEmergencyEmail = async ({ to, userName, contactName, mapLink, alertType }) => {
  const subject = alertType
    ? `⚠️ Safety Alert for ${userName}`
    : `🚨 Emergency Alert from ${userName}`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:2px solid #DC2626;border-radius:12px;">
      <h1 style="color:#DC2626;text-align:center;">Emergency Alert!</h1>
      <p>Dear ${contactName || 'Guardian'},</p>
      <p><strong>${userName}</strong> may be in danger.</p>
      ${alertType ? `<p style="color:#DC2626;"><strong>Alert:</strong> ${alertType}</p>` : ''}
      <p><strong>Location:</strong></p>
      <a href="${mapLink}" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
        View Location on Map
      </a>
      <p style="margin-top:20px;color:#666;font-size:12px;">
        This is an automated alert from the Women Safety App.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Women Safety App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

module.exports = { sendEmergencyEmail };
