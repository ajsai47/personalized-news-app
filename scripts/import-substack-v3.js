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

function decodeHtmlEntities(text) {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(parseInt(code)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
}

function cleanHtml(html, preserveLinks = false) {
  let result = decodeHtmlEntities(html)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n');

  if (preserveLinks) {
    // Keep <a> tags but remove other HTML
    result = result.replace(/<(?!\/?a\b)[^>]+>/gi, '');
  } else {
    result = result.replace(/<[^>]+>/g, '');
  }

  return result.replace(/\n{3,}/g, '\n\n').trim();
}

// Extract companies mentioned in text
function extractCompanies(text) {
  const companies = [];
  const lower = text.toLowerCase();

  // Major AI companies
  if (lower.includes('openai') || lower.includes('open ai')) companies.push('OpenAI');
  if (lower.includes('anthropic')) companies.push('Anthropic');
  if (lower.includes('google') || lower.includes('deepmind') || lower.includes('gemini')) companies.push('Google');
  if (lower.includes('microsoft') || lower.includes('copilot')) companies.push('Microsoft');
  if (lower.includes('meta') || lower.includes('llama')) companies.push('Meta');
  if (lower.includes('nvidia') || lower.includes('jensen')) companies.push('Nvidia');
  if (lower.includes('apple')) companies.push('Apple');
  if (lower.includes('amazon') || lower.includes('aws') || lower.includes('alexa')) companies.push('Amazon');

  // Chinese companies
  if (lower.includes('bytedance') || lower.includes('tiktok')) companies.push('ByteDance');
  if (lower.includes('alibaba') || lower.includes('qwen')) companies.push('Alibaba');
  if (lower.includes('tencent')) companies.push('Tencent');
  if (lower.includes('baidu')) companies.push('Baidu');
  if (lower.includes('moonshot') || lower.includes('kimi')) companies.push('Moonshot AI');

  // AI startups
  if (lower.includes('mistral')) companies.push('Mistral');
  if (lower.includes('cohere')) companies.push('Cohere');
  if (lower.includes('stability') || lower.includes('stable diffusion')) companies.push('Stability AI');
  if (lower.includes('midjourney')) companies.push('Midjourney');
  if (lower.includes('xai') || lower.includes('grok')) companies.push('xAI');
  if (lower.includes('perplexity')) companies.push('Perplexity');
  if (lower.includes('runway')) companies.push('Runway');
  if (lower.includes('character.ai') || lower.includes('character ai')) companies.push('Character.AI');
  if (lower.includes('inflection')) companies.push('Inflection');
  if (lower.includes('coreweave')) companies.push('CoreWeave');
  if (lower.includes('synthesia')) companies.push('Synthesia');

  return [...new Set(companies)];
}

// Parse structured content by looking for News/Details/Why It Matters headers
function parseStructuredContent(html) {
  // Header patterns (case-insensitive)
  const newsPatterns = [/\b(the\s+)?news\s*:/i, /^news\b/im];
  const detailsPatterns = [/\b(the\s+)?details\s*:/i, /^details\b/im];
  const whyPatterns = [/\bwhy\s+(it\s+)?matters\s*:/i, /^why\s+(it\s+)?matters\b/im];

  const text = cleanHtml(html, true); // preserve links

  // Find positions of each section
  let newsStart = -1, detailsStart = -1, whyStart = -1;
  let newsHeaderEnd = 0, detailsHeaderEnd = 0, whyHeaderEnd = 0;

  for (const pattern of newsPatterns) {
    const match = text.match(pattern);
    if (match) {
      newsStart = text.indexOf(match[0]);
      newsHeaderEnd = newsStart + match[0].length;
      break;
    }
  }

  for (const pattern of detailsPatterns) {
    const match = text.match(pattern);
    if (match) {
      detailsStart = text.indexOf(match[0]);
      detailsHeaderEnd = detailsStart + match[0].length;
      break;
    }
  }

  for (const pattern of whyPatterns) {
    const match = text.match(pattern);
    if (match) {
      whyStart = text.indexOf(match[0]);
      whyHeaderEnd = whyStart + match[0].length;
      break;
    }
  }

  // If we don't have at least News and one other section, return null
  if (newsStart === -1 || (detailsStart === -1 && whyStart === -1)) {
    return null;
  }

  // Extract content between sections
  let news = '', details = '', whyItMatters = '';

  // Sort positions to determine order
  const sections = [
    { name: 'news', start: newsStart, headerEnd: newsHeaderEnd },
    { name: 'details', start: detailsStart, headerEnd: detailsHeaderEnd },
    { name: 'why', start: whyStart, headerEnd: whyHeaderEnd }
  ].filter(s => s.start !== -1).sort((a, b) => a.start - b.start);

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const nextStart = i < sections.length - 1 ? sections[i + 1].start : text.length;
    const content = text.substring(section.headerEnd, nextStart).trim();

    if (section.name === 'news') news = content;
    else if (section.name === 'details') details = content;
    else if (section.name === 'why') whyItMatters = content;
  }

  // Only return if we have meaningful content
  if (news.length < 10) return null;

  return {
    news: news || null,
    details: details || null,
    whyItMatters: whyItMatters || null
  };
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
  if (lower.includes('robot')) topics.push('robotics');
  if (topics.length === 0) topics.push('general');
  return [...new Set(topics)];
}

