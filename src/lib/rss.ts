import Parser from 'rss-parser';
import { sql } from './db';

const parser = new Parser();
const FEED_URL = 'https://ajsai.substack.com/feed';

export interface NewsletterItem {
  guid: string;
  title: string;
  link: string;
  pubDate: string;
  content: string;
}

export async function fetchNewNewsletter(): Promise<NewsletterItem | null> {
  const feed = await parser.parseURL(FEED_URL);

  if (!feed.items.length) return null;

  const latest = feed.items[0];
  const guid = latest.guid || latest.link || '';

  const existing = await sql`
    SELECT id FROM newsletters WHERE guid = ${guid}
  `;

  if (existing.length > 0) {
    return null;
  }

  return {
    guid,
    title: latest.title || '',
    link: latest.link || '',
    pubDate: latest.pubDate || new Date().toISOString(),
    content: latest['content:encoded'] || latest.content || ''
  };
}

export async function saveNewsletter(item: NewsletterItem): Promise<string> {
  const result = await sql`
    INSERT INTO newsletters (guid, title, original_url, published_at, raw_content)
    VALUES (${item.guid}, ${item.title}, ${item.link}, ${item.pubDate}, ${item.content})
    RETURNING id
  `;
  return result[0].id;
}
