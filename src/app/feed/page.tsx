import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { getPersonalizedSegments } from '@/lib/segments';
import { FeedContent } from '@/components/FeedContent';
import { DaVinciSketches } from '@/components/DaVinciSketches';
import { sql } from '@/lib/db';

// Get time-based greeting
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morrow';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// Format date in formal style
function formatDate(): string {
  const date = new Date();
  const day = date.getDate();
  const ordinal = getOrdinal(day);
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const year = date.getFullYear();
  return `${month} ${day}${ordinal}, ${year}`;
}

function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

// Get user preferences
async function getUserPreferences(userId: string) {
  const result = await sql`
    SELECT role, industry, interests, tone, depth, vibe
    FROM user_preferences
    WHERE user_id = ${userId}
  `;
  return result[0] || null;
}

export default async function FeedPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const [segments, preferences] = await Promise.all([
    getPersonalizedSegments(session.userId),
    getUserPreferences(session.userId)
  ]);

  const greeting = getGreeting();
  const dateStr = formatDate();
  const roleLabel = preferences?.role
    ? preferences.role.charAt(0).toUpperCase() + preferences.role.slice(1)
    : 'Scholar';

  // Count high-relevance items
  const importantCount = segments.filter(s => {
    const title = s.title.toLowerCase();
    return ['breaking', 'major', 'raises', 'billion', 'launch', 'announces'].some(k => title.includes(k));
  }).length;

  return (
    <main className="min-h-screen notebook-page">
      {/* Feed Content with Filtering */}
      {segments.length === 0 ? (
        <>
          <DaVinciSketches />
          <div className="max-w-3xl mx-auto px-6 py-16">
            <div className="text-center">
              <div className="text-6xl mb-6 opacity-30">🪶</div>
              <h2 className="font-handwritten text-3xl mb-4" style={{ color: 'var(--ink)' }}>
                No observations yet
              </h2>
              <p className="font-serif italic" style={{ color: 'var(--ink-light)' }}>
                The quill awaits. Check back soon for discoveries in the realm of artificial minds.
              </p>
            </div>
          </div>
        </>
      ) : (
        <FeedContent
          segments={segments}
          userPreferences={preferences}
          dateStr={dateStr}
          greeting={greeting}
          roleLabel={roleLabel}
          importantCount={importantCount}
        />
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-[var(--ink-faded)]/20 mt-16">
        <div className="max-w-3xl mx-auto px-6 py-8 text-center">
          <div className="hand-drawn-divider mb-4" />
          <p className="font-serif italic text-sm" style={{ color: 'var(--ink-faded)' }}>
            Inscribed with the assistance of Claude, an artificial mind
          </p>
        </div>
      </footer>
    </main>
  );
}
