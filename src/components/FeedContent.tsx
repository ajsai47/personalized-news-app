"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { NewsEntry, getRelevance } from "@/components/NewsEntry"
import { ScrollContainer } from "@/components/ScrollContainer"
import { TopNav } from "@/components/TopNav"
import { DaVinciSketches } from "@/components/DaVinciSketches"
import { OnThisDaySidebar } from "@/components/OnThisDaySidebar"
import { TopicTimelineSidebar, TopicTimelineSidebarEmpty } from "@/components/TopicTimelineSidebar"
import { TimePeriod, DEFAULT_PERIOD } from "@/lib/timePeriods"

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

interface UserPreferences {
  role?: string
  industry?: string
  interests?: string[]
  tone?: string
  depth?: string
  vibe?: string
}

interface OnThisDaySegment {
  id: string
  title: string
  type: string
  publishedAt: string
  topics: string[]
}

interface OnThisDayPeriod {
  label: string
  date: Date
  segments: OnThisDaySegment[]
}

interface TopicCount {
  topic: string
  count: number
}

interface TopicTimeline {
  period: string
  periodLabel: string
  topics: TopicCount[]
  total: number
}

interface TopicStatsResult {
  topTopics: TopicCount[]
  timeline: TopicTimeline[]
  totalSegments: number
}

interface FeedContentProps {
  segments: Segment[]
  userPreferences?: UserPreferences | null
  dateStr: string
  greeting: string
  roleLabel: string
  importantCount: number
  onThisDayPeriods?: OnThisDayPeriod[]
  topicStats?: TopicStatsResult | null
  initialPeriod?: TimePeriod
}

export function FeedContent({
  segments,
  userPreferences,
  dateStr,
  greeting,
  roleLabel,
  importantCount,
  onThisDayPeriods = [],
  topicStats,
  initialPeriod = DEFAULT_PERIOD
}: FeedContentProps) {
  const router = useRouter()
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
  const [relevanceFilter, setRelevanceFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(initialPeriod)

  // Handle period change - update URL to trigger server re-fetch
  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period)
    router.push(`/feed?period=${period}`)
  }

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
      // Search filter - check title and content
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const titleMatch = seg.title.toLowerCase().includes(query)
        const contentMatch = seg.originalContent.toLowerCase().includes(query)
        const topicsMatch = seg.topics.some(t => t.toLowerCase().includes(query))
        const companiesMatch = (seg.companies || []).some(c => c.toLowerCase().includes(query))
        if (!titleMatch && !contentMatch && !topicsMatch && !companiesMatch) return false
      }
      return true
    })
  }, [segments, typeFilter, selectedTags, selectedCompanies, relevanceFilter, searchQuery])

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
        allCompanies={allCompanies}
        selectedCompanies={selectedCompanies}
        onCompaniesChange={setSelectedCompanies}
        relevanceFilter={relevanceFilter}
        onRelevanceChange={setRelevanceFilter}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedPeriod={selectedPeriod}
        onPeriodChange={handlePeriodChange}
      />

      {/* Main Layout with Sidebar */}
      <div className="relative z-10 px-4 py-8">
        <div className="feed-layout">
          {/* On This Day Sidebar - Left */}
          <OnThisDaySidebar periods={onThisDayPeriods} />

          {/* Main Content */}
          <div className="feed-main-content">
            {filteredSegments.length === 0 ? (
              <ScrollContainer>
                <div className="text-center py-16">
                  <div className="text-5xl mb-6 opacity-40">?</div>
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
                      setSearchQuery('')
                    }}
                    className="stamp-button text-sm"
                  >
                    Clear all filters
                  </button>
                </div>
              </ScrollContainer>
            ) : (
              <ScrollContainer>
                {/* Search Results Header - Only show when searching */}
                {searchQuery.trim() && (
                  <div className="search-results-header">
                    <span className="search-results-icon">?</span>
                    <div className="search-results-text">
                      Found <span className="search-results-count">{filteredSegments.length}</span>{' '}
                      {filteredSegments.length === 1 ? 'result' : 'results'} for{' '}
                      <span className="search-results-query">"{searchQuery}"</span>
                    </div>
                  </div>
                )}

                {/* Header inside scroll - only show when not searching */}
                {!searchQuery.trim() && (
                  <div className="text-center mb-8">
                    <h1 className="font-handwritten text-3xl mb-2" style={{ color: 'var(--ink)' }}>
                      Observations on Artificial Minds
                    </h1>
                    <p className="font-typewriter text-xs" style={{ color: 'var(--ink-faded)' }}>
                      {filteredSegments.length} {filteredSegments.length === 1 ? 'entry' : 'entries'} in this volume
                    </p>
                  </div>
                )}

                {/* All entries flow together */}
                {filteredSegments.map((seg, i) => (
                  <NewsEntry key={seg.id} segment={seg} index={i} searchQuery={searchQuery} />
                ))}

                {/* Footer flourish */}
                <div className="text-center mt-8 pt-4">
                  <p className="font-annotation text-sm italic" style={{ color: 'var(--ink-faded)' }}>
                    - Finis -
                  </p>
                </div>
              </ScrollContainer>
            )}
          </div>

          {/* Topic Timeline Sidebar - Right */}
          {topicStats ? (
            <TopicTimelineSidebar
              stats={topicStats}
              selectedTopics={selectedTags}
              onTopicClick={(topic) => {
                setSelectedTags(prev =>
                  prev.includes(topic)
                    ? prev.filter(t => t !== topic)
                    : [...prev, topic]
                )
              }}
            />
          ) : (
            <TopicTimelineSidebarEmpty />
          )}
        </div>
      </div>
    </>
  )
}
