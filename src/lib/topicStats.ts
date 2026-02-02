import { sql } from './db';

export interface TopicCount {
  topic: string;
  count: number;
}

export interface TopicTimeline {
  period: string;
  periodLabel: string;
  topics: TopicCount[];
  total: number;
}

export interface TopicStatsResult {
  topTopics: TopicCount[];
  timeline: TopicTimeline[];
  totalSegments: number;
}

/**
 * Aggregates topic counts from segments over the last 30 days
 * Returns top topics with counts and timeline data suitable for charting
 */
export async function getTopicStats(): Promise<TopicStatsResult> {
  // Get all segments from the last 30 days with their topics
  const segments = await sql`
    SELECT s.topics, n.published_at
    FROM segments s
    JOIN newsletters n ON s.newsletter_id = n.id
    WHERE n.published_at > NOW() - INTERVAL '30 days'
    ORDER BY n.published_at DESC
  `;

  // Aggregate topic counts
  const topicCounts = new Map<string, number>();

  // Group by week for timeline
  const weeklyData = new Map<string, Map<string, number>>();

  for (const row of segments) {
    const topics = row.topics || [];
    const publishedAt = new Date(row.published_at);

    // Get week key (ISO week format)
    const weekStart = getWeekStart(publishedAt);
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!weeklyData.has(weekKey)) {
      weeklyData.set(weekKey, new Map());
    }
    const weekTopics = weeklyData.get(weekKey)!;

    for (const topic of topics) {
      // Overall counts
      topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);

      // Weekly counts
      weekTopics.set(topic, (weekTopics.get(topic) || 0) + 1);
    }
  }

  // Convert to sorted array of top topics
  const topTopics: TopicCount[] = Array.from(topicCounts.entries())
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count);

  // Convert weekly data to timeline format
  const timeline: TopicTimeline[] = Array.from(weeklyData.entries())
    .map(([period, topics]) => {
      const topicsArray = Array.from(topics.entries())
        .map(([topic, count]) => ({ topic, count }))
        .sort((a, b) => b.count - a.count);

      return {
        period,
        periodLabel: formatWeekLabel(new Date(period)),
        topics: topicsArray,
        total: topicsArray.reduce((sum, t) => sum + t.count, 0)
      };
    })
    .sort((a, b) => a.period.localeCompare(b.period));

  return {
    topTopics,
    timeline,
    totalSegments: segments.length
  };
}

/**
 * Get the Monday of the week for a given date
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Format week label for display
 */
function formatWeekLabel(date: Date): string {
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  return `${month} ${day}`;
}

// Topic display names and colors for the UI
export const TOPIC_CONFIG: Record<string, { label: string; color: string }> = {
  hardware: { label: 'Hardware', color: 'var(--iron-gall)' },
  llms: { label: 'LLMs', color: 'var(--vermillion)' },
  regulation: { label: 'Regulation', color: 'var(--sepia)' },
  startups: { label: 'Startups', color: 'var(--gold-dark)' },
  big_tech: { label: 'Big Tech', color: 'var(--ink)' },
  tools: { label: 'Tools', color: 'var(--gold)' },
  robotics: { label: 'Robotics', color: 'var(--ink-light)' },
  general: { label: 'General', color: 'var(--ink-faded)' }
};
