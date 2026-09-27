// @vitest-environment node
//
// Importing vite.config.ts pulls in `vite` and `@tailwindcss/vite`, which use
// esbuild under the hood. esbuild's environment invariant check fails inside
// jsdom (its TextEncoder output isn't a real Uint8Array), so this suite runs
// under the plain Node environment instead of the project-wide jsdom default.
import { describe, expect, test } from 'vitest';
import { buildContentSecurityPolicy } from './vite.config';

describe('buildContentSecurityPolicy', () => {
  const csp = buildContentSecurityPolicy();

  test('restricts default-src and script-src to self, with no unsafe directives', () => {
    const scriptSrc = csp.split('; ').find((directive) => directive.startsWith('script-src'));

    expect(csp).toContain("default-src 'self'");
    expect(scriptSrc).toBe("script-src 'self'");
    expect(scriptSrc).not.toContain('unsafe-inline');
    expect(scriptSrc).not.toContain('unsafe-eval');
  });

  test('allows Google Fonts for styles and fonts only', () => {
    expect(csp).toContain('style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com');
    expect(csp).toContain("font-src 'self' https://fonts.gstatic.com");
  });

  test('allows the contact form and GitHub release APIs via connect-src', () => {
    expect(csp).toContain("connect-src 'self' https://api.web3forms.com https://api.github.com");
  });

  test('blocks plugins and restricts base/form targets', () => {
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self' https://api.web3forms.com");
  });

  test('upgrades insecure requests', () => {
    expect(csp).toContain('upgrade-insecure-requests');
  });
});
