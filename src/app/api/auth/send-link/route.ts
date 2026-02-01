import { NextRequest, NextResponse } from 'next/server';
import { createMagicLink } from '@/lib/auth';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const magicLink = await createMagicLink(email);

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'AG+ News <noreply@yourdomain.com>',
        to: email,
        subject: 'Your login link',
        html: `<p>Click <a href="${magicLink}">here</a> to log in. Link expires in 15 minutes.</p>`
      });
    } else {
      console.log('DEV MODE - Magic link:', magicLink);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Send link error:', error);
    return NextResponse.json({ error: 'Failed to send link' }, { status: 500 });
  }
}
