import { useEffect, useState } from 'react';
import { parseGitHubStats } from './parseGitHubStats';
import type { GitHubStats } from './types';

export type GitHubStatsState =
  | { status: 'loading' }
  | { status: 'success'; data: GitHubStats }
  | { status: 'error' };

/**
 * Fetches the build-time github-stats.json snapshot and validates it before exposing it.
 * Resolves to an error state (never throws) when the file is missing, not JSON, or fails
 * the type guard — callers should render nothing in that case.
 */
export function useGitHubStats(): GitHubStatsState {
  const [state, setState] = useState<GitHubStatsState>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}github-stats.json`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          setState({ status: 'error' });
          return;
        }

        const json: unknown = await response.json();
        const parsed = parseGitHubStats(json);

        if (parsed === null) {
          setState({ status: 'error' });
          return;
        }

        setState({ status: 'success', data: parsed });
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setState({ status: 'error' });
      }
    };

    void load();

    return () => controller.abort();
  }, []);

  return state;
}
