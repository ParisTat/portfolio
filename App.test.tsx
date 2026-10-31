import { act, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { githubStatsFixture } from './components/github-activity/__fixtures__/githubStatsFixture';

interface StatsResponse {
  ok: boolean;
  status?: number;
  json?: () => Promise<unknown>;
}

const STATS_URL = `${import.meta.env.BASE_URL}github-stats.json`;
// ProjectCard looks up the latest GitHub release of the TalentPool project on load.
const RELEASE_API_PREFIX = 'https://api.github.com/repos/';

// Answers the stats snapshot request with `stats`. The GitHub release lookup fails like a network
// error, which the card tolerates. Any other URL throws to surface an unexpected fetch.
function stubFetch(stats: StatsResponse | 'pending') {
  const fetchMock = vi.fn((input: RequestInfo | URL) => {
    const url = String(input);
    if (url.startsWith(RELEASE_API_PREFIX)) {
      return Promise.reject(new TypeError('Failed to fetch'));
    }
    if (url !== STATS_URL) {
      throw new Error(`Unexpected fetch: ${url}`);
    }
    if (stats === 'pending') return new Promise<Response>(() => {});
    return Promise.resolve({
      ok: stats.ok,
      status: stats.status ?? (stats.ok ? 200 : 404),
      json: stats.json ?? (() => Promise.resolve(undefined)),
    } as Response);
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

// The stats hook must have run exactly once, and apart from the release lookup nothing else
// may have been fetched (a throwing stub alone could be swallowed by a hook's catch).
function expectOnlyStatsRequested(fetchMock: ReturnType<typeof stubFetch>) {
  const urls = fetchMock.mock.calls.map(([input]) => String(input));
  expect(urls.filter((url) => !url.startsWith(RELEASE_API_PREFIX))).toEqual([STATS_URL]);
}

async function settle() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

function getNavs() {
  return {
    desktop: screen.getByRole('navigation', { name: 'Main' }),
    mobile: screen.getByRole('navigation', { name: 'Mobile' }),
  };
}

beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('App activity section and nav link', () => {
  it('shows the Activity section and its nav link in both navs when the stats are valid', async () => {
    stubFetch({ ok: true, json: () => Promise.resolve(githubStatsFixture) });

    render(<App />);

    expect(await screen.findByRole('heading', { name: /GitHub Activity/i })).toBeInTheDocument();
    const { desktop, mobile } = getNavs();
    expect(within(desktop).getByRole('link', { name: 'Activity' })).toHaveAttribute('href', '#activity');
    expect(within(mobile).getByRole('link', { name: 'Activity' })).toHaveAttribute('href', '#activity');
  });

  it('hides the section and the nav link in both navs when the stats file is missing', async () => {
    const fetchMock = stubFetch({ ok: false, status: 404 });

    render(<App />);
    await settle();

    expectOnlyStatsRequested(fetchMock);
    expect(screen.queryByRole('heading', { name: /GitHub Activity/i })).not.toBeInTheDocument();
    const { desktop, mobile } = getNavs();
    expect(within(desktop).queryByRole('link', { name: 'Activity' })).not.toBeInTheDocument();
    expect(within(mobile).queryByRole('link', { name: 'Activity' })).not.toBeInTheDocument();
  });

  it('hides the section and the nav link in both navs when the stats JSON is invalid', async () => {
    const fetchMock = stubFetch({ ok: true, json: () => Promise.resolve({ not: 'valid' }) });

    render(<App />);
    await settle();

    expectOnlyStatsRequested(fetchMock);
    expect(screen.queryByRole('heading', { name: /GitHub Activity/i })).not.toBeInTheDocument();
    const { desktop, mobile } = getNavs();
    expect(within(desktop).queryByRole('link', { name: 'Activity' })).not.toBeInTheDocument();
    expect(within(mobile).queryByRole('link', { name: 'Activity' })).not.toBeInTheDocument();
  });

  it('keeps the nav link hidden while the stats are still loading', async () => {
    const fetchMock = stubFetch('pending');

    render(<App />);
    await settle();

    expectOnlyStatsRequested(fetchMock);
    const { desktop, mobile } = getNavs();
    expect(within(desktop).queryByRole('link', { name: 'Activity' })).not.toBeInTheDocument();
    expect(within(mobile).queryByRole('link', { name: 'Activity' })).not.toBeInTheDocument();
  });

  it('requests the stats snapshot once for the section and the nav together', async () => {
    const fetchMock = stubFetch({ ok: true, json: () => Promise.resolve(githubStatsFixture) });

    render(<App />);
    await screen.findByRole('heading', { name: /GitHub Activity/i });

    expectOnlyStatsRequested(fetchMock);
  });
});
