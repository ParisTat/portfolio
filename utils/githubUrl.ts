/**
 * Shared helpers for safely trusting GitHub URLs.
 *
 * Both the release hook and the APK download fallback need to turn a
 * user-configured "repo URL" into an owner/repo pair, and both need to
 * confirm a URL genuinely points at github.com before it is used as a link
 * href. Centralizing the parsing avoids two slightly different (and
 * potentially spoofable) regex checks drifting apart.
 */

export interface GithubRepoRef {
  owner: string;
  repo: string;
}

const GITHUB_HOST = 'github.com';

/**
 * Parses a GitHub repository URL, requiring the exact shape
 * `https://github.com/<owner>/<repo>`. Returns null for any other protocol,
 * host, or path (including github.com subdomains, which are never a project
 * repo page).
 */
export function parseGithubRepoUrl(value: string): GithubRepoRef | null {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (url.protocol !== 'https:' || url.hostname !== GITHUB_HOST) {
    return null;
  }

  const [owner, repo] = url.pathname.split('/').filter(Boolean);
  if (!owner || !repo) {
    return null;
  }

  return { owner, repo };
}

/**
 * True when `value` is an `https://github.com/...` URL. Used to validate
 * release asset download URLs before they are trusted as a link href -
 * exact host only, no subdomains.
 */
export function isGithubHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === GITHUB_HOST;
  } catch {
    return false;
  }
}
