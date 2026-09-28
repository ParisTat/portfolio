# Portfolio: Improvements Backlog

Status as of 2026-09-28. **P0** = do next, **P1** = soon, **P2** = nice to have.
Security items are judged against the ECC security rules (`../.claude/rules/ecc/{common,typescript,react,web}/security.md`).

## Done (PR #1 `fix/security-hardening`, merged 2026-09-27)

Security
- [x] Removed `GEMINI_API_KEY` injection from `vite.config.ts`. It was dead code, but any key set in `.env.local` would have shipped in the public bundle.
- [x] Removed the leftover AI Studio import map (`aistudiocdn.com`) from `index.html`. React is bundled by Vite.
- [x] `.gitignore` ignores `.env` and `.env.*` explicitly.
- [x] `.github/dependabot.yml`: npm weekly, GitHub Actions monthly.
- [x] `npm audit fix`: 3 high `rollup` advisories fixed. Now 0 vulnerabilities.

Quality gaps from `/ecc:agent-sort`
- [x] ESLint 9 flat config (`typescript-eslint`, `react-hooks`, `react-refresh`, `no-console`). 15 findings fixed, lint is clean.
- [x] Vitest + Testing Library + jsdom. Scripts: `test`, `test:watch`, `coverage`, `lint`, `typecheck`.
- [x] `build` now runs `tsc --noEmit` first.
- [x] CI (`deploy.yml`) runs lint and test before building, so a failing test blocks the deploy.
- [x] **Bug fixed (test-first):** the `useCV` fallback read stale state and never fired.

On `fix/cv-download`
- [x] **CV download was broken in production**: the PDF wasn't in the build (it lived outside `public/`) and the URL ignored the `/portfolio/` base, so the button saved GitHub's 404 page as a `.pdf`. Now `assets/documents/cv.pdf` is imported via Vite (`?url`), saved as `Paris_Rafail_Tataridis_CV.pdf`. The runtime HEAD probing, `cvDetector.ts`, `useCV` and the `update-cv` script are gone. Covered by `components/Hero.test.tsx`.
- [x] Removed the dead `<link href="/index.css">` (404 in production).

Stacked PRs (2026-09-28), merged in order
1. `feat/build-tailwind-csp-seo`
   - [x] Build-time Tailwind v4 (`@tailwindcss/vite`) replaces the runtime CDN script.
   - [x] Strict CSP `<meta>` injected at build: no `'unsafe-inline'`, and only the Google Fonts, Web3Forms and GitHub API origins.
   - [x] Images went from 7.7 MB to about 235 KB (WebP).
   - [x] SEO: title, description, OG/Twitter tags, JSON-LD `Person`, `robots.txt`, `sitemap.xml`.
2. `feat/contact-a11y-and-tests`
   - [x] Contact form: linked labels, live regions, validation, honeypot, no plain email in the page.
   - [x] `useGitHubRelease` hardened (abort on unmount, shape and URL validation).
   - [x] `jsx-a11y` lint added.
   - [x] 88 unit tests, with coverage thresholds.
   - [x] Playwright smoke tests run in CI.
3. `feat/github-activity`
   - [x] Heatmap and top languages, built from `public/github-stats.json`. The JSON is fetched at build time with a token scoped to that one CI step, and a weekly rebuild keeps it fresh.
   - [x] Actions pinned to SHAs.
   - [x] Mobile nav now uses the shared nav items.
   - [x] e2e test fails on console errors or CSP violations.

## Security

| Pri | Item | Why |
|-----|------|-----|
| P0 | Turn on GitHub **secret scanning + push protection** (repo Settings → Code security) | Blocks accidental key pushes at the source |
| P1 | Web3Forms dashboard: lock the access key to `paristat.github.io`; add hCaptcha if spam appears | The key is public by design; a domain lock stops reuse elsewhere |
| P1 | After the first deploy: if the Activity section is missing, the built-in token can't read contributions. Add a `STATS_TOKEN` secret (fine-grained PAT, read-only) | The fetch fails soft, so the deploy stays green either way |

## CI

| Pri | Item | Notes |
|-----|------|-------|
| P1 | `ci.yml` on `pull_request` (lint, typecheck, test, build) | Today the checks only run on push to `main`, after merge |
| P1 | Dependabot: group minor/patch updates; `react` + `react-dom` together; ignore `@types/node` majors; group Actions updates. Then `@dependabot recreate` on PRs #2–#10 | Several open PRs are unsafe alone (react-dom without react, `@eslint/js` 10 vs eslint 9, vite 8) |
| P2 | ESLint: lint `scripts/**/*.mjs` (change the glob to `scripts/**/*.{js,mjs}`) | Today the `.mjs` scripts get no rules. They pass cleanly once the glob is widened. The config-protection hook blocks agents from editing `eslint.config.js`, so this is a manual one-line change |

## Features

| Pri | Item | Notes |
|-----|------|-------|
| P1 | **"Building with AI": Claude Code daily-usage graph** | Render a sanitized `claude-usage.json` (daily tokens, sessions, model mix, **no prompts, paths or code**) exported by the planned AI-usage tracker (see `../ai-usage-tracker/IDEA.md`) |
| P2 | Project case-study pages (problem → approach → result) | Stronger than cards alone |
| P2 | EN / GR toggle | Copy the `LanguageContext` pattern from `wedding-site` (never import across repos) |

## Quality, performance, SEO, a11y

| Pri | Item | Notes |
|-----|------|-------|
| P1 | Content fixes: the wedding-site card says Next.js (it's Vite); typos "encorporates", "Hirring"; README is still the template; remove the leftover `metadata.json` | User's copy |
| P2 | a11y audit in a real browser (axe/Lighthouse): contrast, focus order | Lint catches markup issues only |
| P2 | Prettier + a format check in CI | ESLint is in; formatting isn't enforced yet |