function parseNewsletterContent(content) {
  const segments = [];

  // Find all h2/h3 headers
  const headerRegex = /<h[23][^>]*>([\s\S]*?)<\/h[23]>/gi;
  const headers = [];
  let match;

  while ((match = headerRegex.exec(content)) !== null) {
    const rawTitle = match[1];
    const cleanTitle = cleanHtml(rawTitle);

    // Skip greeting/intro headers and section headers
    if (cleanTitle.toLowerCase().includes('good morning') ||
        cleanTitle.toLowerCase().includes('good afternoon') ||
        cleanTitle.toLowerCase().includes('good evening')) continue;

    headers.push({
      index: match.index,
      rawTitle,
      title: cleanTitle,
      fullMatch: match[0]
    });
  }

  // Process each header section
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i];
    const isToolsSection = header.title.toLowerCase().includes("today's top tools") ||
                           header.title.toLowerCase().includes("top tools");
    const isQuickNews = header.title.toLowerCase().includes("quick news");

    // Find content until next header
    const nextIndex = i < headers.length - 1 ? headers[i + 1].index : content.length;
    const sectionContent = content.substring(header.index + header.fullMatch.length, nextIndex);

    if (isToolsSection) {
      // Parse tools as list items
      const toolItems = sectionContent.match(/<li[^>]*>[\s\S]*?<\/li>/gi) || [];
      for (const item of toolItems.slice(0, 5)) {
        const cleanItem = cleanHtml(item, true); // preserve links
        const plainText = cleanHtml(item, false);
        const nameMatch = plainText.match(/^([A-Za-z][A-Za-z0-9\s\.\-]+?)[\s]*[-–:—]/);
        if (nameMatch && plainText.length > 20) {
          segments.push({
            title: nameMatch[1].trim(),
            content: cleanItem,
            type: 'top_tools',
            topics: ['tools'],
            companies: extractCompanies(plainText)
          });
        }
      }
    } else if (isQuickNews) {
      // Parse quick news as list items
      const newsItems = sectionContent.match(/<li[^>]*>[\s\S]*?<\/li>/gi) || [];
      for (const item of newsItems.slice(0, 5)) {
        const cleanItem = cleanHtml(item, true); // preserve links
        const plainText = cleanHtml(item, false);
        if (plainText.length > 30) {
          const titleMatch = plainText.match(/^([^.!?]+[.!?])/);
          const title = titleMatch ? titleMatch[1].substring(0, 100) : plainText.substring(0, 80) + '...';
          segments.push({
            title: title.trim(),
            content: cleanItem,
            type: 'quick_news',
            topics: extractTopics(plainText),
            companies: extractCompanies(plainText)
          });
        }
      }
    } else {
      // Regular news story
      const cleanContent = cleanHtml(sectionContent, true); // preserve links
      const plainText = cleanHtml(sectionContent, false);
      // Strip emoji from title
      const cleanTitle = header.title.replace(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]\s*/u, '').trim();

      if (plainText.length > 100 && cleanTitle.length > 5) {
        // Try to parse structured content (News/Details/Why It Matters)
        const structured = parseStructuredContent(sectionContent);

        segments.push({
          title: cleanTitle,
          content: cleanContent,
          type: 'main_news',
          topics: extractTopics(cleanTitle + ' ' + plainText),
          companies: extractCompanies(cleanTitle + ' ' + plainText),
          structuredContent: structured
        });
      }
    }
  }

  return segments;
}

