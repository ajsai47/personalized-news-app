"use client"

import { useState, useMemo } from "react"
import { NewsCard, SectionHeader, getRelevance } from "@/components/NewsCard"
import { TopNav } from "@/components/TopNav"
import { DaVinciSketches } from "@/components/DaVinciSketches"

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

interface UserPreferences {
  role?: string
  industry?: string
  interests?: string[]
  tone?: string
  depth?: string
  vibe?: string
}

interface FeedContentProps {
  segments: Segment[]
  userPreferences?: UserPreferences | null
  dateStr: string
  greeting: string
  roleLabel: string
  importantCount: number
}

export function FeedContent({
  segments,
  userPreferences,
  dateStr,
  greeting,
  roleLabel,
  importantCount
}: FeedContentProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
  const [relevanceFilter, setRelevanceFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  // Get all unique tags from segments
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    segments.forEach(seg => seg.topics.forEach(t => tags.add(t)))
    return Array.from(tags).sort()
  }, [segments])

  // Get all unique companies from segments, sorted by frequency
  const allCompanies = useMemo(() => {
    const companyCounts = new Map<string, number>()
    segments.forEach(seg => {
      (seg.companies || []).forEach(c => {
        companyCounts.set(c, (companyCounts.get(c) || 0) + 1)
      })
    })
    return Array.from(companyCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([company]) => company)
  }, [segments])

  // Filter segments based on selected filters
  const filteredSegments = useMemo(() => {
    return segments.filter(seg => {
      if (typeFilter !== 'all' && seg.type !== typeFilter) return false
      if (selectedTags.length > 0 && !selectedTags.some(tag => seg.topics.includes(tag))) return false
      if (selectedCompanies.length > 0 && !selectedCompanies.some(company => (seg.companies || []).includes(company))) return false
      if (relevanceFilter !== 'all') {
        const segRelevance = getRelevance(seg)
        if (segRelevance !== relevanceFilter) return false
      }
      return true
    })
  }, [segments, typeFilter, selectedTags, selectedCompanies, relevanceFilter])

  // Group filtered segments by type
  const chronicles = filteredSegments.filter(s => s.type === 'main_news')
  const inventions = filteredSegments.filter(s => s.type === 'top_tools')
  const dispatches = filteredSegments.filter(s => s.type === 'quick_news')

  const showUnifiedView = typeFilter !== 'all'

  return (
    <>
      {/* Da Vinci Sketches Background */}
      <DaVinciSketches />

      {/* Top Navigation with Filters */}
      <TopNav
        dateStr={dateStr}
        roleLabel={roleLabel}
        greeting={greeting}
        storyCount={segments.length}
        importantCount={importantCount}
        allTags={allTags}
        selectedTags={selectedTags}
        onTagsChange={setSelectedTags}
        allCompanies={allCompanies}
        selectedCompanies={selectedCompanies}
        onCompaniesChange={setSelectedCompanies}
        relevanceFilter={relevanceFilter}
        onRelevanceChange={setRelevanceFilter}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
      />

      {/* Content Area */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-8">
        {filteredSegments.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-6 opacity-40">🔍</div>
            <h2 className="font-handwritten text-2xl mb-3" style={{ color: 'var(--ink)' }}>
              No entries match thy criteria
            </h2>
            <p className="font-serif italic mb-6" style={{ color: 'var(--ink-light)' }}>
              Perhaps broaden thy search, dear scholar
            </p>
            <button
              onClick={() => {
                setSelectedTags([])
                setSelectedCompanies([])
                setRelevanceFilter('all')
                setTypeFilter('all')
              }}
              className="stamp-button text-sm"
            >
              Clear all filters
            </button>
          </div>
        ) : showUnifiedView ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-handwritten text-xl" style={{ color: 'var(--ink)' }}>
                {filteredSegments.length} {filteredSegments.length === 1 ? 'entry' : 'entries'} found
              </h2>
            </div>
            {filteredSegments.map((seg, i) => (
              <NewsCard key={seg.id} segment={seg} index={i} />
            ))}
          </div>
        ) : (
          <div>
            {chronicles.length > 0 && (
              <section>
                <SectionHeader title="Chronicles" icon="📜" count={chronicles.length} />
                {chronicles.map((seg, i) => (
                  <NewsCard key={seg.id} segment={seg} index={i} />
                ))}
              </section>
            )}

            {inventions.length > 0 && (
              <section>
                <SectionHeader title="Inventions" icon="⚙️" count={inventions.length} />
                {inventions.map((seg, i) => (
                  <NewsCard key={seg.id} segment={seg} index={i} />
                ))}
              </section>
            )}

            {dispatches.length > 0 && (
              <section>
                <SectionHeader title="Dispatches" icon="⚡" count={dispatches.length} />
                {dispatches.map((seg, i) => (
                  <NewsCard key={seg.id} segment={seg} index={i} />
                ))}
              </section>
            )}
          </div>
        )}
      </div>
    </>
  )
}
