import { sql } from './db';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

interface ParsedSegment {
  type: 'main_news' | 'top_tools' | 'quick_news';
  title: string;
  content: string;
  topics: string[];
}

export async function parseNewsletterSegments(newsletterId: string, htmlContent: string): Promise<void> {
  const response = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Parse this newsletter HTML into structured segments. Return JSON array only.

Each segment should have:
- type: "main_news" | "top_tools" | "quick_news"
- title: headline for this segment
- content: the full content/details (keep HTML formatting)
- topics: relevant topic tags from [llms, agents, tools, robotics, policy, business, research, startups, products, regulation]

Newsletter HTML:
${htmlContent}

Return valid JSON array of segments only, no explanation:`
    }]
  });

  const jsonText = response.content[0].type === 'text' ? response.content[0].text : '';

  const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.error('Failed to parse segments from Claude response');
    return;
  }

  const segments: ParsedSegment[] = JSON.parse(jsonMatch[0]);

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    await sql`
      INSERT INTO segments (newsletter_id, type, title, original_content, topics, order_in_newsletter)
      VALUES (${newsletterId}, ${seg.type}, ${seg.title}, ${seg.content}, ${seg.topics}, ${i})
    `;
  }

  await sql`
    UPDATE newsletters SET processed = TRUE WHERE id = ${newsletterId}
  `;
}
