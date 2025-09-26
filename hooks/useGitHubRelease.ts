import { useState, useEffect } from 'react';

interface GitHubRelease {
  tag_name: string;
  assets: Array<{
    name: string;
    browser_download_url: string;
  }>;
}

export const useGitHubRelease = (repoUrl: string) => {
  const [release, setRelease] = useState<GitHubRelease | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelease = async () => {
      try {
        setLoading(true);
        // Extract owner and repo from GitHub URL
        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!match) {
          throw new Error('Invalid GitHub repository URL');
        }
        
        const [, owner, repo] = match;
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch release data');
        }
        
        const data = await response.json();
        setRelease(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (repoUrl) {
      fetchRelease();
    }
  }, [repoUrl]);

  return { release, loading, error };
};
