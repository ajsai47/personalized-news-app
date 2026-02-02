"use client"

import { useState } from "react"
import Link from "next/link"

interface TopNavProps {
  dateStr: string
  roleLabel: string
  greeting: string
  storyCount: number
  importantCount: number
  // Filter props
  allTags: string[]
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  allCompanies: string[]
  selectedCompanies: string[]
  onCompaniesChange: (companies: string[]) => void
  relevanceFilter: 'all' | 'high' | 'medium' | 'low'
  onRelevanceChange: (relevance: 'all' | 'high' | 'medium' | 'low') => void
  typeFilter: string
  onTypeChange: (type: string) => void
}

export function TopNav({
  dateStr,
  roleLabel,
  greeting,
  storyCount,
  importantCount,
  allTags,
  selectedTags,
  onTagsChange,
  allCompanies,
  selectedCompanies,
  onCompaniesChange,
  relevanceFilter,
  onRelevanceChange,
  typeFilter,
  onTypeChange
}: TopNavProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [showTags, setShowTags] = useState(false)
  const [showCompanies, setShowCompanies] = useState(false)

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag))
    } else {
      onTagsChange([...selectedTags, tag])
    }
  }

  const toggleCompany = (company: string) => {
    if (selectedCompanies.includes(company)) {
      onCompaniesChange(selectedCompanies.filter(c => c !== company))
    } else {
      onCompaniesChange([...selectedCompanies, company])
    }
  }

  const typeOptions = [
    { value: 'all', label: 'All' },
    { value: 'main_news', label: 'Chronicles' },
    { value: 'top_tools', label: 'Inventions' },
    { value: 'quick_news', label: 'Dispatches' }
  ]

  const relevanceOptions = [
    { value: 'all', label: 'All' },
    { value: 'high', label: 'Important' },
    { value: 'medium', label: 'Notable' },
    { value: 'low', label: 'Brief' }
  ]

  const hasActiveFilters = typeFilter !== 'all' || relevanceFilter !== 'all' || selectedTags.length > 0 || selectedCompanies.length > 0

  return (
    <nav className="sticky top-0 z-50" style={{ background: 'var(--parchment)', borderBottom: '1px solid rgba(139, 115, 85, 0.3)' }}>
      {/* Main Nav Bar */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          {/* Left - Logo */}
          <div className="flex items-center gap-3">
            <span className="font-handwritten text-2xl" style={{ color: 'var(--ink)' }}>
              AG+
            </span>
            <span className="hidden sm:block text-xs font-typewriter" style={{ color: 'var(--ink-faded)' }}>
              Notebook
            </span>
          </div>

          {/* Center - Quick Stats */}
          <div className="hidden md:flex items-center gap-4 font-typewriter text-xs" style={{ color: 'var(--ink-faded)' }}>
            <span>{storyCount} entries</span>
            <span style={{ color: 'var(--vermillion)' }}>✦ {importantCount} important</span>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-2">
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-typewriter transition-colors ${
                showFilters || hasActiveFilters
                  ? 'text-[var(--sepia)] border-[var(--sepia)]'
                  : 'text-[var(--ink-faded)] border-[var(--ink-faded)]'
              } border hover:text-[var(--ink)]`}
            >
              <span>⚙</span>
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--vermillion)]" />
              )}
            </button>

            {/* Settings */}
            <Link
              href="/settings"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-typewriter border border-[var(--ink-faded)] hover:border-[var(--ink)] transition-colors"
              style={{ color: 'var(--ink-faded)' }}
            >
              <span>☰</span>
              <span className="hidden sm:inline">Prefs</span>
            </Link>
          </div>
        </div>

        {/* Greeting line */}
        <div className="flex items-center justify-between pb-3 -mt-1">
          <p className="font-serif text-sm" style={{ color: 'var(--ink-light)' }}>
            {greeting}, {roleLabel} · <span className="font-typewriter text-xs" style={{ color: 'var(--ink-faded)' }}>{dateStr}</span>
          </p>
        </div>
      </div>

      {/* Expanded Filters Panel */}
      {showFilters && (
        <div className="border-t border-[var(--ink-faded)]/20" style={{ background: 'var(--parchment-light)' }}>
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex flex-wrap items-center gap-6">
              {/* Type Filter */}
              <div className="flex items-center gap-2">
                <span className="font-annotation text-xs" style={{ color: 'var(--ink-faded)' }}>Type:</span>
                <div className="flex gap-1">
                  {typeOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => onTypeChange(opt.value)}
                      className={`px-2 py-1 text-xs font-typewriter transition-all ${
                        typeFilter === opt.value
                          ? 'bg-[var(--sepia)] text-[var(--parchment)]'
                          : 'text-[var(--ink-faded)] hover:text-[var(--ink)]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-6" style={{ background: 'var(--ink-faded)', opacity: 0.3 }} />

              {/* Relevance Filter */}
              <div className="flex items-center gap-2">
                <span className="font-annotation text-xs" style={{ color: 'var(--ink-faded)' }}>Import:</span>
                <div className="flex gap-1">
                  {relevanceOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => onRelevanceChange(opt.value as 'all' | 'high' | 'medium' | 'low')}
                      className={`px-2 py-1 text-xs font-typewriter transition-all ${
                        relevanceFilter === opt.value
                          ? 'bg-[var(--sepia)] text-[var(--parchment)]'
                          : 'text-[var(--ink-faded)] hover:text-[var(--ink)]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-6" style={{ background: 'var(--ink-faded)', opacity: 0.3 }} />

              {/* Tags */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowTags(!showTags)}
                  className="flex items-center gap-1 font-annotation text-xs hover:underline"
                  style={{ color: 'var(--ink-faded)' }}
                >
                  Subjects {showTags ? '▴' : '▾'}
                </button>
                {selectedTags.length > 0 && (
                  <div className="flex items-center gap-1">
                    {selectedTags.slice(0, 2).map(tag => (
                      <span
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className="px-1.5 py-0.5 text-xs font-annotation cursor-pointer hover:line-through"
                        style={{ background: 'var(--parchment-dark)', color: 'var(--ink-light)' }}
                      >
                        {tag} ×
                      </span>
                    ))}
                    {selectedTags.length > 2 && (
                      <span className="text-xs" style={{ color: 'var(--ink-faded)' }}>
                        +{selectedTags.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-6" style={{ background: 'var(--ink-faded)', opacity: 0.3 }} />

              {/* Companies */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCompanies(!showCompanies)}
                  className="flex items-center gap-1 font-annotation text-xs hover:underline"
                  style={{ color: 'var(--ink-faded)' }}
                >
                  Companies {showCompanies ? '▴' : '▾'}
                </button>
                {selectedCompanies.length > 0 && (
                  <div className="flex items-center gap-1">
                    {selectedCompanies.slice(0, 2).map(company => (
                      <span
                        key={company}
                        onClick={() => toggleCompany(company)}
                        className="px-1.5 py-0.5 text-xs font-annotation cursor-pointer hover:line-through"
                        style={{ background: 'var(--iron-gall)', color: 'var(--parchment)' }}
                      >
                        {company} ×
                      </span>
                    ))}
                    {selectedCompanies.length > 2 && (
                      <span className="text-xs" style={{ color: 'var(--ink-faded)' }}>
                        +{selectedCompanies.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Clear All */}
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    onTypeChange('all')
                    onRelevanceChange('all')
                    onTagsChange([])
                    onCompaniesChange([])
                  }}
                  className="font-annotation text-xs italic hover:underline"
                  style={{ color: 'var(--vermillion)' }}
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Tags Expansion */}
            {showTags && (
              <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-dashed border-[var(--ink-faded)]/20">
                {allTags.map((tag, i) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-2 py-0.5 text-xs font-annotation transition-all ${
                      selectedTags.includes(tag)
                        ? 'bg-[var(--sepia)] text-[var(--parchment)]'
                        : 'bg-[var(--parchment-dark)] text-[var(--ink-faded)] hover:text-[var(--ink)]'
                    }`}
                    style={{ transform: `rotate(${(i % 3) - 1}deg)` }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}

            {/* Companies Expansion */}
            {showCompanies && (
              <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-dashed border-[var(--ink-faded)]/20">
                {allCompanies.map((company, i) => (
                  <button
                    key={company}
                    onClick={() => toggleCompany(company)}
                    className={`px-2 py-0.5 text-xs font-annotation transition-all ${
                      selectedCompanies.includes(company)
                        ? 'bg-[var(--iron-gall)] text-[var(--parchment)]'
                        : 'bg-[var(--parchment-dark)] text-[var(--ink-faded)] hover:text-[var(--ink)]'
                    }`}
                    style={{ transform: `rotate(${(i % 3) - 1}deg)` }}
                  >
                    {company}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
