"use client"

import { useState } from "react"

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

interface OnThisDaySidebarProps {
  periods: OnThisDayPeriod[]
}

const typeIcons: Record<string, string> = {
  main_news: "scroll",
  top_tools: "cog",
  quick_news: "note"
}

function formatHistoricalDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const day = d.getDate()
  const month = d.toLocaleDateString('en-US', { month: 'short' })
  const year = d.getFullYear()
  return `${month} ${day}, ${year}`
}

function HistoricalCard({ segment }: { segment: OnThisDaySegment }) {
  const formattedDate = formatHistoricalDate(segment.publishedAt)

  return (
    <div className="on-this-day-card">
      <div className="on-this-day-card-date">
        {formattedDate}
      </div>
      <h4 className="on-this-day-card-title">
        {segment.title}
      </h4>
      {segment.topics.length > 0 && (
        <div className="on-this-day-card-topics">
          {segment.topics.slice(0, 2).map((topic) => (
            <span key={topic} className="on-this-day-topic">
              {topic}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function PeriodSection({ period }: { period: OnThisDayPeriod }) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="on-this-day-period">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="on-this-day-period-header"
      >
        <span className="on-this-day-period-icon">
          {isExpanded ? "v" : ">"}
        </span>
        <span className="on-this-day-period-label">{period.label}</span>
      </button>
      {isExpanded && (
        <div className="on-this-day-period-content">
          {period.segments.map((segment) => (
            <HistoricalCard key={segment.id} segment={segment} />
          ))}
        </div>
      )}
    </div>
  )
}

export function OnThisDaySidebar({ periods }: OnThisDaySidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  // If no historical data, don't render the sidebar
  if (!periods || periods.length === 0) {
    return null
  }

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="on-this-day-mobile-toggle"
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label={isCollapsed ? "Show historical articles" : "Hide historical articles"}
      >
        <span className="on-this-day-toggle-icon">
          {isCollapsed ? ">" : "<"}
        </span>
        <span className="on-this-day-toggle-text">On This Day</span>
      </button>

      {/* Sidebar container */}
      <aside className={`on-this-day-sidebar ${isCollapsed ? 'on-this-day-sidebar-collapsed' : ''}`}>
        <div className="on-this-day-header">
          <h3 className="on-this-day-title">On This Day</h3>
          <p className="on-this-day-subtitle">From the Archives</p>
          <div className="on-this-day-flourish">- - -</div>
        </div>

        <div className="on-this-day-content">
          {periods.map((period) => (
            <PeriodSection key={period.label} period={period} />
          ))}
        </div>

        <div className="on-this-day-footer">
          <span className="on-this-day-footer-text">Codex Historicus</span>
        </div>
      </aside>
    </>
  )
}
