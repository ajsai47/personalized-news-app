# Time Periods & Topic Trends Design

**Date:** February 2, 2026
**Status:** Approved

## Overview

Add configurable time periods (1d/1w/1m/3m/6m/1yr) to both sidebars with expandable topic trend charts comparing internal data against Google Trends.

## Time Period System

### Periods Available
- 1d, 1w, 1m (default), 3m, 6m, 1yr

### Global Selector
- Segmented buttons in top nav next to existing filters
- Default: 1m (matches current 30-day behavior)
- Affects both sidebars and main feed

### Per-Sidebar Overrides
- Small customize icon in each sidebar header
- Dropdown to choose different time period
- Visual indicator when overridden: "1m (custom)"
- Click to reset to global

### URL State
```
?period=1m&topicPeriod=3m&otdPeriod=1w
```

## Expandable Topic Trend Cards

### Collapsed (Default)
- Topic name, colored indicator, count bar
- Small sparkline preview (40px) showing trend direction
- Hover: "Click to expand"

### Expanded
- Full trend chart (~150px tall)
- Two lines:
  - Solid: Your topic mentions over time
  - Dashed: Google Trends search interest (0-100)
- Both normalized to percentage of max for fair comparison
- Accordion behavior: one expanded at a time

### Chart Granularity

| Period | X-axis Buckets |
|--------|----------------|
| 1d | 6 x 4-hour blocks |
| 1w | 7 days |
| 1m | ~4 weeks |
| 3m | ~12 weeks |
| 6m | ~6 months |
| 1yr | ~12 months |

## On This Day Dynamic Periods

| Selected Period | Shows |
|-----------------|-------|
| 1d | Yesterday, 2 days ago |
| 1w | 1 week ago, 2 weeks ago |
| 1m | 1 month ago, 2 months ago |
| 3m | 3 months ago, 6 months ago |
| 6m | 6 months ago, 1 year ago |
| 1yr | 1 year ago, 2 years ago |

Sections without data simply don't appear.

## Google Trends Integration

### Data Source
- Apify Google Trends Scraper (free tier: $5/month credits)
- Daily cron fetch at 2am
- ~$1-2/month usage (8 topics × daily)

### Topic to Search Term Mapping
```
hardware → "AI hardware"
llms → "large language models"
regulation → "AI regulation"
startups → "AI startups"
big_tech → "AI big tech"
tools → "AI tools"
robotics → "AI robotics"
general → "artificial intelligence"
```

### Database Schema
```sql
CREATE TABLE google_trends (
  id SERIAL PRIMARY KEY,
  topic VARCHAR(50),
  search_term VARCHAR(100),
  date DATE,
  interest_value INTEGER,
  fetched_at TIMESTAMP DEFAULT NOW()
);
```

### Fallbacks
1. Rate-limited: reduce to weekly fetches
2. Blocked: use PyTrends serverless function
3. Unavailable: show only internal data with note

## Files to Create/Modify

| File | Purpose |
|------|---------|
| `src/lib/timePeriods.ts` | Constants, URL param helpers |
| `src/lib/topicStats.ts` | Accept period param |
| `src/lib/onThisDay.ts` | Accept period param |
| `src/lib/googleTrends.ts` | Apify client, caching |
| `src/components/TimePeriodSelector.tsx` | Global selector |
| `src/components/TopicTimelineSidebar.tsx` | Expandable charts, override |
| `src/components/OnThisDaySidebar.tsx` | Dynamic periods, override |
| `src/components/TopicTrendChart.tsx` | Line chart component |
| `src/app/api/cron/fetch-trends/route.ts` | Daily Apify cron |

## Chart Library
Recharts - React-native, lightweight, good line chart support

## Data Flow
```
URL params → Server Component reads period →
Parallel fetch (segments + trends) →
Pass to Client Components → Render charts
```
