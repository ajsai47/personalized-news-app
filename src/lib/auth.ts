import { sql } from './db';
import { randomBytes, createHash } from 'crypto';

export function generateToken(): string {
  return randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function createMagicLink(email: string): Promise<string> {
  const token = generateToken();
  const hashedToken = hashToken(token);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await sql`
    INSERT INTO users (email, magic_link_token, token_expires_at)
    VALUES (${email}, ${hashedToken}, ${expiresAt})
    ON CONFLICT (email) DO UPDATE SET
      magic_link_token = ${hashedToken},
      token_expires_at = ${expiresAt}
  `;

  return `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;
}

export async function verifyMagicLink(email: string, token: string): Promise<{ userId: string; onboardingCompleted: boolean } | null> {
  const hashedToken = hashToken(token);

  const result = await sql`
    SELECT id, onboarding_completed FROM users
    WHERE email = ${email}
      AND magic_link_token = ${hashedToken}
      AND token_expires_at > NOW()
  `;

  if (result.length === 0) return null;

  await sql`
    UPDATE users SET magic_link_token = NULL, token_expires_at = NULL
    WHERE email = ${email}
  `;

  return {
    userId: result[0].id,
    onboardingCompleted: result[0].onboarding_completed
  };
}
