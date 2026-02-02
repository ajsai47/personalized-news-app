import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';
import * as crypto from 'crypto';

const sql = neon(process.env.DATABASE_URL!);

// Topic keywords for classification
const TOPIC_KEYWORDS: Record<string, string[]> = {
  hardware: ['chip', 'gpu', 'nvidia', 'amd', 'intel', 'tpu', 'semiconductor', 'processor', 'hardware', 'compute'],
  llms: ['llm', 'gpt', 'claude', 'gemini', 'language model', 'chatgpt', 'openai', 'anthropic', 'mistral', 'llama'],
  regulation: ['regulation', 'law', 'policy', 'government', 'congress', 'eu', 'gdpr', 'safety', 'compliance'],
  startups: ['startup', 'funding', 'raised', 'seed', 'series', 'venture', 'vc', 'valuation', 'founder'],
  big_tech: ['google', 'microsoft', 'apple', 'amazon', 'meta', 'facebook', 'alphabet', 'big tech'],
  tools: ['tool', 'api', 'sdk', 'framework', 'library', 'platform', 'developer', 'coding', 'cursor', 'copilot'],
  robotics: ['robot', 'robotics', 'autonomous', 'self-driving', 'drone', 'boston dynamics', 'humanoid'],
  general: []
};

// Company patterns for extraction
const COMPANY_PATTERNS = [
  'OpenAI', 'Anthropic', 'Google', 'Microsoft', 'Meta', 'Apple', 'Amazon', 'NVIDIA',
  'AMD', 'Intel', 'Tesla', 'xAI', 'Mistral', 'Cohere', 'Stability AI', 'Midjourney',
  'Hugging Face', 'DeepMind', 'Scale AI', 'Databricks', 'Snowflake', 'Cursor',
  'Perplexity', 'Character AI', 'Inflection', 'Adept', 'Runway', 'Pika'
];

function extractTopics(content: string): string[] {
  const lowerContent = content.toLowerCase();
  const topics: string[] = [];

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (topic === 'general') continue;
    if (keywords.some(kw => lowerContent.includes(kw))) {
      topics.push(topic);
    }
  }

  if (topics.length === 0) {
    topics.push('general');
  }

  return topics;
}

function extractCompanies(content: string): string[] {
  const companies: string[] = [];
  for (const company of COMPANY_PATTERNS) {
    if (content.includes(company)) {
      companies.push(company);
    }
  }
  return companies;
}

function parseStructuredContent(html: string): { news: string | null; details: string | null; whyItMatters: string | null } {
  const $ = cheerio.load(html);
  const text = $('body').text();

  // Try to find News/Details/Why It Matters sections
  const newsPatterns = [/\b(the\s+)?news\s*:/i, /^news\b/im];
  const detailsPatterns = [/\b(the\s+)?details\s*:/i, /^details\b/im];
  const whyPatterns = [/\bwhy\s+(it\s+)?matters\s*:/i, /^why\s+(it\s+)?matters\b/im];

  let news: string | null = null;
  let details: string | null = null;
  let whyItMatters: string | null = null;

  // Find section boundaries
  let newsStart = -1, detailsStart = -1, whyStart = -1;

  for (const pattern of newsPatterns) {
    const match = text.match(pattern);
    if (match && match.index !== undefined) {
      newsStart = match.index + match[0].length;
      break;
    }
  }

  for (const pattern of detailsPatterns) {
    const match = text.match(pattern);
    if (match && match.index !== undefined) {
      detailsStart = match.index + match[0].length;
      break;
    }
  }

  for (const pattern of whyPatterns) {
    const match = text.match(pattern);
    if (match && match.index !== undefined) {
      whyStart = match.index + match[0].length;
      break;
    }
  }

  // Extract sections based on boundaries
  if (newsStart >= 0) {
    const endPos = Math.min(
      detailsStart >= 0 ? detailsStart - 20 : text.length,
      whyStart >= 0 ? whyStart - 20 : text.length
    );
    news = text.slice(newsStart, endPos).trim().slice(0, 1000);
  }

  if (detailsStart >= 0) {
    const endPos = whyStart >= 0 ? whyStart - 20 : text.length;
    details = text.slice(detailsStart, endPos).trim().slice(0, 2000);
  }

  if (whyStart >= 0) {
    whyItMatters = text.slice(whyStart, whyStart + 1000).trim();
  }

  return { news, details, whyItMatters };
}

