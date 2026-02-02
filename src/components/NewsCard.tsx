"use client"

import { useState, useMemo } from "react"

interface Segment {
  id: string
  type: string
  title: string
  originalContent: string
  personalizedContent?: string
  topics: string[]
  companies: string[]
  publishedAt?: string
}

// Extract digestible chunks (2 sentences each) with embedded links
function parseContent(html: string): {
  summary: string;
  chunks: { text: string; html: string }[];
  links: { text: string; url: string }[]
} {
  // Extract all links for the sources section (filter out image/empty links)
  const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>([^<]*)<\/a>/gi
  const links: { text: string; url: string }[] = []
  let match
  while ((match = linkRegex.exec(html)) !== null) {
    const url = match[1]
    const text = match[2]?.trim()
    // Skip empty links, image links, mailto links, and substack CDN links
    if (text && text.length > 2 &&
        !url.includes('mailto:') &&
        !url.includes('substackcdn.com') &&
        !url.includes('/image/') &&
        !text.includes('image') &&
        !url.includes('data-component')) {
      links.push({ text, url })
    }
  }

  // Convert HTML to text while preserving links as markdown-style markers
  let processedHtml = html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, '. ')
    .replace(/<\/li>/gi, '. ')
    .replace(/<\/h[1-6]>/gi, '. ')

  // Keep text links as special markers (skip image/CDN links)
  processedHtml = processedHtml.replace(
    /<a[^>]+href="([^"]+)"[^>]*>([^<]*)<\/a>/gi,
    (match, url, text) => {
      // Skip empty, image, or CDN links
      if (!text?.trim() || text.trim().length < 3 ||
          url.includes('substackcdn.com') ||
          url.includes('/image/')) {
        return text || ''
      }
      return `[[LINK:${url}|${text.trim()}]]`
    }
  )

  // Remove remaining HTML tags
  let textOnly = processedHtml
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#8212;/g, '—')
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#\d+;/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  // Split into sentences (handle common abbreviations)
  const sentenceEnders = /(?<=[.!?])\s+(?=[A-Z\[])/g
  const sentences = textOnly
    .split(sentenceEnders)
    .map(s => s.trim())
    .filter(s => s.length > 10)

  // Group into chunks of 2 sentences
  const chunks: { text: string; html: string }[] = []
  for (let i = 0; i < sentences.length; i += 2) {
    const chunkText = sentences.slice(i, i + 2).join(' ')
    if (chunkText.length < 20) continue

    // Convert link markers back to HTML
    const chunkHtml = chunkText.replace(
      /\[\[LINK:([^|]+)\|([^\]]+)\]\]/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$2</a>'
    )

    // Plain text version (no links)
    const plainText = chunkText.replace(/\[\[LINK:[^|]+\|([^\]]+)\]\]/g, '$1')

    chunks.push({ text: plainText, html: chunkHtml })
  }

  // Summary is first chunk's plain text, truncated
  const summary = chunks[0]?.text.substring(0, 250) || textOnly.substring(0, 250)

  return { summary, chunks: chunks.slice(0, 8), links: links.slice(0, 6) }
}

// Calculate reading time based on word count
function getReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  const wordCount = text.split(' ').length
  return Math.max(1, Math.ceil(wordCount / 200))
}

// Relevance scoring based on content indicators
export function getRelevance(segment: Segment): 'high' | 'medium' | 'low' {
  const title = segment.title.toLowerCase()
  const highKeywords = ['breaking', 'major', 'raises', 'billion', 'launch', 'announces', 'new', 'first', 'opens', 'releases']
  const lowKeywords = ['leaves', 'joins', 'update', 'minor']

  if (highKeywords.some(k => title.includes(k))) return 'high'
  if (segment.type === 'quick_news' || lowKeywords.some(k => title.includes(k))) return 'low'
  return 'medium'
}

