import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log('Running migrations...');

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      magic_link_token TEXT,
      token_expires_at TIMESTAMPTZ,
      onboarding_completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('✓ users table');

  await sql`
    CREATE TABLE IF NOT EXISTS user_preferences (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
      role TEXT,
      industry TEXT,
      interests TEXT[],
      tone TEXT DEFAULT 'balanced',
      depth TEXT DEFAULT 'standard',
      vibe TEXT DEFAULT 'conversational',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('✓ user_preferences table');

  await sql`
    CREATE TABLE IF NOT EXISTS newsletters (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      guid TEXT UNIQUE NOT NULL,
      published_at TIMESTAMPTZ,
      original_url TEXT,
      title TEXT,
      raw_content TEXT,
      processed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('✓ newsletters table');

  await sql`
    CREATE TABLE IF NOT EXISTS segments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      newsletter_id UUID REFERENCES newsletters(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      title TEXT,
      original_content TEXT,
      topics TEXT[],
      order_in_newsletter INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('✓ segments table');

  await sql`
    CREATE TABLE IF NOT EXISTS personalized_segments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      segment_id UUID REFERENCES segments(id) ON DELETE CASCADE,
      rewritten_content TEXT,
      generated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, segment_id)
    )
  `;
  console.log('✓ personalized_segments table');

  await sql`
    CREATE TABLE IF NOT EXISTS user_interactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      segment_id UUID REFERENCES segments(id) ON DELETE CASCADE,
      action TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('✓ user_interactions table');

  console.log('Migrations complete!');
}

migrate().catch(console.error);
