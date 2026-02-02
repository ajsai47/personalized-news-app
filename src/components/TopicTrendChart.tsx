"use client";

import type { ReactElement } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface TopicTrendChartProps {
  topicData: { date: string; count: number }[];
  googleTrendsData?: { date: string; interest: number }[];
  period: string;
  topicColor: string;
}

interface ChartDataPoint {
  date: string;
  formattedDate: string;
  coverage: number;
  interest?: number;
}

function formatDateForPeriod(dateString: string, period: string): string {
  const date = new Date(dateString);
  if (period === "1d") {
    return date.toLocaleTimeString("en-US", { hour: "numeric" });
  }
  if (period === "1w") {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  }
  if (period === "1m") {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function normalizeToPercentage(values: number[]): number[] {
  const max = Math.max(...values, 1);
  return values.map((v) => Math.round((v / max) * 100));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatTooltipValue(value: any, name?: string): [string, string] {
  const numericValue = typeof value === "number" ? value : 0;
  const label = name === "coverage" ? "Your Coverage" : "Search Interest";
  return [`${numericValue}%`, label];
}

function formatLegendValue(value: string): string {
  return value === "coverage" ? "Your Coverage" : "Search Interest";
}

export function TopicTrendChart({
  topicData,
  googleTrendsData,
  period,
  topicColor,
}: TopicTrendChartProps): ReactElement {
  const normalizedCoverage = normalizeToPercentage(topicData.map((d) => d.count));
  const normalizedInterest = googleTrendsData
    ? normalizeToPercentage(googleTrendsData.map((d) => d.interest))
    : [];

  const chartData: ChartDataPoint[] = topicData.map((d, i) => ({
    date: d.date,
    formattedDate: formatDateForPeriod(d.date, period),
    coverage: normalizedCoverage[i],
    interest: normalizedInterest[i],
  }));

  return (
    <div className="topic-trend-chart">
      <ResponsiveContainer width="100%" height={150}>
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="formattedDate"
            tick={{ fill: "var(--ink)", fontFamily: "var(--font-serif)", fontSize: 10 }}
            axisLine={{ stroke: "var(--ink)" }}
            tickLine={{ stroke: "var(--ink)" }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "var(--ink)", fontFamily: "var(--font-serif)", fontSize: 10 }}
            axisLine={{ stroke: "var(--ink)" }}
            tickLine={{ stroke: "var(--ink)" }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--parchment-light)",
              border: "1px solid var(--ink-faded)",
              borderRadius: "4px",
              fontFamily: "var(--font-serif)",
              fontSize: "12px",
              color: "var(--ink)",
            }}
            formatter={formatTooltipValue}
            labelFormatter={(label) => String(label)}
          />
          <Legend
            formatter={formatLegendValue}
            wrapperStyle={{
              fontFamily: "var(--font-serif)",
              fontSize: "11px",
              color: "var(--ink)",
            }}
          />
          <Line
            type="monotone"
            dataKey="coverage"
            stroke={topicColor}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: topicColor }}
          />
          {googleTrendsData && (
            <Line
              type="monotone"
              dataKey="interest"
              stroke="var(--ink-faded)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 4, fill: "var(--ink-faded)" }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
