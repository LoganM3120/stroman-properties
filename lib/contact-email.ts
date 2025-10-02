import 'server-only';

import nodemailer from 'nodemailer';

type Transporter = nodemailer.Transporter;

export interface ContactFormPayload {
  email: string;
  firstName: string;
  lastName: string;
  subject: string;
  body: string;
}

let cachedTransporter: Transporter | null = null;

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} environment variable`);
  }
  return value;
}

function getTransporter(): Transporter {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const host = getRequiredEnv('SMTP_HOST');
  const portValue = getRequiredEnv('SMTP_PORT');
  const user = getRequiredEnv('SMTP_USER');
  const pass = getRequiredEnv('SMTP_PASS');

  const port = Number.parseInt(portValue, 10);
  if (Number.isNaN(port)) {
    throw new Error('SMTP_PORT must be a valid number');
  }

  const secure = process.env.SMTP_SECURE === 'true';

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });

  return cachedTransporter;
}

export async function sendContactEmail(payload: ContactFormPayload) {
  const transporter = getTransporter();
  const {
    email,
    firstName,
    lastName,
    subject,
    body,
  } = payload;

  const to = getRequiredEnv('CONTACT_RECIPIENT_EMAIL');
  const from = process.env.SMTP_FROM_EMAIL ?? process.env.SMTP_USER ?? to;

  await transporter.sendMail({
    to,
    from,
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
