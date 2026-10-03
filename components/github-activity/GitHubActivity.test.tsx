import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import GitHubActivity from './GitHubActivity';
import { githubStatsFixture } from './__fixtures__/githubStatsFixture';

function mockFetchOnce(response: { ok: boolean; status?: number; json?: () => Promise<unknown> }) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: response.ok,
    status: response.status ?? (response.ok ? 200 : 404),
    json: response.json ?? (() => Promise.resolve(undefined)),
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('GitHubActivity', () => {
  it('renders the heatmap and languages from a fetched fixture', async () => {
    mockFetchOnce({ ok: true, json: () => Promise.resolve(githubStatsFixture) });

    render(<GitHubActivity />);

    expect(await screen.findByRole('heading', { name: /GitHub Activity/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /15 contributions in the last year/i })).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('65%')).toBeInTheDocument();
  });

  it('renders nothing when the stats file 404s', async () => {
    mockFetchOnce({ ok: false, status: 404 });

    const { container } = render(<GitHubActivity />);

    await waitFor(() => expect(container).toBeEmptyDOMElement());
    expect(screen.queryByRole('heading', { name: /GitHub Activity/i })).not.toBeInTheDocument();
  });

  it('renders nothing when the JSON fails the shape guard', async () => {
    mockFetchOnce({ ok: true, json: () => Promise.resolve({ not: 'valid' }) });

    const { container } = render(<GitHubActivity />);

    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it('aborts the in-flight fetch on unmount', async () => {
    let capturedSignal: AbortSignal | undefined;
    const fetchMock = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
      capturedSignal = init?.signal ?? undefined;
      return new Promise(() => {
        // never resolves — simulates an in-flight request at unmount time
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const { unmount } = render(<GitHubActivity />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(capturedSignal?.aborted).toBe(false);

    unmount();

    expect(capturedSignal?.aborted).toBe(true);
  });
});
