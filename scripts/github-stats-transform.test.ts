import { describe, expect, it } from 'vitest';
import {
  aggregateLanguages,
  buildStatsPayload,
  transformContributionCalendar,
} from './github-stats-transform.mjs';

describe('transformContributionCalendar', () => {
  it('maps weeks and contribution days into the sanitized shape', () => {
    const calendar = {
      totalContributions: 42,
      weeks: [
        {
          contributionDays: [
            { date: '2026-01-01', contributionCount: 3 },
            { date: '2026-01-02', contributionCount: 0 },
          ],
        },
      ],
    };

    const result = transformContributionCalendar(calendar);

    expect(result).toEqual({
      totalContributions: 42,
      weeks: [
        [
          { date: '2026-01-01', count: 3 },
          { date: '2026-01-02', count: 0 },
        ],
      ],
    });
  });

  it('returns zeroed defaults for empty input', () => {
    const result = transformContributionCalendar({ totalContributions: 0, weeks: [] });
    expect(result).toEqual({ totalContributions: 0, weeks: [] });
  });

  it('handles missing/malformed fields defensively', () => {
    // @ts-expect-error -- deliberately malformed input to verify defensive handling
    const result = transformContributionCalendar({ totalContributions: 'nope', weeks: undefined });
    expect(result).toEqual({ totalContributions: 0, weeks: [] });
  });
});

describe('aggregateLanguages', () => {
  it('sums sizes for the same language across repos and computes percent', () => {
    const edges = [
      { size: 300, node: { name: 'TypeScript', color: '#3178c6' } },
      { size: 100, node: { name: 'TypeScript', color: '#3178c6' } },
      { size: 100, node: { name: 'CSS', color: '#563d7c' } },
    ];

    const result = aggregateLanguages(edges);

    expect(result).toEqual([
      { name: 'TypeScript', color: '#3178c6', percent: 80 },
      { name: 'CSS', color: '#563d7c', percent: 20 },
    ]);
  });

  it('collapses languages beyond the top count into "Other"', () => {
    const edges = [
      { size: 500, node: { name: 'A', color: '#111111' } },
      { size: 400, node: { name: 'B', color: '#222222' } },
      { size: 300, node: { name: 'C', color: '#333333' } },
      { size: 200, node: { name: 'D', color: '#444444' } },
      { size: 100, node: { name: 'E', color: '#555555' } },
      { size: 90, node: { name: 'F', color: '#666666' } },
      { size: 10, node: { name: 'G', color: '#777777' } },
    ];

    const result = aggregateLanguages(edges, 6);

    expect(result).toHaveLength(7);
    expect(result[result.length - 1]).toEqual({ name: 'Other', color: '#64748b', percent: 0.6 });
  });

  it('returns an empty array for empty input', () => {
    expect(aggregateLanguages([])).toEqual([]);
    expect(aggregateLanguages(undefined as unknown as never[])).toEqual([]);
  });

  it('ignores malformed edges without a valid name or positive size', () => {
    const edges = [
      { size: 0, node: { name: 'Zero', color: '#000000' } },
      { size: -5, node: { name: 'Negative', color: '#000000' } },
      { size: 50, node: { name: '', color: '#000000' } },
      { size: 50, node: { name: 'Valid', color: '#abcabc' } },
    ];

    const result = aggregateLanguages(edges);

    expect(result).toEqual([{ name: 'Valid', color: '#abcabc', percent: 100 }]);
  });

  it('falls back to a neutral color when a node has no color', () => {
    const edges = [{ size: 10, node: { name: 'Mystery', color: null } }];
    const result = aggregateLanguages(edges);
    expect(result).toEqual([{ name: 'Mystery', color: '#64748b', percent: 100 }]);
  });
});

describe('buildStatsPayload', () => {
  it('combines calendar and language data into the final payload shape', () => {
    const payload = buildStatsPayload({
      login: 'ParisTat',
      generatedAt: '2026-09-27T00:00:00.000Z',
      calendar: {
        totalContributions: 5,
        weeks: [{ contributionDays: [{ date: '2026-09-27', contributionCount: 5 }] }],
      },
      languageEdges: [{ size: 100, node: { name: 'TypeScript', color: '#3178c6' } }],
    });

    expect(payload).toEqual({
      generatedAt: '2026-09-27T00:00:00.000Z',
      login: 'ParisTat',
      totalContributions: 5,
      weeks: [[{ date: '2026-09-27', count: 5 }]],
      languages: [{ name: 'TypeScript', color: '#3178c6', percent: 100 }],
    });
  });

  it('produces empty collections for empty input without throwing', () => {
    const payload = buildStatsPayload({
      login: 'ParisTat',
      generatedAt: '2026-09-27T00:00:00.000Z',
      calendar: { totalContributions: 0, weeks: [] },
      languageEdges: [],
    });

    expect(payload.weeks).toEqual([]);
    expect(payload.languages).toEqual([]);
  });
});
