"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { TimePeriodSelector } from "./TimePeriodSelector"
import { TimePeriod } from "@/lib/timePeriods"

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
  // Search props
  searchQuery: string
  onSearchChange: (query: string) => void
  // Time period props
  selectedPeriod: TimePeriod
  onPeriodChange: (period: TimePeriod) => void
}

// Dropdown component for filters
function FilterDropdown({
  label,
  value,
  options,
  onChange,
  multiple = false,
  selectedItems = [],
  onToggleItem
}: {
  label: string
  value?: string
  options: { value: string; label: string }[]
  onChange?: (value: string) => void
  multiple?: boolean
  selectedItems?: string[]
  onToggleItem?: (item: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const displayValue = multiple
    ? (selectedItems.length > 0 ? `${selectedItems.length} selected` : label)
    : (options.find(o => o.value === value)?.label || label)

  const hasSelection = multiple ? selectedItems.length > 0 : value !== 'all'

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-typewriter border transition-colors ${
          hasSelection
            ? 'border-[var(--sepia)] text-[var(--sepia)]'
            : 'border-[var(--ink-faded)] text-[var(--ink-faded)] hover:text-[var(--ink)] hover:border-[var(--ink)]'
        }`}
      >
        <span>{displayValue}</span>
        <span className="text-[10px]">{isOpen ? '▴' : '▾'}</span>
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 min-w-[140px] max-h-[250px] overflow-y-auto border border-[var(--ink-faded)] shadow-lg z-50"
          style={{ background: 'var(--parchment)' }}
        >
          {multiple ? (
            options.map(opt => (
              <button
                key={opt.value}
                onClick={() => onToggleItem?.(opt.value)}
                className={`w-full px-3 py-2 text-left text-xs font-typewriter flex items-center gap-2 hover:bg-[var(--parchment-dark)] ${
                  selectedItems.includes(opt.value) ? 'text-[var(--sepia)]' : 'text-[var(--ink-light)]'
                }`}
              >
                <span className="w-3">{selectedItems.includes(opt.value) ? '✓' : ''}</span>
                {opt.label}
              </button>
            ))
          ) : (
            options.map(opt => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange?.(opt.value)
                  setIsOpen(false)
                }}
                className={`w-full px-3 py-2 text-left text-xs font-typewriter hover:bg-[var(--parchment-dark)] ${
                  value === opt.value ? 'text-[var(--sepia)] bg-[var(--parchment-light)]' : 'text-[var(--ink-light)]'
                }`}
              >
                {opt.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
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
  onTypeChange,
  searchQuery,
  onSearchChange,
  selectedPeriod,
  onPeriodChange
}: TopNavProps) {
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
    { value: 'all', label: 'All Types' },
    { value: 'main_news', label: 'Chronicles' },
    { value: 'top_tools', label: 'Inventions' },
    { value: 'quick_news', label: 'Dispatches' }
  ]

  const relevanceOptions = [
    { value: 'all', label: 'All Importance' },
    { value: 'high', label: 'Important' },
    { value: 'medium', label: 'Notable' },
    { value: 'low', label: 'Brief' }
  ]

  const tagOptions = allTags.map(t => ({ value: t, label: t }))
  const companyOptions = allCompanies.map(c => ({ value: c, label: c }))

  const hasActiveFilters = typeFilter !== 'all' || relevanceFilter !== 'all' || selectedTags.length > 0 || selectedCompanies.length > 0 || searchQuery.length > 0

  return (
    <nav className="sticky top-0 z-50" style={{ background: 'var(--parchment)', borderBottom: '1px solid rgba(139, 115, 85, 0.3)' }}>
      <div className="max-w-4xl mx-auto px-6">
        {/* Top Row - Logo, Search, Settings */}
        <div className="flex items-center gap-4 h-14">
          {/* Logo */}
          <Link href="/feed" className="flex items-center gap-2 flex-shrink-0">
            <span className="font-handwritten text-2xl" style={{ color: 'var(--ink)' }}>
              AG+
            </span>
            <span className="hidden sm:block text-xs font-typewriter" style={{ color: 'var(--ink-faded)' }}>
              Notebook
            </span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search entries..."
                className="w-full px-4 py-2 text-sm font-serif border border-[var(--ink-faded)] bg-transparent focus:outline-none focus:border-[var(--sepia)] transition-colors"
                style={{ color: 'var(--ink)', background: 'var(--parchment-light)' }}
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                  style={{ color: 'var(--ink-faded)' }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Stats & Settings */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden md:flex items-center gap-3 font-typewriter text-xs" style={{ color: 'var(--ink-faded)' }}>
              <span>{storyCount} entries</span>
              <span style={{ color: 'var(--vermillion)' }}>✦ {importantCount}</span>
            </div>
            <Link
              href="/settings"
              className="p-2 text-sm border border-[var(--ink-faded)] hover:border-[var(--ink)] transition-colors"
              style={{ color: 'var(--ink-faded)' }}
            >
              ☰
            </Link>
          </div>
        </div>

        {/* Bottom Row - Greeting and Filters */}
        <div className="flex items-center justify-between gap-4 pb-3">
          {/* Greeting */}
          <p className="font-serif text-sm flex-shrink-0" style={{ color: 'var(--ink-light)' }}>
            {greeting}, {roleLabel} · <span className="font-typewriter text-xs" style={{ color: 'var(--ink-faded)' }}>{dateStr}</span>
          </p>

          {/* Time Period Selector */}
          <TimePeriodSelector
            selectedPeriod={selectedPeriod}
            onPeriodChange={onPeriodChange}
          />

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <FilterDropdown
              label="Type"
              value={typeFilter}
              options={typeOptions}
              onChange={onTypeChange}
            />
            <FilterDropdown
              label="Importance"
              value={relevanceFilter}
              options={relevanceOptions}
              onChange={(v) => onRelevanceChange(v as 'all' | 'high' | 'medium' | 'low')}
            />
            <FilterDropdown
              label="Topics"
              multiple
              options={tagOptions}
              selectedItems={selectedTags}
              onToggleItem={toggleTag}
            />
            <FilterDropdown
              label="Companies"
              multiple
              options={companyOptions}
              selectedItems={selectedCompanies}
              onToggleItem={toggleCompany}
            />
            {hasActiveFilters && (
              <button
                onClick={() => {
                  onTypeChange('all')
                  onRelevanceChange('all')
                  onTagsChange([])
                  onCompaniesChange([])
                  onSearchChange('')
                }}
                className="px-2 py-1.5 text-xs font-typewriter hover:underline"
                style={{ color: 'var(--vermillion)' }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
