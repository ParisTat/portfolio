# Portfolio: Project CLAUDE.md

Follows the workspace `../CLAUDE.md` (Prompt Defense Baseline, model routing, team workflow). This file adds repo specifics.

## Project Overview

Personal developer portfolio of Paris Tataridis. Single-page React 19 + TypeScript app built with Vite,
deployed to GitHub Pages at `https://paristat.github.io/portfolio/`. Contact form posts to Web3Forms.

## Critical Rules

### 1. Code Organization

- Many small files over few large files; 200-400 lines typical, 800 max
- Sections live in `components/`, one component per file

### 2. Code Style

- Immutability always; no `console.log` in production code
- Tailwind v4, built at compile time via `@tailwindcss/vite` (`index.css` holds the theme). No CDN
- ESLint includes `jsx-a11y`; an inline disable needs a `-- reason`

### 3. Testing

- Vitest + Testing Library (jsdom). Coverage thresholds live in `vitest.config.ts` (80/80/80/75)
- Playwright smoke tests in `e2e/` build and serve the site, then check the page, the CV link, the contact form (Web3Forms mocked), and that there are no console errors or CSP violations
- jsdom can't catch layout bugs: check visual changes in a real browser (`npm run preview`)
- `npm run lint && npm run typecheck && npm test && npm run build` must pass before any commit

### 4. Security

- ECC security rules apply (`../.claude/rules/ecc/*/security.md`)
- This is a public static site: everything in the bundle is public. Only `VITE_*` values reach the client, and never put a private key in one
- GitHub Pages can't set HTTP headers. The CSP `<meta>` is injected at build time only (`buildContentSecurityPolicy` in `vite.config.ts`), so dev/HMR is unaffected. A new external origin (API, font, image) must be added there, or the browser blocks it
- No `'unsafe-inline'`: use React `style` props (applied via the CSSOM), never inline `<style>`/`<script>`
- `vite.config.ts` must not inject env vars via `define`
- The stats token (`STATS_TOKEN` or `GITHUB_TOKEN`) is scoped to the `fetch:stats` step in `deploy.yml` only; never widen it to the job

## File Structure

```
App.tsx, index.tsx, index.html   # entry
components/                      # page sections (Hero, ProjectsSection, ProjectCard, ContactSection, Footer, ...)
components/github-activity/      # heatmap + language bar, rendered from public/github-stats.json
config/                          # project/CV data
hooks/, utils/                   # shared logic
assets/                          # images, favicons; CV is always assets/documents/cv.pdf
public/                          # robots.txt, sitemap.xml, og-image; github-stats.json is generated (gitignored)
scripts/fetch-github-stats.mjs   # build-time GitHub GraphQL fetch; fails soft (no file = section hidden)
e2e/                             # Playwright smoke tests
.github/workflows/deploy.yml     # lint, test, e2e, fetch stats, build, deploy to Pages; on push to main + weekly cron
```

## Environment Variables

```bash
# Required (local: .env.local, CI: GitHub Actions secret of the same name)
VITE_WEB3FORMS_ACCESS_KEY=   # public by design; lock to the domain in the Web3Forms dashboard

# Optional, CI only (repo secret). Used only if the built-in GITHUB_TOKEN can't read contributions
STATS_TOKEN=                 # fine-grained PAT, read-only, no repo access needed
```

## Available Commands

- `npm run dev` / `npm run build` / `npm run preview`
- `npm run lint` / `npm run typecheck` / `npm test` / `npm run coverage`
- `npm run test:e2e` (first time: `npx playwright install chromium`)
- `npm run fetch:stats` (needs `GITHUB_TOKEN` in the shell; without it, it exits 0 and writes nothing)
- Update the CV: overwrite `assets/documents/cv.pdf` and commit (`docs: update CV`); the download name lives in `config/cvConfig.ts`
- `/ecc:plan`, `/ecc:react-test`, `/ecc:react-review`, `/ecc:build-fix`

## Git Workflow

- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`
- Never commit to main directly. **Pushing to `main` deploys to production.**
- All checks must pass before merge
