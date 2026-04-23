const nodemailer = require('nodemailer');

const buildTransporter = () => {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_SECURE,
  } = process.env;

  if (!SMTP_HOST || !SMTP_PORT) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: String(SMTP_SECURE).toLowerCase() === 'true',
    auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });
};

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = buildTransporter();

  if (!transporter) {
    console.warn('SMTP not configured. Email skipped.');
    console.warn(`To: ${to}`);
    console.warn(`Subject: ${subject}`);
    console.warn(text);
    return;
  }

  const from = process.env.EMAIL_FROM || process.env.SMTP_USER || 'no-reply@samadhaan.local';

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
};

module.exports = { sendEmail };
