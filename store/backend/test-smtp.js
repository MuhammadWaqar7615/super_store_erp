const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: undefined,
    pass: undefined,
  },
});
transporter.sendMail({
  from: '"Super Store" <noreply@superstore.com>',
  to: 'test@example.com',
  subject: 'Test',
  text: 'Hello'
}).then(() => console.log('success')).catch(e => console.error(e));
