"use client"

import { useState, useMemo } from "react"

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

interface TopicTimelineSidebarProps {
  stats: TopicStatsResult
  selectedTopics: string[]
  onTopicClick: (topic: string) => void
}

// Topic display names and colors
const TOPIC_CONFIG: Record<string, { label: string; color: string }> = {
  hardware: { label: 'Hardware', color: 'var(--iron-gall)' },
  llms: { label: 'LLMs', color: 'var(--vermillion)' },
  regulation: { label: 'Regulation', color: 'var(--sepia)' },
  startups: { label: 'Startups', color: 'var(--gold-dark)' },
  big_tech: { label: 'Big Tech', color: 'var(--ink)' },
  tools: { label: 'Tools', color: 'var(--gold)' },
  robotics: { label: 'Robotics', color: 'var(--ink-light)' },
  general: { label: 'General', color: 'var(--ink-faded)' }
}

function getTopicConfig(topic: string) {
  return TOPIC_CONFIG[topic] || { label: topic, color: 'var(--ink-faded)' }
}

export function TopicTimelineSidebar({
  stats,
  selectedTopics,
  onTopicClick
}: TopicTimelineSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Calculate max count for scaling bars
  const maxTopicCount = useMemo(() => {
    return Math.max(...stats.topTopics.map(t => t.count), 1)
  }, [stats.topTopics])

  // Calculate max weekly total for timeline bars
  const maxWeeklyTotal = useMemo(() => {
    return Math.max(...stats.timeline.map(t => t.total), 1)
  }, [stats.timeline])

  if (isCollapsed) {
    return (
      <aside className="topic-timeline-sidebar topic-timeline-sidebar-collapsed">
        <button
          onClick={() => setIsCollapsed(false)}
          className="topic-sidebar-toggle-btn"
          aria-label="Expand sidebar"
        >
          <span className="topic-toggle-icon">&#9664;</span>
          <span className="topic-toggle-text-vertical">Topics</span>
        </button>
      </aside>
    )
  }

  return (
    <aside className="topic-timeline-sidebar">
      {/* Header with collapse button */}
      <div className="topic-sidebar-header">
        <h3 className="topic-sidebar-title">
          <span className="topic-title-flourish">&#10087;</span>
          Topics Index
        </h3>
        <button
          onClick={() => setIsCollapsed(true)}
          className="topic-sidebar-collapse-btn"
          aria-label="Collapse sidebar"
        >
          &#9654;
        </button>
      </div>

      {/* Timeline Sparkline Chart */}
      <div className="topic-timeline-section">
        <h4 className="topic-section-subtitle">Weekly Activity</h4>
        <div className="topic-timeline-chart">
          {stats.timeline.map((week) => (
            <div key={week.period} className="topic-timeline-bar-container">
              <div
                className="topic-timeline-bar"
                style={{
                  height: `${(week.total / maxWeeklyTotal) * 100}%`
                }}
                title={`${week.periodLabel}: ${week.total} entries`}
              />
              <span className="topic-timeline-label">{week.periodLabel}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="topic-sidebar-divider">
        <span>&#8212; &#10086; &#8212;</span>
      </div>

      {/* Top Topics List */}
      <div className="topic-topics-section">
        <h4 className="topic-section-subtitle">By Subject</h4>
        <ul className="topic-topics-list">
          {stats.topTopics.map((topic) => {
            const config = getTopicConfig(topic.topic)
            const isSelected = selectedTopics.includes(topic.topic)
            const barWidth = (topic.count / maxTopicCount) * 100

            return (
              <li key={topic.topic} className="topic-topic-item">
                <button
                  onClick={() => onTopicClick(topic.topic)}
                  className={`topic-topic-button ${isSelected ? 'topic-topic-button-selected' : ''}`}
                >
                  <div className="topic-topic-info">
                    <span
                      className="topic-topic-indicator"
                      style={{ backgroundColor: config.color }}
                    />
                    <span className="topic-topic-label">{config.label}</span>
                  </div>
                  <span className="topic-topic-count">{topic.count}</span>
                </button>
                <div className="topic-topic-bar-bg">
                  <div
                    className="topic-topic-bar"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: config.color
                    }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Footer stats */}
      <div className="topic-sidebar-footer">
        <span className="topic-footer-stat">
          {stats.totalSegments} entries catalogued
        </span>
      </div>
    </aside>
  )
}

// Empty state component for when there's no data
export function TopicTimelineSidebarEmpty() {
  return (
    <aside className="topic-timeline-sidebar-empty">
      <div className="topic-empty-content">
        <span className="topic-empty-icon">&#128214;</span>
        <p className="topic-empty-text">Cataloguing topics...</p>
      </div>
    </aside>
  )
}
