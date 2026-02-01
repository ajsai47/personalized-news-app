import { cookies } from 'next/headers';
import { sql } from './db';

const SESSION_COOKIE = 'session_token';
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000;

export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomUUID();

  (await cookies()).set(SESSION_COOKIE, `${userId}:${token}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000,
    path: '/'
  });

  return token;
}

export async function getSession(): Promise<{ userId: string } | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);

  if (!sessionCookie) return null;

  const [userId] = sessionCookie.value.split(':');
  if (!userId) return null;

  const result = await sql`SELECT id FROM users WHERE id = ${userId}`;
  if (result.length === 0) return null;

  return { userId };
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
