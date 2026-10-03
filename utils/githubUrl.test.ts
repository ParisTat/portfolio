import { describe, expect, it } from 'vitest';
import { isGithubHttpsUrl, parseGithubRepoUrl } from './githubUrl';

describe('parseGithubRepoUrl', () => {
  it('extracts owner and repo from a valid github.com URL', () => {
    expect(parseGithubRepoUrl('https://github.com/octocat/hello-world')).toEqual({
      owner: 'octocat',
      repo: 'hello-world',
    });
  });

  it('ignores extra path segments after owner/repo', () => {
    expect(parseGithubRepoUrl('https://github.com/octocat/hello-world/releases/latest')).toEqual({
      owner: 'octocat',
      repo: 'hello-world',
    });
  });

  it('rejects a non-https protocol', () => {
    expect(parseGithubRepoUrl('http://github.com/octocat/hello-world')).toBeNull();
  });

  it('rejects a github.com subdomain', () => {
    expect(parseGithubRepoUrl('https://gist.github.com/octocat/hello-world')).toBeNull();
  });

  it('rejects a lookalike host', () => {
    expect(parseGithubRepoUrl('https://github.com.evil.example/octocat/hello-world')).toBeNull();
  });

  it('rejects a URL missing the repo segment', () => {
    expect(parseGithubRepoUrl('https://github.com/octocat')).toBeNull();
  });

  it('rejects an unparsable string', () => {
    expect(parseGithubRepoUrl('not-a-url')).toBeNull();
  });

  it('rejects the empty string', () => {
    expect(parseGithubRepoUrl('')).toBeNull();
  });
});

describe('isGithubHttpsUrl', () => {
  it('accepts an https github.com URL', () => {
    expect(isGithubHttpsUrl('https://github.com/octocat/hello-world/releases/download/v1/app.apk')).toBe(true);
  });

  it('rejects http (non-https)', () => {
    expect(isGithubHttpsUrl('http://github.com/octocat/hello-world')).toBe(false);
  });

  it('rejects a github.com subdomain', () => {
    expect(isGithubHttpsUrl('https://objects.githubusercontent.com/app.apk')).toBe(false);
  });

  it('rejects a lookalike host', () => {
    expect(isGithubHttpsUrl('https://evil.example.com/github.com/app.apk')).toBe(false);
  });

  it('rejects an unparsable string', () => {
    expect(isGithubHttpsUrl('not-a-url')).toBe(false);
  });
});
