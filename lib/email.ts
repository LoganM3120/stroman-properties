import nodemailer from 'nodemailer';

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM_EMAIL,
  CONTACT_RECIPIENT_EMAIL,
} = process.env;

if (!SMTP_HOST) throw new Error('Missing SMTP_HOST environment variable');
if (!SMTP_PORT) throw new Error('Missing SMTP_PORT environment variable');
if (!SMTP_USER) throw new Error('Missing SMTP_USER environment variable');
if (!SMTP_PASS) throw new Error('Missing SMTP_PASS environment variable');
if (!CONTACT_RECIPIENT_EMAIL)
  throw new Error('Missing CONTACT_RECIPIENT_EMAIL environment variable');

const port = Number.parseInt(SMTP_PORT, 10);

if (Number.isNaN(port)) {
  throw new Error('SMTP_PORT must be a valid number');
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port,
  secure: SMTP_SECURE === 'true',
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export interface ContactFormPayload {
  email: string;
  firstName: string;
  lastName: string;
  subject: string;
  body: string;
}

export async function sendContactEmail(payload: ContactFormPayload) {
  const { email, firstName, lastName, subject, body } = payload;

  await transporter.sendMail({
    to: CONTACT_RECIPIENT_EMAIL,
    from: SMTP_FROM_EMAIL ?? SMTP_USER,
    subject,
    replyTo: email,
    text: [
      body,
      '',
      `From: ${firstName} ${lastName}`,
      `Email: ${email}`,
    ].join('\n'),
  });
}

