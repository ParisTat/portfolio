import React from 'react';
import type { ContributionDay } from './types';

interface ContributionHeatmapProps {
  weeks: ContributionDay[][];
  totalContributions: number;
}

const INTENSITY_CLASSES = [
  'bg-slate-800',
  'bg-sky-950',
  'bg-sky-800',
  'bg-sky-600',
  'bg-teal-400',
] as const;

function getIntensityLevel(count: number, maxCount: number): number {
  if (count <= 0 || maxCount <= 0) return 0;
  const ratio = count / maxCount;
  if (ratio > 0.75) return 4;
  if (ratio > 0.5) return 3;
  if (ratio > 0.25) return 2;
  return 1;
}

function formatCellLabel(day: ContributionDay): string {
  const count = day.count === 1 ? '1 contribution' : `${day.count} contributions`;
  return `${count} on ${day.date}`;
}

const ContributionHeatmap: React.FC<ContributionHeatmapProps> = ({ weeks, totalContributions }) => {
  const maxCount = weeks.reduce((max, week) => {
    const weekMax = week.reduce((weekMaxCount, day) => Math.max(weekMaxCount, day.count), 0);
    return Math.max(max, weekMax);
  }, 0);

  const summaryLabel = `${totalContributions} contribution${totalContributions === 1 ? '' : 's'} in the last year`;

  // The scroll container is focusable so keyboard users can scroll the grid on narrow screens (WCAG 2.1.1).
  return (
    <div
      role="region"
      aria-label="Contribution calendar"
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrollable region must be focusable (axe: scrollable-region-focusable)
      tabIndex={0}
      className="overflow-x-auto pb-2 rounded-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500"
    >
      <div
        role="img"
        aria-label={summaryLabel}
        className="inline-grid grid-flow-col gap-[3px]"
      >
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-flow-row gap-[3px]" style={{ gridTemplateRows: 'repeat(7, 11px)' }}>
            {week.map((day) => (
              <div
                key={day.date}
                title={formatCellLabel(day)}
                aria-hidden="true"
                className={`h-[11px] w-[11px] rounded-[2px] transition-colors motion-reduce:transition-none ${INTENSITY_CLASSES[getIntensityLevel(day.count, maxCount)]}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContributionHeatmap;
