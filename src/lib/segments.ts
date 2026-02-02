import { sql } from './db';
import { getUserPreferences, getPersonalizedContent } from './personalize';

export interface Segment {
  id: string;
  type: string;
  title: string;
  originalContent: string;
  personalizedContent?: string;
  topics: string[];
  companies: string[];
  publishedAt: string;
}

export async function getTodaysSegments(): Promise<Segment[]> {
  const result = await sql`
    SELECT s.id, s.type, s.title, s.original_content, s.topics, s.companies, n.published_at
    FROM segments s
    JOIN newsletters n ON s.newsletter_id = n.id
    WHERE n.published_at > NOW() - INTERVAL '7 days'
    ORDER BY n.published_at DESC, s.order_in_newsletter ASC
  `;

  return result.map(row => ({
    id: row.id,
    type: row.type,
    title: row.title,
    originalContent: row.original_content,
    topics: row.topics || [],
    companies: row.companies || [],
    publishedAt: row.published_at
  }));
}

export async function getPersonalizedSegments(userId: string): Promise<Segment[]> {
  const segments = await getTodaysSegments();
  const preferences = await getUserPreferences(userId);

  if (!preferences) {
    return segments;
  }

  const userInterests = await sql`
    SELECT interests FROM user_preferences WHERE user_id = ${userId}
  `;
  const interests = userInterests[0]?.interests || [];

  // Sort segments by user interest relevance
  const sorted = [...segments].sort((a, b) => {
    const aMatches = a.topics.filter(t => interests.includes(t.toLowerCase())).length;
    const bMatches = b.topics.filter(t => interests.includes(t.toLowerCase())).length;
    return bMatches - aMatches;
  });

  // Only personalize top 3 segments to avoid rate limits (5/min limit)
  // This allows the feed to load quickly with some personalized content
  const MAX_PERSONALIZED = 3;

  const personalized = await Promise.all(
    sorted.map(async (segment, index) => {
      // Only personalize the top few segments
      if (index < MAX_PERSONALIZED) {
        try {
          const personalizedContent = await getPersonalizedContent(
            userId,
            segment.id,
            segment.originalContent,
            preferences
          );
          return { ...segment, personalizedContent };
        } catch {
          return segment;
        }
      }
      return segment;
    })
  );

  return personalized;
}
