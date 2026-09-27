#!/usr/bin/env node

/**
 * Build-time script: fetches this GitHub account's public contribution activity
 * and language usage via the GraphQL API, then writes a sanitized snapshot to
 * public/github-stats.json for the client component to render.
 *
 * Must fail soft: if GITHUB_TOKEN is missing or the API call fails for any reason,
 * log a warning to stderr and exit 0 WITHOUT writing the file. The site must still
 * build and deploy with the section simply hidden (see parseGitHubStats.ts).
 *
 * Plain Node 20, no dependencies, native fetch only.
 */

import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_LOGIN = process.env.GITHUB_LOGIN || 'ParisTat';
const GRAPHQL_ENDPOINT = 'https://api.github.com/graphql';
const REPOS_PAGE_SIZE = 50;
const LANGUAGES_PER_REPO = 10;
const MAX_REPO_PAGES = 20; // hard ceiling so a pagination bug can't loop forever

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.resolve(__dirname, '../public/github-stats.json');

const QUERY = `
  query GitHubStats($login: String!, $reposCursor: String) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
      repositories(
        first: ${REPOS_PAGE_SIZE}
        after: $reposCursor
        ownerAffiliations: OWNER
        isFork: false
        privacy: PUBLIC
      ) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          languages(first: ${LANGUAGES_PER_REPO}, orderBy: { field: SIZE, direction: DESC }) {
            edges {
              size
              node {
                name
                color
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * @param {string} message
 */
function warnAndExit(message) {
  console.warn(`[fetch-github-stats] ${message} — skipping (site will still build).`);
  process.exit(0);
}

/**
 * @param {string | null | undefined} cursor
 * @returns {Promise<{ user: unknown }>}
 */
async function queryGraphQl(cursor) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github+json',
    },
    body: JSON.stringify({
      query: QUERY,
      variables: { login: GITHUB_LOGIN, reposCursor: cursor ?? null },
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub GraphQL API responded with HTTP ${response.status}`);
  }

  const body = await response.json();

  if (Array.isArray(body?.errors) && body.errors.length > 0) {
    const firstMessage = body.errors[0]?.message ?? 'unknown GraphQL error';
    throw new Error(`GitHub GraphQL API returned errors: ${firstMessage}`);
  }

  return body?.data;
}

/**
 * Validates the shape of a single GraphQL page before it is used.
 * @param {unknown} data
 * @returns {data is {
 *   user: {
 *     contributionsCollection: { contributionCalendar: { totalContributions: number, weeks: unknown[] } },
 *     repositories: { pageInfo: { hasNextPage: boolean, endCursor: string | null }, nodes: unknown[] }
 *   }
 * }}
 */
function isValidPage(data) {
  const user = /** @type {any} */ (data)?.user;
  if (!user || typeof user !== 'object') return false;

  const calendar = user.contributionsCollection?.contributionCalendar;
  if (!calendar || typeof calendar.totalContributions !== 'number' || !Array.isArray(calendar.weeks)) {
    return false;
  }

  const repositories = user.repositories;
  if (!repositories || !Array.isArray(repositories.nodes) || typeof repositories.pageInfo !== 'object') {
    return false;
  }

  return true;
}

/**
 * Fetches every page of owned, non-fork, public repositories' language edges.
 * @param {unknown} firstPageData
 * @returns {Promise<Array<{ size: number, node: { name: string, color: string | null } }>>}
 */
async function collectAllLanguageEdges(firstPageData) {
  /** @type {Array<{ size: number, node: { name: string, color: string | null } }>} */
  const edges = [];

  /** @type {unknown} */
  let pageData = firstPageData;
  let pageCount = 0;

  while (isValidPage(pageData) && pageCount < MAX_REPO_PAGES) {
    const repositories = /** @type {any} */ (pageData).user.repositories;

    for (const repo of repositories.nodes) {
      const repoEdges = repo?.languages?.edges;
      if (Array.isArray(repoEdges)) {
        for (const edge of repoEdges) {
          if (
            edge &&
            typeof edge.size === 'number' &&
            edge.node &&
            typeof edge.node.name === 'string'
          ) {
            edges.push({ size: edge.size, node: { name: edge.node.name, color: edge.node.color ?? null } });
          }
        }
      }
    }

    pageCount += 1;

    if (!repositories.pageInfo.hasNextPage) {
      break;
    }

    pageData = await queryGraphQl(repositories.pageInfo.endCursor);
  }

  return edges;
}

async function main() {
  if (!GITHUB_TOKEN) {
    warnAndExit('GITHUB_TOKEN is not set');
    return;
  }

  /** @type {unknown} */
  let firstPageData;
  try {
    firstPageData = await queryGraphQl(null);
  } catch (error) {
    warnAndExit(`GitHub API request failed: ${error instanceof Error ? error.message : String(error)}`);
    return;
  }

  if (!isValidPage(firstPageData)) {
    warnAndExit('GitHub API response did not match the expected shape');
    return;
  }

  let languageEdges;
  try {
    languageEdges = await collectAllLanguageEdges(firstPageData);
  } catch (error) {
    warnAndExit(
      `Failed while paginating repositories: ${error instanceof Error ? error.message : String(error)}`,
    );
    return;
  }

  const { buildStatsPayload } = await import('./github-stats-transform.mjs');

  const payload = buildStatsPayload({
    login: GITHUB_LOGIN,
    generatedAt: new Date().toISOString(),
    calendar: /** @type {any} */ (firstPageData).user.contributionsCollection.contributionCalendar,
    languageEdges,
  });

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, JSON.stringify(payload), 'utf-8');
  console.warn(`[fetch-github-stats] Wrote ${OUTPUT_PATH} (${payload.totalContributions} contributions).`);
}

main().catch((error) => {
  warnAndExit(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
});
