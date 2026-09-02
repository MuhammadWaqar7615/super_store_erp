const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || process.env.EMAIL_HOST,
  port: process.env.SMTP_PORT || process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
  },
});

const sendOTP = async (to, otp) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.EMAIL_FROM || '"Super Store" <noreply@superstore.com>',
    to,
    subject: 'Your Registration OTP - Super Store',
    text: `Your OTP for registration is ${otp}. It will expire in 15 minutes.`,
    html: `<p>Your OTP for registration is <b>${otp}</b>.</p><p>It will expire in 15 minutes.</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email: ', error);
    return false;
  }
};

module.exports = {
  sendOTP,
};
