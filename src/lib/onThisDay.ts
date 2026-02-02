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

/**
 * Get segments from specific time intervals in the past
 * Uses a 2-day tolerance to account for weekends and gaps
 */
export async function getOnThisDaySegments(): Promise<OnThisDayPeriod[]> {
  const now = new Date()

  // Define the time periods we want to query
  const periods = [
    { label: 'One Year Ago', days: 365 },
    { label: 'Six Months Ago', days: 182 },
    { label: 'One Month Ago', days: 30 },
    { label: 'One Week Ago', days: 7 },
  ]

  const results: OnThisDayPeriod[] = []

  for (const period of periods) {
    const targetDate = new Date(now)
    targetDate.setDate(targetDate.getDate() - period.days)

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
          label: period.label,
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
      // Log error but continue with other periods
      console.error(`Error fetching segments for ${period.label}:`, error)
    }
  }

  return results
}
