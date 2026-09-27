import { describe, expect, it } from 'vitest';
import { parseGitHubStats } from './parseGitHubStats';

function validPayload() {
  return {
    generatedAt: '2026-09-27T05:00:00.000Z',
    login: 'ParisTat',
    totalContributions: 123,
    weeks: [
      [
        { date: '2026-09-20', count: 1 },
        { date: '2026-09-21', count: 0 },
      ],
    ],
    languages: [{ name: 'TypeScript', color: '#3178c6', percent: 80 }],
  };
}

describe('parseGitHubStats', () => {
  it('accepts a well-formed payload unchanged', () => {
    const payload = validPayload();
    expect(parseGitHubStats(payload)).toEqual(payload);
  });

  it('rejects non-object input', () => {
    expect(parseGitHubStats(null)).toBeNull();
    expect(parseGitHubStats(undefined)).toBeNull();
    expect(parseGitHubStats('a string')).toBeNull();
    expect(parseGitHubStats(42)).toBeNull();
    expect(parseGitHubStats([])).toBeNull();
  });

  it('rejects a payload missing required fields', () => {
    const withoutLogin: Record<string, unknown> = { ...validPayload() };
    delete withoutLogin.login;
    expect(parseGitHubStats(withoutLogin)).toBeNull();

    const withoutWeeks: Record<string, unknown> = { ...validPayload() };
    delete withoutWeeks.weeks;
    expect(parseGitHubStats(withoutWeeks)).toBeNull();

    expect(parseGitHubStats({ ...validPayload(), totalContributions: -1 })).toBeNull();
    expect(parseGitHubStats({ ...validPayload(), totalContributions: 'many' })).toBeNull();
    expect(parseGitHubStats({ ...validPayload(), generatedAt: 'not-a-date' })).toBeNull();
  });

  it('falls back to a neutral color for a bad color value', () => {
    const payload = {
      ...validPayload(),
      languages: [{ name: 'Mystery', color: 'javascript:alert(1)', percent: 50 }],
    };
    const result = parseGitHubStats(payload);
    expect(result?.languages).toEqual([{ name: 'Mystery', color: '#64748b', percent: 50 }]);
  });

  it('drops individual malformed contribution days but keeps the rest of the week', () => {
    const payload = {
      ...validPayload(),
      weeks: [
        [
          { date: '2026-09-20', count: 2 },
          { date: 'not-a-date', count: 5 },
          { date: '2026-09-22', count: -3 },
        ],
      ],
    };
    const result = parseGitHubStats(payload);
    expect(result?.weeks).toEqual([[{ date: '2026-09-20', count: 2 }]]);
  });

  it('drops individual malformed language entries but keeps valid ones', () => {
    const payload = {
      ...validPayload(),
      languages: [
        { name: '', color: '#3178c6', percent: 10 },
        { name: 'Valid', color: '#abcabc', percent: 90 },
      ],
    };
    const result = parseGitHubStats(payload);
    expect(result?.languages).toEqual([{ name: 'Valid', color: '#abcabc', percent: 90 }]);
  });

  it('drops a language whose percent is above 100', () => {
    const payload = {
      ...validPayload(),
      languages: [
        { name: 'Huge', color: '#3178c6', percent: 5000 },
        { name: 'Valid', color: '#abcabc', percent: 100 },
      ],
    };
    const result = parseGitHubStats(payload);
    expect(result?.languages).toEqual([{ name: 'Valid', color: '#abcabc', percent: 100 }]);
  });

  it('caps oversized weeks and days-per-week arrays', () => {
    const oversizedWeeks = Array.from({ length: 100 }, (_, weekIndex) =>
      Array.from({ length: 20 }, (_, dayIndex) => ({
        date: `2026-01-${String((weekIndex % 28) + 1).padStart(2, '0')}`,
        count: dayIndex,
      })),
    );
    const result = parseGitHubStats({ ...validPayload(), weeks: oversizedWeeks });

    expect(result).not.toBeNull();
    expect(result?.weeks.length).toBeLessThanOrEqual(53);
    for (const week of result?.weeks ?? []) {
      expect(week.length).toBeLessThanOrEqual(7);
    }
  });

  it('caps an oversized languages array', () => {
    const oversizedLanguages = Array.from({ length: 50 }, (_, i) => ({
      name: `Lang${i}`,
      color: '#123456',
      percent: 1,
    }));
    const result = parseGitHubStats({ ...validPayload(), languages: oversizedLanguages });

    expect(result).not.toBeNull();
    expect(result?.languages.length).toBeLessThanOrEqual(7);
  });
});
