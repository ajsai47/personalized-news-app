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

export interface TopicTrendPoint {
  date: string;
  count: number;
}

export interface TopicTrendData {
  topic: string;
  points: TopicTrendPoint[];
}

export type StatsPeriod = '1d' | '1w' | '1m' | '3m' | '6m' | '1yr';

const PERIOD_INTERVALS: Record<StatsPeriod, number> = {
  '1d': 1,
  '1w': 7,
  '1m': 30,
  '3m': 90,
  '6m': 182,
  '1yr': 365
};

type GroupingType = '4hour' | 'day' | 'week' | 'month';

function getGroupingType(period: StatsPeriod): GroupingType {
  switch (period) {
    case '1d':
      return '4hour';
    case '1w':
      return 'day';
    case '1m':
      return 'week';
    case '3m':
    case '6m':
    case '1yr':
      return 'month';
  }
}

/**
 * Aggregates topic counts from segments over a configurable time period
 * Returns top topics with counts and timeline data suitable for charting
 */
export async function getTopicStats(
  period: StatsPeriod = '1m'
): Promise<TopicStatsResult> {
  const intervalDays = PERIOD_INTERVALS[period];
  const grouping = getGroupingType(period);

  const segments = await sql`
    SELECT s.topics, n.published_at
    FROM segments s
    JOIN newsletters n ON s.newsletter_id = n.id
    WHERE n.published_at > NOW() - INTERVAL '1 day' * ${intervalDays}
    ORDER BY n.published_at DESC
  `;

  const topicCounts = new Map<string, number>();
  const groupedData = new Map<string, Map<string, number>>();

  for (const row of segments) {
    const topics = row.topics || [];
    const publishedAt = new Date(row.published_at);
    const groupKey = getGroupKey(publishedAt, grouping);

    if (!groupedData.has(groupKey)) {
      groupedData.set(groupKey, new Map());
    }
    const groupTopics = groupedData.get(groupKey)!;

    for (const topic of topics) {
      topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
      groupTopics.set(topic, (groupTopics.get(topic) || 0) + 1);
    }
  }

  const topTopics: TopicCount[] = Array.from(topicCounts.entries())
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count);

  const timeline: TopicTimeline[] = Array.from(groupedData.entries())
    .map(([periodKey, topics]) => {
      const topicsArray = Array.from(topics.entries())
        .map(([topic, count]) => ({ topic, count }))
        .sort((a, b) => b.count - a.count);

      return {
        period: periodKey,
        periodLabel: formatPeriodLabel(periodKey, grouping),
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
 * Fetch trend data for a single topic over a given period
 */
export async function getTopicTrends(
  topic: string,
  period: StatsPeriod = '1m'
): Promise<TopicTrendData> {
  const intervalDays = PERIOD_INTERVALS[period];
  const grouping = getGroupingType(period);

  const segments = await sql`
    SELECT s.topics, n.published_at
    FROM segments s
    JOIN newsletters n ON s.newsletter_id = n.id
    WHERE n.published_at > NOW() - INTERVAL '1 day' * ${intervalDays}
      AND ${topic} = ANY(s.topics)
    ORDER BY n.published_at ASC
  `;

  const groupedCounts = new Map<string, number>();

  for (const row of segments) {
    const publishedAt = new Date(row.published_at);
    const groupKey = getGroupKey(publishedAt, grouping);
    groupedCounts.set(groupKey, (groupedCounts.get(groupKey) || 0) + 1);
  }

  const points: TopicTrendPoint[] = Array.from(groupedCounts.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return { topic, points };
}

/**
 * Generate a group key for a date based on the grouping type
 */
function getGroupKey(date: Date, grouping: GroupingType): string {
  const d = new Date(date);

  switch (grouping) {
    case '4hour': {
      const block = Math.floor(d.getHours() / 4) * 4;
      d.setHours(block, 0, 0, 0);
      return d.toISOString();
    }
    case 'day': {
      d.setHours(0, 0, 0, 0);
      return d.toISOString().split('T')[0];
    }
    case 'week': {
      const weekStart = getWeekStart(d);
      return weekStart.toISOString().split('T')[0];
    }
    case 'month': {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }
  }
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
 * Format a period label based on the grouping type
 */
function formatPeriodLabel(periodKey: string, grouping: GroupingType): string {
  switch (grouping) {
    case '4hour': {
      const date = new Date(periodKey);
      const hour = date.getHours();
      const endHour = hour + 4;
      return `${hour}:00-${endHour}:00`;
    }
    case 'day': {
      const date = new Date(periodKey);
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
    case 'week': {
      const date = new Date(periodKey);
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const day = date.getDate();
      return `${month} ${day}`;
    }
    case 'month': {
      const [year, month] = periodKey.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
  }
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