async function parseHtmlFile(filePath: string): Promise<{
  title: string;
  content: string;
  publishedAt: Date;
  topics: string[];
  companies: string[];
  structuredContent: { news: string | null; details: string | null; whyItMatters: string | null };
} | null> {
  try {
    const html = fs.readFileSync(filePath, 'utf-8');
    const $ = cheerio.load(html);

    // Extract title
    const title = $('title').text().trim() || $('h1').first().text().trim();
    if (!title) return null;

    // Extract date from "Created on" or filename
    let publishedAt: Date;
    const createdText = $('.created').text();
    const dateMatch = createdText.match(/(\d{4}-\d{2}-\d{2})/);

    if (dateMatch) {
      publishedAt = new Date(dateMatch[1]);
    } else {
      // Try to extract from filename
      const filenameMatch = path.basename(filePath).match(/^(\d{4}-\d{2}-\d{2})/);
      if (filenameMatch) {
        publishedAt = new Date(filenameMatch[1]);
      } else {
        // Default to file modification time
        const stats = fs.statSync(filePath);
        publishedAt = stats.mtime;
      }
    }

    // Extract content (remove style and script tags)
    $('style, script').remove();
    const content = $('body').text().trim();

    // Extract topics and companies
    const topics = extractTopics(content + ' ' + title);
    const companies = extractCompanies(content + ' ' + title);

    // Parse structured content
    const structuredContent = parseStructuredContent(html);

    return { title, content, publishedAt, topics, companies, structuredContent };
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    return null;
  }
}

async function importNewsletters(articlesDir: string) {
  const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.html'));
  console.log(`Found ${files.length} HTML files to import`);

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    const filePath = path.join(articlesDir, file);
    const parsed = await parseHtmlFile(filePath);

    if (!parsed) {
      skipped++;
      continue;
    }

    try {
      // Check if newsletter already exists
      const existing = await sql`
        SELECT id FROM newsletters WHERE title = ${parsed.title} LIMIT 1
      `;

      if (existing.length > 0) {
        console.log(`Skipping duplicate: ${parsed.title.slice(0, 50)}...`);
        skipped++;
        continue;
      }

      // Generate a unique guid from title
      const guid = `linkedin-${crypto.createHash('md5').update(parsed.title).digest('hex')}`;

      // Insert newsletter
      const newsletterResult = await sql`
        INSERT INTO newsletters (title, published_at, raw_content, guid)
        VALUES (${parsed.title}, ${parsed.publishedAt.toISOString()}, ${parsed.content}, ${guid})
        RETURNING id
      `;

      const newsletterId = newsletterResult[0].id;

      // Insert segment
      await sql`
        INSERT INTO segments (newsletter_id, title, type, original_content, topics, companies, structured_content)
        VALUES (
          ${newsletterId},
          ${parsed.title},
          'main_news',
          ${parsed.content.slice(0, 10000)},
          ${parsed.topics},
          ${parsed.companies},
          ${JSON.stringify(parsed.structuredContent)}
        )
      `;

      imported++;
      if (imported % 50 === 0) {
        console.log(`Imported ${imported} newsletters...`);
      }
    } catch (error) {
      console.error(`Error importing ${file}:`, error);
      errors++;
    }
  }

  console.log(`\nImport complete!`);
  console.log(`  Imported: ${imported}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Errors: ${errors}`);
}

// Run import
const articlesDir = process.argv[2] || path.join(process.env.HOME!, 'linkedin-export/Articles/Articles');
importNewsletters(articlesDir);
