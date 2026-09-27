import { useState, useEffect } from 'react';

interface GitHubReleaseAsset {
  name: string;
  browser_download_url: string;
}

interface GitHubRelease {
  tag_name: string;
  assets: GitHubReleaseAsset[];
}

function isAbortError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'name' in err &&
    (err as { name?: unknown }).name === 'AbortError'
  );
}

function isGithubHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && (url.hostname === 'github.com' || url.hostname.endsWith('.github.com'));
  } catch {
    return false;
  }
}

function isValidAsset(asset: unknown): asset is GitHubReleaseAsset {
  if (!asset || typeof asset !== 'object') return false;
  const candidate = asset as { name?: unknown; browser_download_url?: unknown };
  return (
    typeof candidate.name === 'string' &&
    typeof candidate.browser_download_url === 'string' &&
    isGithubHttpsUrl(candidate.browser_download_url)
  );
}

function isValidRelease(data: unknown): data is GitHubRelease {
  if (!data || typeof data !== 'object') return false;
  const candidate = data as { tag_name?: unknown; assets?: unknown };
  if (typeof candidate.tag_name !== 'string') return false;
  if (!Array.isArray(candidate.assets)) return false;
  return candidate.assets.every(isValidAsset);
}

export const useGitHubRelease = (repoUrl: string) => {
  const [release, setRelease] = useState<GitHubRelease | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    // All state updates for this run live inside this async function (rather than
    // directly in the effect body) so a URL change synchronously resets error/release
    // exactly once per run instead of cascading through multiple renders.
    const fetchRelease = async () => {
      setError(null);
      setRelease(null);

      if (!repoUrl) {
        setLoading(false);
        return;
      }

      // Extract owner and repo from GitHub URL
      const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) {
        setError('Invalid GitHub repository URL');
        setLoading(false);
        return;
      }

      const [, owner, repo] = match;
      setLoading(true);
      try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to fetch release data');
        }

        const data: unknown = await response.json();
        if (!isActive) return;

        if (!isValidRelease(data)) {
          setError('Received an unexpected release format from GitHub');
          setRelease(null);
          return;
        }

        setRelease(data);
      } catch (err) {
        if (!isActive || isAbortError(err)) return;
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        if (isActive) setLoading(false);
      }
    };

    fetchRelease();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [repoUrl]);

  return { release, loading, error };
};
