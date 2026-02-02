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

// Preserve links in HTML content
function formatWithLinks(text: string | null): string {
  if (!text) return ''
  return text
    .replace(/<(?!\/?a\b)[^>]+>/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

const typeLabels: Record<string, string> = {
  main_news: 'Chronicle',
  top_tools: 'Invention',
  quick_news: 'Dispatch'
}

// Highlight search terms in text
function highlightSearchTerms(text: string, searchQuery: string): string {
  if (!searchQuery.trim()) return text

  // Escape special regex characters in the search query
  const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escapedQuery})`, 'gi')

  return text.replace(regex, '<mark class="search-highlight">$1</mark>')
}

export function NewsEntry({ segment, index, searchQuery = '' }: { segment: Segment; index: number; searchQuery?: string }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const relevance = getRelevance(segment)
  const entryDate = formatEntryDate(segment.publishedAt)
  const typeLabel = typeLabels[segment.type] || 'Entry'
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

  return (
    <article
      className="entry-card ink-fade-in"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Importance indicator */}
      {relevance === 'high' && (
        <div className="entry-importance-badge">Important</div>
      )}

      {/* Date - Small signature at top */}
      <div className="entry-date">
        {entryDate}
      </div>

      {/* Title - Largest element */}
      <h1
        className="entry-title cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        dangerouslySetInnerHTML={{ __html: highlightSearchTerms(segment.title, searchQuery) }}
      />

      {/* Badges below title */}
      <div className="entry-badges">
        <span className="entry-badge entry-badge-type">{typeLabel}</span>
        {segment.topics.slice(0, 3).map((topic) => (
          <span key={topic} className="entry-badge entry-badge-topic">
            {topic}
          </span>
        ))}
        {segment.personalizedContent && (
          <span className="entry-badge entry-badge-personalized">
            ✧ For thee
          </span>
        )}
      </div>

      {/* News Section - Always visible */}
      <div className="entry-section">
        <p
          className="entry-news drop-cap
            [&_a]:text-[var(--ink)] [&_a]:underline [&_a]:underline-offset-2
            hover:[&_a]:text-[var(--iron-gall)] [&_a]:transition-colors"
          dangerouslySetInnerHTML={{ __html: highlightSearchTerms(newsContent, searchQuery) }}
        />
      </div>

      {/* Collapsed state */}
      {!isExpanded && (detailsContent || whyItMattersContent) && (
        <button
          onClick={() => setIsExpanded(true)}
          className="entry-expand-btn"
        >
          Read more...
        </button>
      )}

      {/* Expanded Content */}
      {isExpanded && (
        <div className="entry-expanded">
          {/* Details Section */}
          {detailsContent && (
            <div className="entry-section">
              <h2 className="entry-section-header">Details</h2>
              <div
                className="entry-content
                  [&_a]:text-[var(--ink)] [&_a]:underline [&_a]:underline-offset-2
                  hover:[&_a]:text-[var(--iron-gall)] [&_a]:transition-colors"
                dangerouslySetInnerHTML={{ __html: highlightSearchTerms(detailsContent, searchQuery) }}
              />
            </div>
          )}

          {/* Why It Matters Section */}
          {whyItMattersContent && (
            <div className="entry-section entry-section-matters">
              <h2 className="entry-section-header entry-section-header-matters">Why It Matters</h2>
              <p
                className="entry-content entry-content-matters
                  [&_a]:text-[var(--ink)] [&_a]:underline [&_a]:underline-offset-2
                  hover:[&_a]:text-[var(--iron-gall)] [&_a]:transition-colors"
                dangerouslySetInnerHTML={{ __html: highlightSearchTerms(whyItMattersContent, searchQuery) }}
              />
            </div>
          )}

          {/* Collapse button */}
          <button
            onClick={() => setIsExpanded(false)}
            className="entry-collapse-btn"
          >
            ↑ Collapse
          </button>
        </div>
      )}

      {/* Signature cursive divider */}
      <div className="entry-signature-divider">
        <span>~ AG+ ~</span>
      </div>
    </article>
  )
}

// Keep SectionHeader for compatibility
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