// Format date in Renaissance style
function formatEntryDate(dateStr?: string): string {
  if (!dateStr) {
    const now = new Date()
    return formatRenaissanceDate(now)
  }
  const date = new Date(dateStr)
  return formatRenaissanceDate(date)
}

function formatRenaissanceDate(date: Date): string {
  const day = date.getDate()
  const month = date.toLocaleDateString('en-US', { month: 'long' })
  const year = date.getFullYear()
  const ordinal = getOrdinal(day)
  return `${month} ${day}${ordinal}, ${year}`
}

function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}

const relevanceLabels = {
  high: { text: 'Of great import!', icon: '✦' },
  medium: { text: 'A curiosity', icon: '◆' },
  low: { text: 'In brief', icon: '•' }
}

const typeLabels = {
  main_news: 'Chronicle',
  top_tools: 'Invention',
  quick_news: 'Dispatch'
}

export function NewsCard({ segment, index }: { segment: Segment; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const content = segment.personalizedContent || segment.originalContent
  const relevance = getRelevance(segment)
  const relConfig = relevanceLabels[relevance]
  const parsed = useMemo(() => parseContent(content), [content])
  const readingTime = useMemo(() => getReadingTime(content), [content])
  const entryDate = formatEntryDate(segment.publishedAt)
  const typeLabel = typeLabels[segment.type as keyof typeof typeLabels] || 'Entry'

  // Importance class for left border
  const importanceClass = relevance === 'high' ? 'importance-high' : relevance === 'medium' ? 'importance-medium' : 'importance-low'

  return (
    <article
      className={`journal-entry relative rounded-sm mb-6 pl-10 pr-6 py-5 margin-line ink-fade-in ${importanceClass}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Date - Typewriter style */}
      <div className="font-typewriter text-xs mb-3" style={{ color: 'var(--ink-faded)' }}>
        {entryDate}
      </div>

      {/* Title with hand-drawn underline */}
      <h2
        className="font-handwritten text-2xl md:text-3xl mb-3 cursor-pointer ink-underline inline-block"
        style={{ color: 'var(--ink)' }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {segment.title}
      </h2>

      {/* Type and Relevance badges */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="font-typewriter text-xs px-2 py-1 border border-[var(--ink-faded)]" style={{ color: 'var(--ink-light)' }}>
          {typeLabel.toUpperCase()}
        </span>

        {/* Marginalia - relevance annotation */}
        <div className="marginalia text-xs">
          <span className="mr-1">{relConfig.icon}</span>
          {relConfig.text}
        </div>

        {segment.personalizedContent && (
          <span className="font-annotation text-xs" style={{ color: 'var(--iron-gall)' }}>
            ✧ Inscribed for thee
          </span>
        )}
      </div>

      {/* Summary */}
      <p className="font-serif text-base leading-relaxed mb-4" style={{ color: 'var(--ink-light)' }}>
        {parsed.summary}{!isExpanded && parsed.summary.length >= 250 ? '...' : ''}
      </p>

      {/* Tags as scattered paper scraps */}
      <div className="flex flex-wrap gap-2 mb-4">
        {segment.topics.slice(0, 5).map((topic, i) => (
          <span
            key={topic}
            className="tag-scrap"
            style={{ transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)` }}
          >
            {topic}
          </span>
        ))}
      </div>

      {/* Collapsed state info */}
      {!isExpanded && (
        <div className="flex items-center gap-4 pt-3 border-t border-[var(--ink-faded)]/20">
          <span className="font-typewriter text-xs" style={{ color: 'var(--ink-faded)' }}>
            ~{readingTime} min read
          </span>
          {parsed.chunks.length > 0 && (
            <span className="font-serif text-xs" style={{ color: 'var(--ink-faded)' }}>
              {parsed.chunks.length} key points
            </span>
          )}
          {parsed.links.length > 0 && (
            <span className="font-serif text-xs" style={{ color: 'var(--ink-faded)' }}>
              {parsed.links.length} sources
            </span>
          )}
          <button
            onClick={() => setIsExpanded(true)}
            className="ml-auto font-serif italic text-sm ink-link"
          >
            Unfold this entry...
          </button>
        </div>
      )}

      {/* Expanded Content */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {/* Why This Matters - Boxed insight */}
        <div className="sketched-box p-4 my-5" style={{ background: 'var(--parchment-light)' }}>
          <p className="font-annotation text-sm italic mb-1" style={{ color: 'var(--sepia)' }}>
            Why this matters:
          </p>
          <p className="font-serif text-sm" style={{ color: 'var(--ink-light)' }}>
            {segment.type === 'main_news' && relevance === 'high' && (
              <>A development of considerable magnitude in the realm of artificial minds, worthy of close study.</>
            )}
            {segment.type === 'main_news' && relevance === 'medium' && (
              <>An observation that illuminates the ongoing evolution of machine intelligence.</>
            )}
            {segment.type === 'main_news' && relevance === 'low' && (
              <>A small note to add to our growing chronicle of artificial progress.</>
            )}
            {segment.type === 'top_tools' && (
              <>A new instrument has emerged. Early adoption may yield considerable advantage.</>
            )}
            {segment.type === 'quick_news' && (
              <>A swift dispatch to keep thee informed of movements in the field.</>
            )}
          </p>
        </div>

        {/* Key Points - 2-sentence chunks with embedded links */}
        {parsed.chunks.length > 0 && (
          <div className="mb-5">
            <h3 className="font-handwritten text-lg mb-3 ink-underline inline-block" style={{ color: 'var(--ink)' }}>
              At a Glance
            </h3>
            <ul className="space-y-3">
              {parsed.chunks.map((chunk, i) => (
                <li key={i} className="font-serif text-base flex items-start gap-3" style={{ color: 'var(--ink-light)' }}>
                  <span className="flex-shrink-0 mt-1" style={{ color: 'var(--vermillion)' }}>•</span>
                  <span
                    className="leading-relaxed
                      [&_a]:text-[var(--ink)] [&_a]:underline [&_a]:underline-offset-2
                      hover:[&_a]:text-[var(--iron-gall)]
                      [&_a]:transition-colors"
                    dangerouslySetInnerHTML={{ __html: chunk.html }}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sources - Consolidated links */}
        {parsed.links.length > 0 && (
          <div className="mb-5 p-4 border-l-2 border-[var(--ink-faded)]" style={{ background: 'var(--parchment-dark)' }}>
            <h3 className="font-annotation text-sm mb-3" style={{ color: 'var(--ink-faded)' }}>
              Sources
            </h3>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {parsed.links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-serif text-sm underline underline-offset-2 hover:text-[var(--iron-gall)] transition-colors"
                  style={{ color: 'var(--ink)' }}
                >
                  {link.text.length > 40 ? link.text.substring(0, 40) + '...' : link.text}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Fold button */}
        <div className="flex justify-center pt-6 mt-4">
          <button
            onClick={() => setIsExpanded(false)}
            className="font-serif italic text-sm ink-link flex items-center gap-2"
          >
            <span>↑</span>
            Fold this entry
          </button>
        </div>
      </div>

      {/* Hand-drawn divider at bottom */}
      <div className="hand-drawn-divider mt-4" />
    </article>
  )
}

export function SectionHeader({ title, icon, count }: { title: string; icon?: React.ReactNode; count?: number }) {
  return (
    <div className="flex items-center justify-between mb-6 mt-10 first:mt-0">
      <div className="flex items-center gap-3">
        {icon && <span className="text-xl opacity-60">{icon}</span>}
        <h2 className="font-handwritten text-2xl ink-underline" style={{ color: 'var(--ink)' }}>
          {title}
        </h2>
      </div>
      {count !== undefined && (
        <span className="font-typewriter text-xs" style={{ color: 'var(--ink-faded)' }}>
          {count} {count === 1 ? 'entry' : 'entries'}
        </span>
      )}
    </div>
  )
}
