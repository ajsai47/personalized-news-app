"use client";

import { TIME_PERIODS, getPeriodLabel, TimePeriod } from "@/lib/timePeriods";

interface TimePeriodSelectorProps {
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
}

export function TimePeriodSelector({
  selectedPeriod,
  onPeriodChange,
}: TimePeriodSelectorProps) {
  return (
    <div className="time-period-selector" role="group" aria-label="Time period">
      {TIME_PERIODS.map((period) => {
        const isActive = period === selectedPeriod;
        return (
          <button
            key={period}
            type="button"
            onClick={() => onPeriodChange(period)}
            className={`time-period-btn ${isActive ? "time-period-btn-active" : ""}`}
            aria-pressed={isActive}
            title={getPeriodLabel(period)}
          >
            {period}
          </button>
        );
      })}
    </div>
  );
}
