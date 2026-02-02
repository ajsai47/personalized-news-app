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

function extractTopics(text) {
  const topics = [];
  const lower = text.toLowerCase();
  if (lower.includes('nvidia') || lower.includes('gpu') || lower.includes('chip')) topics.push('hardware');
  if (lower.includes('openai') || lower.includes('gpt') || lower.includes('chatgpt')) topics.push('llms');
  if (lower.includes('anthropic') || lower.includes('claude')) topics.push('llms');
  if (lower.includes('google') || lower.includes('gemini') || lower.includes('deepmind')) topics.push('llms');
  if (lower.includes('china') || lower.includes('regulation') || lower.includes('policy')) topics.push('regulation');
  if (lower.includes('startup') || lower.includes('funding') || lower.includes('raise') || lower.includes('valuation')) topics.push('startups');
  if (lower.includes('meta') || lower.includes('microsoft') || lower.includes('apple')) topics.push('big_tech');
  if (lower.includes('agent') || lower.includes('tool')) topics.push('tools');
  if (lower.includes('robot') || lower.includes('hardware')) topics.push('robotics');
  if (topics.length === 0) topics.push('general');
  return [...new Set(topics)];
}

function parseNewsletterContent(content, newsletterTitle) {
  const segments = [];

  // Remove HTML tags but preserve structure markers
  const cleanHtml = (html) => {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<\/h[1-6]>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#8212;/g, '—')
      .replace(/&#8217;/g, "'")
      .replace(/&#8220;/g, '"')
      .replace(/&#8221;/g, '"')
      .replace(/&#\d+;/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  // Determine segment type based on content and context
  const detectType = (title, text, isInToolsSection, isInQuickNews) => {
    const lower = (title + ' ' + text).toLowerCase();
    if (isInToolsSection || lower.includes('best for:') || title.match(/^(chatgpt|claude|grok|gemini|copilot|alexa)/i)) {
      return 'top_tools';
    }
    if (isInQuickNews || text.length < 200) {
      return 'quick_news';
    }
    // Main news - longer content with substantial detail
    if (text.length > 400 || lower.includes('news:') || lower.includes('details:')) {
      return 'main_news';
    }
    return 'quick_news';
  };

  // Split content into major sections first
  let inToolsSection = false;
  let inQuickNewsSection = false;

  // Find main story sections - they typically have h2/h3 with emoji prefixes
  const storyPattern = /<h[23][^>]*>([📖🤖🧠🔌⚡🚨🎬📱💰🇨🇳🇮🇳🐳🔒🚀🛠️][^<]*)<\/h[23]>/gi;
  let match;
  const storyPositions = [];

  while ((match = storyPattern.exec(content)) !== null) {
    storyPositions.push({
      index: match.index,
      title: cleanHtml(match[1]).trim(),
      fullMatch: match[0]
    });
  }

  // Extract each story with its content
  for (let i = 0; i < storyPositions.length; i++) {
    const story = storyPositions[i];
    const nextIndex = i < storyPositions.length - 1
      ? storyPositions[i + 1].index
      : content.length;

    const storyContent = content.substring(story.index, nextIndex);
    const cleanContent = cleanHtml(storyContent);

    // Skip if it's a section header
    if (story.title.match(/^(Tools|Quick News|Today's Top)/i)) continue;

    if (cleanContent.length > 150) {
      segments.push({
        title: story.title.replace(/^[📖🤖🧠🔌⚡🚨🎬📱💰🇨🇳🇮🇳🐳🔒🚀]\s*/, '').trim(),
        content: cleanContent,
        type: 'main_news',
        topics: extractTopics(story.title + ' ' + cleanContent)
      });
    }
  }

  // If no emoji-prefixed stories found, try plain h2/h3 headers
  if (segments.length === 0) {
    const headerPattern = /<h[23][^>]*>([^<]+)<\/h[23]>/gi;
    const headers = [];
    while ((match = headerPattern.exec(content)) !== null) {
      const title = cleanHtml(match[1]).trim();
      if (title.length > 15 && !title.match(/^(Details|News|Key|Quick|Tools|Today)/i)) {
        headers.push({ index: match.index, title, fullMatch: match[0] });
      }
    }

    for (let i = 0; i < headers.length && i < 6; i++) {
      const header = headers[i];
      const nextIndex = i < headers.length - 1 ? headers[i + 1].index : content.length;
      const sectionContent = content.substring(header.index, nextIndex);
      const cleanContent = cleanHtml(sectionContent);

      if (cleanContent.length > 200) {
        segments.push({
          title: header.title,
          content: cleanContent,
          type: 'main_news',
          topics: extractTopics(header.title + ' ' + cleanContent)
        });
      }
    }
  }

  // Extract Tools section
  const toolsSectionMatch = content.match(/(Today's Top Tools|🛠️ Today's Top Tools)[\s\S]*?(?=Quick News|<h[23]|$)/i);
  if (toolsSectionMatch) {
    const toolsList = toolsSectionMatch[0].match(/<li[^>]*>[\s\S]*?<\/li>/gi) || [];
    for (const tool of toolsList.slice(0, 5)) {
      const cleanTool = cleanHtml(tool);
      // Look for tool name pattern: "ToolName - description" or "ToolName: description"
      const nameMatch = cleanTool.match(/^([A-Za-z][A-Za-z0-9\s\.]+?)[\s]*[-–:]/);
      if (nameMatch && cleanTool.length > 30) {
        segments.push({
          title: nameMatch[1].trim(),
          content: cleanTool,
          type: 'top_tools',
          topics: ['tools', ...extractTopics(cleanTool)]
        });
      }
    }
  }

  // Extract Quick News section
  const quickNewsSectionMatch = content.match(/Quick News[\s\S]*?(?=<\/div>|<h[23]|$)/i);
  if (quickNewsSectionMatch) {
    const quickList = quickNewsSectionMatch[0].match(/<li[^>]*>[\s\S]*?<\/li>/gi) || [];
    for (const item of quickList.slice(0, 5)) {
      const cleanItem = cleanHtml(item);
      if (cleanItem.length > 40) {
        // Get first sentence or first 80 chars for title
        const titleMatch = cleanItem.match(/^([^.!?]+[.!?])/);
        const title = titleMatch
          ? titleMatch[1].substring(0, 100)
          : cleanItem.substring(0, 80) + '...';

        segments.push({
          title: title.trim(),
          content: cleanItem,
          type: 'quick_news',
          topics: extractTopics(cleanItem)
        });
      }
    }
  }

  return segments;
}

function parseItems(xml) {
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
  const allSegments = [];

  items.slice(0, 15).forEach((item, newsletterIndex) => {
    const title = item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1]?.trim() || '';
    const contentEncoded = item.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/)?.[1]?.trim() || '';
    const link = item.match(/<link>(.*?)<\/link>/)?.[1] || '';
    const guid = item.match(/<guid[^>]*>(.*?)<\/guid>/)?.[1] || link;
    const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';

    if (!contentEncoded) return;

    // Parse the newsletter content into individual segments
    const segments = parseNewsletterContent(contentEncoded, title);

    // If parsing didn't yield good results, create one segment from the whole newsletter
    if (segments.length === 0) {
      segments.push({
        title: title,
        content: contentEncoded,
        type: 'main_news',
        topics: extractTopics(title)
      });
    }

    segments.forEach((seg, segIndex) => {
      allSegments.push({
        ...seg,
        newsletterGuid: guid,
        newsletterTitle: title,
        newsletterLink: link,
        newsletterPubDate: pubDate,
        newsletterIndex,
        segmentIndex: segIndex
      });
    });
  });

  return allSegments;
}

async function main() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();

  // Clear existing data
  console.log('Clearing existing data...');
  await client.query('TRUNCATE newsletters CASCADE');

  console.log('Fetching RSS feed...');
  const xml = await fetchRSS();
  const segments = parseItems(xml);
  console.log(`Parsed ${segments.length} segments from newsletters`);

  // Group by newsletter
  const newsletterMap = new Map();
  for (const seg of segments) {
    if (!newsletterMap.has(seg.newsletterGuid)) {
      newsletterMap.set(seg.newsletterGuid, {
        guid: seg.newsletterGuid,
        title: seg.newsletterTitle,
        link: seg.newsletterLink,
        pubDate: seg.newsletterPubDate,
        segments: []
      });
    }
    newsletterMap.get(seg.newsletterGuid).segments.push(seg);
  }

  // Date mapping for 7-day window (Jan 26 - Feb 1, 2026)
  const baseDates = [
    '2026-01-31', '2026-01-31',
    '2026-01-30', '2026-01-30',
    '2026-01-29', '2026-01-29', '2026-01-29',
    '2026-01-28', '2026-01-28',
    '2026-01-27', '2026-01-27',
    '2026-01-26', '2026-01-26', '2026-01-26', '2026-01-26'
  ];

  let nlIndex = 0;
  for (const [guid, newsletter] of newsletterMap) {
    const publishedAt = baseDates[nlIndex] || '2026-01-26';
    nlIndex++;

    console.log(`\nNewsletter: ${newsletter.title.substring(0, 50)}...`);
    console.log(`  → ${newsletter.segments.length} segments`);

    // Insert newsletter
    const nlResult = await client.query(
      `INSERT INTO newsletters (guid, title, original_url, published_at, raw_content, processed)
       VALUES ($1, $2, $3, $4, $5, true) RETURNING id`,
      [guid, newsletter.title, newsletter.link, publishedAt, '']
    );
    const newsletterId = nlResult.rows[0].id;

    // Insert segments
    for (let i = 0; i < newsletter.segments.length; i++) {
      const seg = newsletter.segments[i];
      console.log(`    - [${seg.type}] ${seg.title.substring(0, 50)}...`);

      await client.query(
        `INSERT INTO segments (type, title, original_content, topics, newsletter_id, order_in_newsletter)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [seg.type, seg.title, seg.content, seg.topics, newsletterId, i]
      );
    }
  }

  // Show counts
  const nlCount = await client.query('SELECT COUNT(*) FROM newsletters');
  const segCount = await client.query('SELECT COUNT(*) FROM segments');
  const typeCount = await client.query('SELECT type, COUNT(*) as count FROM segments GROUP BY type');

  console.log('\n=== Import Complete ===');
  console.log(`Newsletters: ${nlCount.rows[0].count}`);
  console.log(`Total Segments: ${segCount.rows[0].count}`);
  console.log('By type:');
  typeCount.rows.forEach(r => console.log(`  - ${r.type}: ${r.count}`));

  await client.end();
}

main().catch(console.error);
