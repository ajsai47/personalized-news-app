import { NextRequest, NextResponse } from 'next/server';
import { verifyMagicLink } from '@/lib/auth';
import { createSession } from '@/lib/session';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  if (!token || !email) {
    return NextResponse.redirect(new URL('/login?error=invalid', request.url));
  }

  const result = await verifyMagicLink(email, token);

  if (!result) {
    return NextResponse.redirect(new URL('/login?error=expired', request.url));
  }

  await createSession(result.userId);

  const redirectTo = result.onboardingCompleted ? '/feed' : '/onboarding';
  return NextResponse.redirect(new URL(redirectTo, request.url));
}
