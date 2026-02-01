import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { sql } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await sql`
    SELECT role, industry, interests, tone, depth, vibe
    FROM user_preferences
    WHERE user_id = ${session.userId}
  `;

  return NextResponse.json(result[0] || {});
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();

  await sql`
    UPDATE user_preferences SET
      role = ${data.role},
      industry = ${data.industry},
      interests = ${data.interests},
      tone = ${data.tone},
      depth = ${data.depth},
      vibe = ${data.vibe},
      updated_at = NOW()
    WHERE user_id = ${session.userId}
  `;

  // Clear personalization cache when preferences change
  await sql`
    DELETE FROM personalized_segments WHERE user_id = ${session.userId}
  `;

  return NextResponse.json({ success: true });
}
