# Portfolio: Improvements Backlog

Status as of 2026-09-27. **P0** = do next, **P1** = soon, **P2** = nice to have.
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

## Security

| Pri | Item | Why |
|-----|------|-----|
| P0 | Turn on GitHub **secret scanning + push protection** (repo Settings → Code security) | Blocks accidental key pushes at the source |
| P1 | Replace runtime `cdn.tailwindcss.com` with build-time Tailwind (`@tailwindcss/vite`) | Removes a third-party runtime script (ECC web rule: no unnecessary third-party scripts) and makes a strict CSP possible |
| P1 | Add a CSP `<meta http-equiv="Content-Security-Policy">`, since GitHub Pages can't set headers | Limits XSS impact. Allow `self`, Google Fonts, `api.web3forms.com`, `api.github.com` |
| P1 | Web3Forms dashboard: lock the access key to `paristat.github.io`; add hCaptcha if spam appears | The key is public by design; a domain lock stops reuse elsewhere |
| P2 | Pin `actions/*` in `deploy.yml` to commit SHAs | Supply-chain hardening for the deploy pipeline |
| P2 | Drop the plain email from page text and hidden inputs | Scraper spam; the form already delivers to it |

## Features

| Pri | Item | Notes |
|-----|------|-------|
| P1 | **GitHub activity graph** (contributions heatmap + top languages) | Fetch at **build time** in Actions with the built-in `GITHUB_TOKEN` (GraphQL) → `public/github-stats.json` → render client-side. No token in the browser, no rate limits for visitors |
| P1 | **"Building with AI": Claude Code daily-usage graph** | Render a sanitized `claude-usage.json` (daily tokens, sessions, model mix, **no prompts, paths or code**) exported by the planned AI-usage tracker (see `../ai-usage-tracker/IDEA.md`) |
| P2 | Project case-study pages (problem → approach → result) | Stronger than cards alone |
| P2 | EN / GR toggle | Copy the `LanguageContext` pattern from `wedding-site` (never import across repos) |

## Quality, performance, SEO, a11y

| Pri | Item | Notes |
|-----|------|-------|
| P0 | Compress background images: `bg-blackhole-website-section.jpg` is **5.5 MB**, `bg-wedding-site-section.webp` 1.7 MB | AVIF/WebP ≤ 300 KB + `srcset`; biggest load-time win (ECC web performance rules) |
| P1 | More tests: `ContactSection` (validation and error states), `useGitHubRelease`; one Playwright smoke test in CI | Workspace target is 80% coverage; currently only the Hero CV link is tested |
| P1 | SEO: real `<title>`, meta description, Open Graph/Twitter tags, `sitemap.xml`, `robots.txt`, JSON-LD `Person` | Title is still "Developer Portfolio" |
| P1 | a11y: contact-form `<label>`s aren't linked to inputs (`htmlFor`/`id`); check focus styles and contrast | |
| P2 | Prettier + a format check in CI | ESLint is in; formatting isn't enforced yet |
