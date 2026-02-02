"use client"

import { useState } from "react"

interface StructuredContent {
  news: string | null
  details: string | null
  whyItMatters: string | null
}

interface Segment {
  id: string
  type: string
  title: string
  originalContent: string
  personalizedContent?: string
  structuredContent?: StructuredContent | null
  topics: string[]
  companies: string[]
  publishedAt?: string
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

// Clean HTML content for display
function cleanForDisplay(text: string | null): string {
  if (!text) return ''
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// Preserve links in HTML content
function formatWithLinks(text: string | null): string {
  if (!text) return ''
  // Keep anchor tags, remove other HTML
  return text
    .replace(/<(?!\/?a\b)[^>]+>/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

const typeLabels = {
  main_news: 'Chronicle',
  top_tools: 'Invention',
  quick_news: 'Dispatch'
}

export function NewsEntry({ segment, index }: { segment: Segment; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const relevance = getRelevance(segment)
  const entryDate = formatEntryDate(segment.publishedAt)
  const typeLabel = typeLabels[segment.type as keyof typeof typeLabels] || 'Entry'
  const hasStructured = segment.structuredContent && segment.structuredContent.news

  // Get content for display
  const newsContent = hasStructured
    ? formatWithLinks(segment.structuredContent!.news)
    : segment.originalContent.split('\n')[0] || segment.originalContent.substring(0, 200)

  const detailsContent = hasStructured
    ? formatWithLinks(segment.structuredContent!.details)
    : null

  const whyItMattersContent = hasStructured
    ? formatWithLinks(segment.structuredContent!.whyItMatters)
    : null

  // Importance class
  const importanceClass = relevance === 'high' ? 'importance-high' : relevance === 'medium' ? 'importance-medium' : 'importance-low'

  return (
    <article
      className={`news-entry ${importanceClass} ink-fade-in`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Date */}
      <div className="font-typewriter text-xs mb-2" style={{ color: 'var(--ink-faded)' }}>
        {entryDate}
      </div>

      {/* Title with drop cap potential */}
      <h2
        className="font-handwritten text-2xl md:text-3xl mb-3 cursor-pointer hover:text-[var(--iron-gall)] transition-colors"
        style={{ color: 'var(--ink)' }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {segment.title}
      </h2>

      {/* Type badge */}
      <div className="flex items-center gap-3 mb-4">
        <span className="font-typewriter text-[10px] px-2 py-0.5 border border-[var(--gold)]" style={{ color: 'var(--gold-dark)' }}>
          {typeLabel.toUpperCase()}
        </span>
        {segment.personalizedContent && (
          <span className="font-annotation text-xs" style={{ color: 'var(--gold-dark)' }}>
            ✧ Inscribed for thee
          </span>
        )}
      </div>

      {/* NEWS Section - Always visible */}
      <div className="mb-4">
        <div className="section-label">News</div>
        <p
          className="font-serif text-base leading-relaxed drop-cap
            [&_a]:text-[var(--ink)] [&_a]:underline [&_a]:underline-offset-2
            hover:[&_a]:text-[var(--iron-gall)] [&_a]:transition-colors"
          style={{ color: 'var(--ink-light)' }}
          dangerouslySetInnerHTML={{ __html: newsContent }}
        />
      </div>

      {/* Topics */}
      <div className="flex flex-wrap gap-2 mb-4">
        {segment.topics.slice(0, 4).map((topic, i) => (
          <span
            key={topic}
            className="tag-scrap"
            style={{ transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)` }}
          >
            {topic}
          </span>
        ))}
      </div>

      {/* Collapsed state - show expand button */}
      {!isExpanded && (detailsContent || whyItMattersContent) && (
        <button
          onClick={() => setIsExpanded(true)}
          className="font-serif italic text-sm ink-link"
        >
          Read more...
        </button>
      )}

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-6 space-y-6 border-l-2 border-[var(--gold)]/30 pl-4 ml-2">
          {/* DETAILS Section */}
          {detailsContent && (
            <div>
              <div className="section-label">Details</div>
              <div
                className="font-serif text-base leading-relaxed whitespace-pre-line
                  [&_a]:text-[var(--ink)] [&_a]:underline [&_a]:underline-offset-2
                  hover:[&_a]:text-[var(--iron-gall)] [&_a]:transition-colors"
                style={{ color: 'var(--ink-light)' }}
                dangerouslySetInnerHTML={{ __html: detailsContent }}
              />
            </div>
          )}

          {/* WHY IT MATTERS Section */}
          {whyItMattersContent && (
            <div className="p-4 rounded-sm" style={{ background: 'var(--parchment-light)', border: '1px solid var(--gold)', borderStyle: 'dashed' }}>
              <div className="section-label" style={{ color: 'var(--vermillion)' }}>Why It Matters</div>
              <p
                className="font-serif text-base leading-relaxed italic
                  [&_a]:text-[var(--ink)] [&_a]:underline [&_a]:underline-offset-2
                  hover:[&_a]:text-[var(--iron-gall)] [&_a]:transition-colors"
                style={{ color: 'var(--ink)' }}
                dangerouslySetInnerHTML={{ __html: whyItMattersContent }}
              />
            </div>
          )}

          {/* Collapse button */}
          <button
            onClick={() => setIsExpanded(false)}
            className="font-serif italic text-sm ink-link flex items-center gap-2"
          >
            <span>↑</span>
            Collapse
          </button>
        </div>
      )}

      {/* Flourish divider */}
      <div className="flourish-divider" />
    </article>
  )
}

// Keep SectionHeader for compatibility but simplified
export function SectionHeader({ title, icon, count }: { title: string; icon?: React.ReactNode; count?: number }) {
  return (
    <div className="flex items-center justify-between mb-6 mt-8 first:mt-0">
      <div className="flex items-center gap-3">
        {icon && <span className="text-xl" style={{ color: 'var(--gold)' }}>{icon}</span>}
        <h2 className="font-handwritten text-2xl" style={{ color: 'var(--ink)' }}>
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

// Re-export getRelevance for use in FeedContent
export { getRelevance as getSegmentRelevance }
