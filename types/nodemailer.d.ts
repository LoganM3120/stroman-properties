declare module 'nodemailer' {
  export interface TransportOptions {
    host?: string;
    port?: number;
    secure?: boolean;
    auth?: {
      user?: string;
      pass?: string;
    };
  }

  export interface SendMailOptions {
    from?: string;
    to?: string;
    subject?: string;
    text?: string;
    replyTo?: string;
  }

  export interface SentMessageInfo {
    messageId?: string;
    envelope?: {
      from?: string | false;
      to?: string[];
    };
    accepted?: string[];
    rejected?: string[];
    pending?: string[];
    response?: string;
    [key: string]: unknown;
  }

  export interface Transporter {
    sendMail(mailOptions: SendMailOptions): Promise<SentMessageInfo>;
  }

  export function createTransport(options: TransportOptions): Transporter;

  interface Nodemailer {
    createTransport: typeof createTransport;
  }

  const nodemailer: Nodemailer;

  export default nodemailer;
}
