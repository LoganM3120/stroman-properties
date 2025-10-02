import { NextResponse } from 'next/server';

import { sendContactEmail, type ContactFormPayload } from '@/lib/email';

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<ContactFormPayload>;

  if (!body.email || !body.firstName || !body.lastName || !body.subject || !body.body) {
    return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
  }

  try {
    await sendContactEmail(body as ContactFormPayload);
    return NextResponse.json({ message: 'Email sent successfully.' });
  } catch (error) {
    console.error('Failed to send contact email', error);
    return NextResponse.json(
      { message: 'Unable to send email. Please try again later.' },
      { status: 500 },
    );
  }
}

