"use server"

import { sql } from './db'

export interface OnThisDaySegment {
  id: string
  title: string
  type: string
  publishedAt: string
  topics: string[]
}

export interface OnThisDayPeriod {
  label: string
  date: Date
  segments: OnThisDaySegment[]
}

export type TimePeriod = '1d' | '1w' | '1m' | '3m' | '6m' | '1yr'

interface PeriodConfig {
  label: string
  days: number
}

function getPeriodsForTimeRange(period: TimePeriod): PeriodConfig[] {
  switch (period) {
    case '1d':
      return [
        { label: 'Yesterday', days: 1 },
        { label: '2 Days Ago', days: 2 },
      ]
    case '1w':
      return [
        { label: '1 Week Ago', days: 7 },
        { label: '2 Weeks Ago', days: 14 },
      ]
    case '1m':
      return [
        { label: '1 Month Ago', days: 30 },
        { label: '2 Months Ago', days: 60 },
      ]
    case '3m':
      return [
        { label: '3 Months Ago', days: 91 },
        { label: '6 Months Ago', days: 182 },
      ]
    case '6m':
      return [
        { label: '6 Months Ago', days: 182 },
        { label: '1 Year Ago', days: 365 },
      ]
    case '1yr':
      return [
        { label: '1 Year Ago', days: 365 },
        { label: '2 Years Ago', days: 730 },
      ]
    default:
      return [
        { label: '1 Month Ago', days: 30 },
        { label: '2 Months Ago', days: 60 },
      ]
  }
}

/**
 * Get segments from specific time intervals in the past
 * Uses a 2-day tolerance to account for weekends and gaps
 */
export async function getOnThisDaySegments(
  period: TimePeriod = '1m'
): Promise<OnThisDayPeriod[]> {
  const now = new Date()

  const periods = getPeriodsForTimeRange(period)

  const results: OnThisDayPeriod[] = []

  for (const periodConfig of periods) {
    const targetDate = new Date(now)
    targetDate.setDate(targetDate.getDate() - periodConfig.days)

    // Query with 2-day tolerance
    const startDate = new Date(targetDate)
    startDate.setDate(startDate.getDate() - 2)

    const endDate = new Date(targetDate)
    endDate.setDate(endDate.getDate() + 2)

    try {
      const segments = await sql`
        SELECT s.id, s.title, s.type, s.topics, n.published_at
        FROM segments s
        JOIN newsletters n ON s.newsletter_id = n.id
        WHERE n.published_at >= ${startDate.toISOString()}
          AND n.published_at <= ${endDate.toISOString()}
        ORDER BY n.published_at DESC
        LIMIT 3
      `

      if (segments && segments.length > 0) {
        results.push({
          label: periodConfig.label,
          date: targetDate,
          segments: segments.map(row => ({
            id: row.id,
            title: row.title,
            type: row.type,
            publishedAt: row.published_at,
            topics: row.topics || []
          }))
        })
      }
    } catch (error) {
      console.error(`Error fetching segments for ${periodConfig.label}:`, error)
    }
  }

  return results
}
