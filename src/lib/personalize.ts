import Anthropic from '@anthropic-ai/sdk';
import { sql } from './db';

const anthropic = new Anthropic();

interface UserPreferences {
  role: string;
  industry: string;
  tone: string;
  depth: string;
  vibe: string;
}

export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  const result = await sql`
    SELECT role, industry, tone, depth, vibe
    FROM user_preferences
    WHERE user_id = ${userId}
  `;
  if (result.length === 0) return null;
  return result[0] as UserPreferences;
}

export async function getPersonalizedContent(
  userId: string,
  segmentId: string,
  originalContent: string,
  preferences: UserPreferences
): Promise<string> {
  // Check cache first
  const cached = await sql`
    SELECT rewritten_content FROM personalized_segments
    WHERE user_id = ${userId} AND segment_id = ${segmentId}
      AND generated_at > NOW() - INTERVAL '7 days'
  `;

  if (cached.length > 0) {
    return cached[0].rewritten_content;
  }

  // Generate personalized version with graceful fallback
  let rewritten = originalContent;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Rewrite this news segment for a specific reader. Keep all facts accurate - only change presentation style.

Reader profile:
- Role: ${preferences.role} in ${preferences.industry}
- Technical level: ${preferences.tone}
- Preferred depth: ${preferences.depth}
- Style: ${preferences.vibe}

Instructions by preference:
- If tone is "plain_english": avoid jargon, explain technical terms
- If tone is "deep_technical": use precise technical language
- If depth is "just_headlines": give 1-2 sentence summary only
- If depth is "full_analysis": expand with implications and context
- If vibe is "inject_some_humor": add wit where appropriate
- If vibe is "straight_to_business": be concise and formal

Original content (HTML):
${originalContent}

Return the rewritten content as HTML only, no explanation:`
      }]
    });

    rewritten = response.content[0].type === 'text' ? response.content[0].text : originalContent;
  } catch (error) {
    // Rate limit or API error - return original content
    console.error('Personalization failed, using original content:', error);
    return originalContent;
  }

  // Cache the result
  await sql`
    INSERT INTO personalized_segments (user_id, segment_id, rewritten_content)
    VALUES (${userId}, ${segmentId}, ${rewritten})
    ON CONFLICT (user_id, segment_id) DO UPDATE SET
      rewritten_content = ${rewritten},
      generated_at = NOW()
  `;

  return rewritten;
}
