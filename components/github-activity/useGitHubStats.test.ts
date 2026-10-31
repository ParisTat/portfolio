import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useGitHubStats } from './useGitHubStats';
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
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('useGitHubStats', () => {
  it('starts in the loading state', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));

    const { result } = renderHook(() => useGitHubStats());

    expect(result.current).toEqual({ status: 'loading' });
  });

  it('resolves to success with the parsed stats', async () => {
    const fetchMock = mockFetchOnce({ ok: true, json: () => Promise.resolve(githubStatsFixture) });

    const { result } = renderHook(() => useGitHubStats());

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current).toEqual({ status: 'success', data: githubStatsFixture });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('resolves to error when the stats file 404s', async () => {
    mockFetchOnce({ ok: false, status: 404 });

    const { result } = renderHook(() => useGitHubStats());

    await waitFor(() => expect(result.current.status).toBe('error'));
  });

  it('resolves to error when the JSON fails the shape guard', async () => {
    mockFetchOnce({ ok: true, json: () => Promise.resolve({ not: 'valid' }) });

    const { result } = renderHook(() => useGitHubStats());

    await waitFor(() => expect(result.current.status).toBe('error'));
  });

  it('resolves to error when the response is not JSON', async () => {
    mockFetchOnce({ ok: true, json: () => Promise.reject(new SyntaxError('Unexpected token <')) });

    const { result } = renderHook(() => useGitHubStats());

    await waitFor(() => expect(result.current.status).toBe('error'));
  });

  it('resolves to error when the network request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    const { result } = renderHook(() => useGitHubStats());

    await waitFor(() => expect(result.current.status).toBe('error'));
  });

  it('aborts the in-flight fetch on unmount', async () => {
    let capturedSignal: AbortSignal | undefined;
    const fetchMock = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
      capturedSignal = init?.signal ?? undefined;
      return new Promise(() => {
        // never resolves: simulates an in-flight request at unmount time
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const { unmount } = renderHook(() => useGitHubStats());

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(capturedSignal?.aborted).toBe(false);

    unmount();

    expect(capturedSignal?.aborted).toBe(true);
  });
});
