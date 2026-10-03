/**
 * Pure transformation logic for the build-time GitHub stats fetch.
 * No network calls here — only data shaping, so it can be unit-tested with Vitest
 * without hitting the GitHub API.
 */

/** @typedef {{ date: string, count: number }} ContributionDay */
/** @typedef {{ name: string, color: string, percent: number }} LanguageStat */

/**
 * @typedef {Object} RawContributionDay
 * @property {string} date
 * @property {number} contributionCount
 */

/**
 * @typedef {Object} RawContributionWeek
 * @property {RawContributionDay[]} contributionDays
 */

/**
 * @typedef {Object} RawContributionCalendar
 * @property {number} totalContributions
 * @property {RawContributionWeek[]} weeks
 */

/**
 * @typedef {Object} RawLanguageNode
 * @property {string} name
 * @property {string | null | undefined} color
 */

/**
 * @typedef {Object} RawLanguageEdge
 * @property {number} size
 * @property {RawLanguageNode} node
 */

const DEFAULT_TOP_LANGUAGE_COUNT = 6;
const OTHER_LANGUAGE_NAME = 'Other';
const OTHER_LANGUAGE_COLOR = '#64748b';
const PERCENT_PRECISION_MULTIPLIER = 10;

/**
 * Maps the GraphQL contributionCalendar into the sanitized { totalContributions, weeks } shape.
 * @param {RawContributionCalendar} calendar
 * @returns {{ totalContributions: number, weeks: ContributionDay[][] }}
 */
export function transformContributionCalendar(calendar) {
  const totalContributions = Number.isFinite(calendar?.totalContributions)
    ? Math.max(0, calendar.totalContributions)
    : 0;

  const rawWeeks = Array.isArray(calendar?.weeks) ? calendar.weeks : [];

  const weeks = rawWeeks.map((week) => {
    const rawDays = Array.isArray(week?.contributionDays) ? week.contributionDays : [];
    return rawDays.map((day) => ({
      date: typeof day?.date === 'string' ? day.date : '',
      count: Number.isFinite(day?.contributionCount) ? Math.max(0, day.contributionCount) : 0,
    }));
  });

  return { totalContributions, weeks };
}

/**
 * Aggregates language byte sizes across repositories into the top N languages by size,
 * folding the remainder into an "Other" bucket, each with a computed percentage share.
 * @param {RawLanguageEdge[]} languageEdges
 * @param {number} [topCount]
 * @returns {LanguageStat[]}
 */
export function aggregateLanguages(languageEdges, topCount = DEFAULT_TOP_LANGUAGE_COUNT) {
  const edges = Array.isArray(languageEdges) ? languageEdges : [];

  /** @type {Map<string, { size: number, color: string }>} */
  const totalsByName = new Map();

  for (const edge of edges) {
    const name = edge?.node?.name;
    const size = edge?.size;
    if (typeof name !== 'string' || name.length === 0 || !Number.isFinite(size) || size <= 0) {
      continue;
    }
    const color = typeof edge.node.color === 'string' ? edge.node.color : OTHER_LANGUAGE_COLOR;
    const existing = totalsByName.get(name);
    if (existing) {
      totalsByName.set(name, { size: existing.size + size, color: existing.color });
    } else {
      totalsByName.set(name, { size, color });
    }
  }

  const totalSize = Array.from(totalsByName.values()).reduce((sum, entry) => sum + entry.size, 0);
  if (totalSize <= 0) {
    return [];
  }

  const sorted = Array.from(totalsByName.entries()).sort((a, b) => b[1].size - a[1].size);

  const top = sorted.slice(0, topCount);
  const rest = sorted.slice(topCount);

  const toPercent = (size) =>
    Math.round((size / totalSize) * 100 * PERCENT_PRECISION_MULTIPLIER) / PERCENT_PRECISION_MULTIPLIER;

  /** @type {LanguageStat[]} */
  const result = top.map(([name, { size, color }]) => ({
    name,
    color,
    percent: toPercent(size),
  }));

  if (rest.length > 0) {
    const otherSize = rest.reduce((sum, [, entry]) => sum + entry.size, 0);
    if (otherSize > 0) {
      result.push({
        name: OTHER_LANGUAGE_NAME,
        color: OTHER_LANGUAGE_COLOR,
        percent: toPercent(otherSize),
      });
    }
  }

  return result;
}

/**
 * Builds the final sanitized stats payload written to public/github-stats.json.
 * Only the listed fields are included — nothing from the raw API response passes through untouched.
 * @param {Object} params
 * @param {string} params.login
 * @param {string} params.generatedAt ISO timestamp
 * @param {RawContributionCalendar} params.calendar
 * @param {RawLanguageEdge[]} params.languageEdges
 * @returns {{
 *   generatedAt: string,
 *   login: string,
 *   totalContributions: number,
 *   weeks: ContributionDay[][],
 *   languages: LanguageStat[]
 * }}
 */
export function buildStatsPayload({ login, generatedAt, calendar, languageEdges }) {
  const { totalContributions, weeks } = transformContributionCalendar(calendar);
  const languages = aggregateLanguages(languageEdges);

  return {
    generatedAt,
    login,
    totalContributions,
    weeks,
    languages,
  };
}
