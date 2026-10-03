import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useGitHubRelease } from './useGitHubRelease';

const VALID_URL = 'https://github.com/octocat/hello-world';

function githubResponse(overrides: Partial<{ tag_name: unknown; assets: unknown }> = {}) {
  return {
    ok: true,
    json: async () => ({
      tag_name: 'v1.0.0',
      assets: [
        {
          name: 'app.apk',
          browser_download_url: 'https://github.com/octocat/hello-world/releases/download/v1.0.0/app.apk',
        },
      ],
      ...overrides,
    }),
  };
}

describe('useGitHubRelease', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('fetches and returns a valid release', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(githubResponse()));

    const { result } = renderHook(() => useGitHubRelease(VALID_URL));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.release?.tag_name).toBe('v1.0.0');
    expect(result.current.release?.assets).toHaveLength(1);
  });

  it('sets an error and never calls fetch for an invalid GitHub URL', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const { result } = renderHook(() => useGitHubRelease('not-a-github-url'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Invalid GitHub repository URL');
    expect(result.current.release).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('sets an error on a non-OK HTTP response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }));

    const { result } = renderHook(() => useGitHubRelease(VALID_URL));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Failed to fetch release data');
    expect(result.current.release).toBeNull();
  });

  it('rejects a malformed payload instead of trusting it', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(githubResponse({ assets: 'not-an-array' })));

    const { result } = renderHook(() => useGitHubRelease(VALID_URL));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toMatch(/unexpected release format/i);
    expect(result.current.release).toBeNull();
  });

  it('rejects assets whose download url is not an https github.com host', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        githubResponse({
          assets: [{ name: 'app.apk', browser_download_url: 'https://evil.example.com/app.apk' }],
        })
      )
    );

    const { result } = renderHook(() => useGitHubRelease(VALID_URL));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toMatch(/unexpected release format/i);
    expect(result.current.release).toBeNull();
  });

  it('aborts the in-flight request on unmount', () => {
    let capturedSignal: AbortSignal | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, init?: RequestInit) => {
        capturedSignal = init?.signal ?? undefined;
        return new Promise(() => {
          // never resolves; unmount should abort instead of resolving into state
        });
      })
    );

    const { unmount } = renderHook(() => useGitHubRelease(VALID_URL));

    expect(capturedSignal?.aborted).toBe(false);
    unmount();
    expect(capturedSignal?.aborted).toBe(true);
  });

  it('resets a previous error once the URL changes to a valid one', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, json: async () => ({}) })
      .mockResolvedValueOnce(githubResponse());
    vi.stubGlobal('fetch', fetchMock);

    const { result, rerender } = renderHook(({ url }) => useGitHubRelease(url), {
      initialProps: { url: VALID_URL },
    });

    await waitFor(() => expect(result.current.error).toBe('Failed to fetch release data'));

    rerender({ url: 'https://github.com/octocat/another-repo' });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.release?.tag_name).toBe('v1.0.0');
  });
});
