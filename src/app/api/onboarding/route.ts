import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { role, industry, interests, tone, depth, vibe } = await request.json();

  await sql`
    INSERT INTO user_preferences (user_id, role, industry, interests, tone, depth, vibe)
    VALUES (${session.userId}, ${role}, ${industry}, ${interests}, ${tone}, ${depth}, ${vibe})
    ON CONFLICT (user_id) DO UPDATE SET
      role = ${role},
      industry = ${industry},
      interests = ${interests},
      tone = ${tone},
      depth = ${depth},
      vibe = ${vibe},
      updated_at = NOW()
  `;

  await sql`
    UPDATE users SET onboarding_completed = TRUE WHERE id = ${session.userId}
  `;

  return NextResponse.json({ success: true });
}
