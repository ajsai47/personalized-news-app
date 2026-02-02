const https = require('https');
const { Client } = require('pg');

const DB_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_8znAj0gZPHWr@ep-jolly-rain-afymphms-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require';

async function fetchRSS() {
  return new Promise((resolve, reject) => {
    https.get('https://ajsai.substack.com/feed', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    });
  });
}

function parseItems(xml) {
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
  return items.slice(0, 20).map((item, index) => {
    const title = item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1]?.trim() || '';
    const description = item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1]?.trim() || '';
    const contentEncoded = item.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/)?.[1]?.trim() || '';
    const link = item.match(/<link>(.*?)<\/link>/)?.[1] || '';
    const guid = item.match(/<guid[^>]*>(.*?)<\/guid>/)?.[1] || link || `substack-${index}-${Date.now()}`;

    // Determine type based on title
    let type = 'main_news';
    if (title.toLowerCase().includes('week in review')) {
      type = 'quick_news';
    } else if (title.toLowerCase().includes('tool') || title.toLowerCase().includes('cowork')) {
      type = 'top_tools';
    }

    // Extract topics from content
    const topics = [];
    const lowerContent = (title + ' ' + description).toLowerCase();
    if (lowerContent.includes('nvidia') || lowerContent.includes('gpu')) topics.push('hardware');
    if (lowerContent.includes('openai') || lowerContent.includes('anthropic') || lowerContent.includes('deepmind')) topics.push('llms');
    if (lowerContent.includes('china') || lowerContent.includes('regulation')) topics.push('regulation');
    if (lowerContent.includes('startup') || lowerContent.includes('funding') || lowerContent.includes('raise')) topics.push('startups');
    if (lowerContent.includes('meta') || lowerContent.includes('google') || lowerContent.includes('microsoft')) topics.push('big_tech');
    if (lowerContent.includes('agent') || lowerContent.includes('tool')) topics.push('tools');
    if (topics.length === 0) topics.push('general');

    return { title, description, content: contentEncoded || description, type, topics, link, guid, order: index };
  });
}

async function main() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();

  console.log('Fetching RSS feed...');
  const xml = await fetchRSS();
  const items = parseItems(xml);
  console.log(`Found ${items.length} articles`);

  // Create dates within the last 7 days (Jan 26 - Feb 1, 2026)
  const baseDates = [
    '2026-01-31', '2026-01-31', // 2 articles
    '2026-01-30', '2026-01-30', // 2 articles
    '2026-01-29', '2026-01-29', '2026-01-29', // 3 articles
    '2026-01-28', '2026-01-28', // 2 articles
    '2026-01-27', '2026-01-27', // 2 articles
    '2026-01-26', '2026-01-26', '2026-01-26', // 3 articles
    '2026-01-26', '2026-01-26', '2026-01-26', '2026-01-26', '2026-01-26' // remaining
  ];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const publishedAt = baseDates[i] || '2026-01-26';

    console.log(`Inserting: ${item.title.substring(0, 50)}...`);

    // Insert newsletter
    const nlResult = await client.query(
      `INSERT INTO newsletters (guid, title, original_url, published_at, raw_content, processed)
       VALUES ($1, $2, $3, $4, $5, true) RETURNING id`,
      [item.guid, item.title, item.link, publishedAt, item.content]
    );
    const newsletterId = nlResult.rows[0].id;

    // Insert segment
    await client.query(
      `INSERT INTO segments (type, title, original_content, topics, newsletter_id, order_in_newsletter)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [item.type, item.title, item.content, item.topics, newsletterId, item.order]
    );
  }

  console.log('Done! Inserted', items.length, 'articles');

  // Show counts
  const countResult = await client.query('SELECT COUNT(*) as count FROM segments');
  console.log('Total segments in DB:', countResult.rows[0].count);

  await client.end();
}

main().catch(console.error);
