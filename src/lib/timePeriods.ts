/**
 * Time period configuration for filtering and displaying news data
 */

export const TIME_PERIODS = ['1d', '1w', '1m', '3m', '6m', '1yr', 'all'] as const;

export type TimePeriod = (typeof TIME_PERIODS)[number];

export const DEFAULT_PERIOD: TimePeriod = '1m';

/**
 * Returns the number of days for a given time period
 */
export function getPeriodDays(period: string): number {
  switch (period) {
    case '1d':
      return 1;
    case '1w':
      return 7;
    case '1m':
      return 30;
    case '3m':
      return 90;
    case '6m':
      return 180;
    case '1yr':
      return 365;
    case 'all':
      return 36500; // ~100 years - effectively all entries
    default:
      return 30;
  }
}

/**
 * Returns a human-readable label for a given time period
 */
export function getPeriodLabel(period: string): string {
  switch (period) {
    case '1d':
      return '1 Day';
    case '1w':
      return '1 Week';
    case '1m':
      return '1 Month';
    case '3m':
      return '3 Months';
    case '6m':
      return '6 Months';
    case '1yr':
      return '1 Year';
    case 'all':
      return 'All Time';
    default:
      return '1 Month';
  }
}

export interface ChartBuckets {
  count: number;
  unit: 'hour' | 'day' | 'week' | 'month';
}

/**
 * Returns chart bucket configuration for appropriate data granularity
 * based on the selected time period
 */
export function getChartBuckets(period: string): ChartBuckets {
  switch (period) {
    case '1d':
      return { count: 24, unit: 'hour' };
    case '1w':
      return { count: 7, unit: 'day' };
    case '1m':
      return { count: 4, unit: 'week' };
    case '3m':
      return { count: 12, unit: 'week' };
    case '6m':
      return { count: 6, unit: 'month' };
    case '1yr':
      return { count: 12, unit: 'month' };
    case 'all':
      return { count: 24, unit: 'month' }; // 2 years of monthly buckets
    default:
      return { count: 4, unit: 'week' };
  }
}