async function main() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();

  console.log('Clearing existing data...');
  await client.query('TRUNCATE newsletters CASCADE');

  console.log('Fetching RSS feed...');
  const xml = await fetchRSS();

  // Parse RSS items
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
  console.log(`Found ${items.length} newsletters`);

  // Date mapping for 7-day window (Jan 26 - Feb 1, 2026)
  const baseDates = [
    '2026-01-31', '2026-01-31',
    '2026-01-30', '2026-01-30',
    '2026-01-29', '2026-01-29', '2026-01-29',
    '2026-01-28', '2026-01-28',
    '2026-01-27', '2026-01-27',
    '2026-01-26', '2026-01-26', '2026-01-26', '2026-01-26'
  ];

  let totalSegments = 0;
  const typeCounts = { main_news: 0, top_tools: 0, quick_news: 0 };

  for (let nlIndex = 0; nlIndex < Math.min(items.length, 15); nlIndex++) {
    const item = items[nlIndex];
    const title = item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1]?.trim() || '';
    const contentEncoded = item.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/)?.[1] || '';
    const link = item.match(/<link>(.*?)<\/link>/)?.[1] || '';
    const guid = item.match(/<guid[^>]*>(.*?)<\/guid>/)?.[1] || link;
    const publishedAt = baseDates[nlIndex] || '2026-01-26';

    if (!contentEncoded) continue;

    // Parse newsletter into segments
    const segments = parseNewsletterContent(contentEncoded);

    console.log(`\n${nlIndex + 1}. ${title.substring(0, 50)}...`);
    console.log(`   → ${segments.length} segments`);

    // Insert newsletter
    const nlResult = await client.query(
      `INSERT INTO newsletters (guid, title, original_url, published_at, raw_content, processed)
       VALUES ($1, $2, $3, $4, $5, true) RETURNING id`,
      [guid, title, link, publishedAt, '']
    );
    const newsletterId = nlResult.rows[0].id;

    // Insert segments
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const companies = seg.companies || [];
      const hasStructured = seg.structuredContent ? '✓' : '✗';
      console.log(`     [${seg.type}] ${seg.title.substring(0, 50)}... (structured: ${hasStructured})`);

      await client.query(
        `INSERT INTO segments (type, title, original_content, topics, companies, newsletter_id, order_in_newsletter, structured_content)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [seg.type, seg.title, seg.content, seg.topics, companies, newsletterId, i, seg.structuredContent ? JSON.stringify(seg.structuredContent) : null]
      );

      totalSegments++;
      typeCounts[seg.type]++;
    }
  }

  console.log('\n=== Import Complete ===');
  console.log(`Total Segments: ${totalSegments}`);
  console.log('By type:');
  Object.entries(typeCounts).forEach(([type, count]) => {
    if (count > 0) console.log(`  - ${type}: ${count}`);
  });

  await client.end();
}

main().catch(console.error);
