# Portfolio

Personal developer portfolio of Paris Tataridis, live at <https://paristat.github.io/portfolio/>.
It is a single-page site with a hero, featured projects, GitHub activity, a CV download and a contact form.

## Stack

- React 19 and TypeScript, built with Vite
- Tailwind CSS v4 (compiled at build time via `@tailwindcss/vite`)
- Vitest and Testing Library for unit tests, Playwright for smoke tests
- Contact form posts to [Web3Forms](https://web3forms.com/)
- GitHub activity data is fetched at build time (`scripts/fetch-github-stats.mjs`)

## Getting started

```bash
npm ci
cp .env.example .env.local   # then set VITE_WEB3FORMS_ACCESS_KEY
npm run dev
```

The contact form needs `VITE_WEB3FORMS_ACCESS_KEY` (a public key, locked to the site domain in the Web3Forms dashboard).

## Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the dev server |
| `npm run build` | Typecheck, then build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Unit tests (Vitest) |
| `npm run coverage` | Unit tests with coverage thresholds |
| `npm run test:e2e` | Playwright smoke tests (first run: `npx playwright install chromium`) |
| `npm run fetch:stats` | Fetch GitHub stats (needs `GITHUB_TOKEN`) |

## Structure

- `components/` page sections and cards
- `config/` CV config (`cvConfig.ts`); the project cards are in `components/ProjectsSection.tsx`
- `hooks/`, `utils/` shared logic
- `assets/` images, favicons and the CV (`assets/documents/cv.pdf`)
- `e2e/` Playwright tests

## Deploy

Pushing to `main` runs lint, tests, e2e, fetches the stats, builds and deploys to GitHub Pages
(`.github/workflows/deploy.yml`). Pull requests run the same checks without deploying (`ci.yml`).

For repo rules and gotchas see `CLAUDE.md`.
