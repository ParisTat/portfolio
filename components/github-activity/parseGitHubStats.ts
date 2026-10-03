import type { ContributionDay, GitHubStats, LanguageStat } from './types';

/**
 * Type guard + sanitizer for the build-time github-stats.json payload.
 * The file is fetched over the network and must be treated as untrusted: this module
 * validates every field, rejects structurally malformed data, and caps array sizes so a
 * corrupted or malicious file can never blow up rendering.
 */

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const COLOR_PATTERN = /^#[0-9a-fA-F]{3,8}$/;
const FALLBACK_COLOR = '#64748b';

const MAX_WEEKS = 53;
const MAX_DAYS_PER_WEEK = 7;
const MAX_LANGUAGES = 7;
const MAX_PERCENT = 100;

function isFiniteNonNegative(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function parseContributionDay(value: unknown): ContributionDay | null {
  if (typeof value !== 'object' || value === null) return null;
  const day = value as Record<string, unknown>;
  if (typeof day.date !== 'string' || !DATE_PATTERN.test(day.date)) return null;
  if (!isFiniteNonNegative(day.count)) return null;
  return { date: day.date, count: day.count };
}

function parseWeek(value: unknown): ContributionDay[] | null {
  if (!Array.isArray(value)) return null;
  const days: ContributionDay[] = [];
  for (const raw of value.slice(0, MAX_DAYS_PER_WEEK)) {
    const day = parseContributionDay(raw);
    if (day) days.push(day);
  }
  return days;
}

function parseLanguageStat(value: unknown): LanguageStat | null {
  if (typeof value !== 'object' || value === null) return null;
  const lang = value as Record<string, unknown>;
  if (typeof lang.name !== 'string' || lang.name.length === 0) return null;
  if (!isFiniteNonNegative(lang.percent) || lang.percent > MAX_PERCENT) return null;
  const color =
    typeof lang.color === 'string' && COLOR_PATTERN.test(lang.color) ? lang.color : FALLBACK_COLOR;
  return { name: lang.name, color, percent: lang.percent };
}

/**
 * Validates and sanitizes an unknown JSON value into a GitHubStats payload.
 * Returns null when the top-level structure is missing or invalid — callers should
 * render nothing in that case rather than showing a broken section.
 */
export function parseGitHubStats(data: unknown): GitHubStats | null {
  if (typeof data !== 'object' || data === null) return null;
  const stats = data as Record<string, unknown>;

  if (typeof stats.generatedAt !== 'string' || Number.isNaN(Date.parse(stats.generatedAt))) return null;
  if (typeof stats.login !== 'string' || stats.login.length === 0) return null;
  if (!isFiniteNonNegative(stats.totalContributions)) return null;
  if (!Array.isArray(stats.weeks)) return null;
  if (!Array.isArray(stats.languages)) return null;

  const weeks: ContributionDay[][] = [];
  for (const rawWeek of stats.weeks.slice(0, MAX_WEEKS)) {
    const week = parseWeek(rawWeek);
    if (week === null) return null;
    weeks.push(week);
  }

  const languages: LanguageStat[] = [];
  for (const rawLang of stats.languages.slice(0, MAX_LANGUAGES)) {
    const lang = parseLanguageStat(rawLang);
    if (lang) languages.push(lang);
  }

  return {
    generatedAt: stats.generatedAt,
    login: stats.login,
    totalContributions: stats.totalContributions,
    weeks,
    languages,
  };
}
