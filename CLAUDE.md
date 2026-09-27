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
- Tailwind classes (currently via CDN `tailwind.config` in `index.html`)

### 3. Testing

- No test setup yet. New work adds Vitest + Testing Library; critical flow (contact form) gets a Playwright test
- `npm run build` must pass before any commit

### 4. Security

- ECC security rules apply (`../.claude/rules/ecc/*/security.md`)
- This is a public static site: everything in the bundle is public. Only `VITE_*` values reach the client, and never put a private key in one
- GitHub Pages can't set HTTP headers: use a `<meta>` CSP, and avoid new third-party scripts
- `vite.config.ts` must not inject env vars via `define`

## File Structure

```
App.tsx, index.tsx, index.html   # entry
components/                      # page sections (Hero, ProjectsSection, ProjectCard, ContactSection, Footer, ...)
config/                          # project/CV data
hooks/, utils/                   # shared logic
assets/                          # images, favicons; CV is always assets/documents/cv.pdf
.github/workflows/deploy.yml     # build + deploy to Pages on push to main
```

## Environment Variables

```bash
# Required (local: .env.local, CI: GitHub Actions secret of the same name)
VITE_WEB3FORMS_ACCESS_KEY=   # public by design; lock to the domain in the Web3Forms dashboard
```

## Available Commands

- `npm run dev` / `npm run build` / `npm run preview`
- Update the CV: overwrite `assets/documents/cv.pdf` and commit (`docs: update CV`); the download name lives in `config/cvConfig.ts`
- `/ecc:plan`, `/ecc:react-test`, `/ecc:react-review`, `/ecc:build-fix`

## Git Workflow

- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`
- Never commit to main directly. **Pushing to `main` deploys to production.**
- All checks must pass before merge
