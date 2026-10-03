# Portfolio: Improvements Backlog

Status as of 2026-10-03. **P0** = do next, **P1** = soon, **P2** = nice to have.
Security items are judged against the ECC security rules (`../.claude/rules/ecc/{common,typescript,react,web}/security.md`).

## In review: stacked PRs (2026-09-28)

Three branches, each built on the one before it. `feat/github-activity` is the top of the stack, so it contains all three; test on that branch.

| # | Branch | PR base | What it changes |
|---|--------|---------|-----------------|
| 1 | `feat/build-tailwind-csp-seo` | `main` | Build-time Tailwind v4 (no CDN), strict CSP, SEO tags, images to WebP (7.7 MB to ~235 KB) |
| 2 | `feat/contact-a11y-and-tests` | branch 1 | Accessible contact form, hardened GitHub release fetch, `jsx-a11y`, 88 unit tests, Playwright e2e in CI |
| 3 | `feat/github-activity` | branch 2 | GitHub Activity section (heatmap + languages) from build-time stats, weekly rebuild, SHA-pinned actions |

### What was done (details)

**Branch 1: `feat/build-tailwind-csp-seo`**
- Tailwind v4 is compiled at build time via `@tailwindcss/vite` (`index.css` holds the theme). The `cdn.tailwindcss.com` script and its "should not be used in production" console warning are gone.
- The CSP `<meta>` is injected at build time only (`buildContentSecurityPolicy` in `vite.config.ts`), so `npm run dev` has no CSP.
  - `default-src 'self'`
  - `script-src 'self'`
  - `style-src 'self'` plus Google Fonts
  - `connect-src` allows only Web3Forms and `api.github.com`
  - `object-src 'none'`
  - no `'unsafe-inline'`
- SEO:
  - title "Paris Tataridis — Software Developer", meta description
  - Open Graph/Twitter tags, `og-image`
  - JSON-LD `Person`
  - `robots.txt`, `sitemap.xml`
- Project images are WebP with loading hints.
- Fixes to keep the v3 look:
  - Custom CSS moved into `@layer base/components`. Unlayered CSS had overridden `fixed`, so the header joined the page flow, pushed everything down 64px and stopped sticking.
  - Hero heading `md:leading-none`.
  - Blur sizes (`blur-sm`, `backdrop-blur-xs`).

**Branch 2: `feat/contact-a11y-and-tests`**
- Contact form:
  - labels linked to inputs, error messages under fields, a live status message
  - one hidden honeypot field
  - the email address is no longer printed in the page; the "email me directly" link is built only when clicked
  - the access key is checked before the form enters "Sending"
- `useGitHubRelease`: cancels on unmount, validates the response shape, and accepts only real `github.com` URLs (`utils/githubUrl.ts`).
- `eslint-plugin-jsx-a11y`, with its 4 violations fixed.
- 88 unit tests, coverage thresholds 80/80/80/75.
- Playwright smoke tests (`e2e/`), also run by `deploy.yml` before deploying.

**Branch 3: `feat/github-activity`**
- `scripts/fetch-github-stats.mjs` runs in CI before the build. It queries GitHub GraphQL and writes `public/github-stats.json` (gitignored). With no token, or on any error, it exits 0 and writes nothing.
- Activity section (`components/github-activity/`):
  - a contribution heatmap (53 weeks × 7 days) and a top-languages bar
  - the JSON is validated first (colors must be hex) and the section is hidden if it's missing or invalid
  - the heatmap scrolls sideways on narrow screens and can be focused with the keyboard
- `deploy.yml`:
  - the token is only available to the fetch step
  - a weekly cron (Mon 05:00 UTC) refreshes the stats
  - all actions pinned to commit SHAs
- Fixes:
  - heatmap week layout (weeks had stacked into one column)
  - the mobile menu is built from the shared nav items (it now includes Activity)
  - the duplicate `id="contact"` removed from the footer
- e2e tests added: no console errors or CSP violations on load; the header stays `fixed`.
- Final check suite: lint, typecheck, 111 unit tests (91.8% statements), 6/6 e2e, build. A Sonnet security review found no CRITICAL or HIGH issues.
- Fixes and additions from manual QA (2026-10-03). They all went on this branch to avoid rebasing the stack, so the deploys after PR 1 and PR 2 won't have them until PR 3 merges:
  - Hero buttons stack full width on phones (T1).
  - The web manifest moved to `public/`, so the CSP no longer blocks it (T2).
  - The heatmap fills the card width and opens on the latest weeks on mobile (T3).
  - New back-to-top button (`components/BackToTop.tsx`): appears after 600px, honours reduced motion, and is out of the tab order while hidden.
  - Production builds strip every `console.*` call and `debugger` statement (`esbuild.drop` in `vite.config.ts`, build only). The bundle went from 8 console calls to 0. Messages injected by browser extensions can't be removed by the site.
  - The burger menu's X closes it again (T5). The unused `useClickOutside` hook was removed.
  - Checks: lint, typecheck, 115 unit tests, 7/7 e2e (one new for the mobile menu), build.

### Setup (PowerShell, from `portfolio/`)

```powershell
git switch feat/github-activity
npm ci
npm run build; npm run preview       # http://localhost:4173/portfolio/
```

That's all you need to test. Optional, to run the automated checks yourself (CI runs them anyway before each deploy):
```powershell
npx playwright install chromium      # once per machine; downloads the browser the e2e tests drive
npm run lint; npm run typecheck; npm test; npm run test:e2e
```

Test on **`npm run preview`**, not `npm run dev`: only the production build has the CSP. The contact form uses the real key from `.env.local`, so a successful send delivers a real email to you.

Optional, to see the Activity section locally: create a fine-grained GitHub token (public repositories, read-only). Then:
```powershell
$env:GITHUB_TOKEN = "<token>"; npm run fetch:stats; Remove-Item Env:GITHUB_TOKEN
npm run build; npm run preview
```
Without it, the Activity section is hidden locally. That's expected, and it will appear after the first deploy.

### Manual checklist (preview build, desktop Chrome + DevTools open) — passed 2026-10-03

Page load and security
- [x] Console: no errors and no Tailwind CDN warning. Network tab: no request to `cdn.tailwindcss.com`.
- [x] Elements → `<head>` has `<meta http-equiv="Content-Security-Policy" ...>`. Console shows no "Refused to load/apply" messages.
- [x] Tab title reads "Paris Tataridis — Software Developer".

Header and navigation
- [x] The header sits over the hero at the very top. Hero text starts about 130px from the top, as on the live site.
- [x] Scroll down: the header hides. Scroll up a bit: it comes back with a dark blurred background and stays pinned.
- [x] Desktop nav shows Home · Projects · Activity · Contact. Each scrolls smoothly to its section (Activity only if stats exist; see Known issues).

Hero
- [x] "Building Digital" and the typing word sit close together, as on the live site. The blinking cursor works and the hexagon photo has its glow.
- [x] **Download CV** saves `Paris_Rafail_Tataridis_CV.pdf`, and the file opens in Acrobat.
- [x] "View My Work" scrolls to Projects; "Get In Touch" scrolls to Contact.

Projects
- [x] Both cards show sharp images (WebP), titles, tags, and "Live Website" / "Source Code" links. The links open in a new tab.

Activity (only with stats, locally or after deploy)
- [x] The heading shows "N contributions in the last year". The heatmap is 53 columns × 7 rows, in darker to brighter blue/teal.
- [x] Hovering a cell shows "X contributions on YYYY-MM-DD".
- [x] The language bar has colored segments and a legend with percentages that add up to about 100%.

Contact form
- [x] Click **Send Message** with empty fields. Expect "Please enter your name.", "Please enter your email address." and "Message must be at least 10 characters." under the fields, and nothing sent.
- [x] Email `abc`: expect "Please enter a valid email address."
- [x] Valid data, then send. The button shows "Sending...", then "Thanks! Your message has been sent." appears and the fields clear. The email arrives in your inbox, tagged "Website Contact Request".
- [x] "email me directly" opens your mail app with subject "Website Contact Request". Your address is not visible anywhere in the page text.

Keyboard and accessibility
- [x] Press Tab from the top of the page. Every link, button and field shows a visible focus ring, in a sensible order. The heatmap can be focused and scrolled with the arrow keys on a narrow screen.
- [x] Clicking a field's label focuses that field.
- [x] Scroll down past the hero: a round arrow button fades in at the bottom right. Clicking it scrolls smoothly to the top and it fades out. It's skipped by Tab while hidden.

Mobile (DevTools device toolbar, 375 × 800)
- [x] No sideways page scroll. The hero stacks (text, then photo). The heatmap scrolls sideways inside its card only.
- [x] Burger menu: opens from the right with Home / Projects / Activity / Contact. A link closes the menu and scrolls. **The X**, Esc, or a tap outside closes it. (Re-tested after the T5 fix.)

Optional
- [ ] Lighthouse (DevTools → Lighthouse, mobile): Performance should be higher than on the live site thanks to the images; SEO and Accessibility 90+.

### Known issues

See [Bugs](#bugs) at the end of this file. Log anything you find while running the checklist under **Bugs → From testing**.

### Where to commit what

Manual QA passed on 2026-10-03. Everything is committed: the QA fixes, this file and `.env.example` (names only) are all on `feat/github-activity`.

1. **Still open: the ESLint glob (K2).** The ECC config-protection hook blocks agents from editing `eslint.config.js`, so change it by hand and commit it on its own:
   ```powershell
   git add eslint.config.js
   git commit -m "chore: lint .mjs scripts"
   ```
2. **A bug found later** goes on the branch that owns that area. That branch then needs rebasing up the stack (2 onto 1, 3 onto 2). Ask Claude to place and rebase it. Once a branch is pushed, rebasing it means a force-push.
   - Styling, CSP, SEO, images → branch 1
   - Contact form, unit tests → branch 2
   - Activity, nav, CI → branch 3
3. **Push and open PRs:**
   - Push: `git push -u origin feat/build-tailwind-csp-seo feat/contact-a11y-and-tests feat/github-activity`
   - Open the PRs in order with the bases from the table above.
   - Merge with **"Create a merge commit"** (not squash), one at a time, and delete each branch after merging. GitHub then retargets the next PR to `main`.
   - Every merge deploys.

### After each merge (production, https://paristat.github.io/portfolio/)
- [ ] The Actions run is green (lint, test, e2e, fetch stats, build, deploy).
- [ ] Hard refresh (Ctrl+F5): no console errors, the header sticks, the CV downloads.
- [ ] After PR 3: the Activity section appears. If it doesn't, add a `STATS_TOKEN` repo secret (fine-grained PAT, read-only) and re-run the workflow.
- [ ] Share the URL in a chat app, or use an OG preview tool: the title, description and og-image show up.

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

## Bugs

Owning branch: 1 = `feat/build-tailwind-csp-seo`, 2 = `feat/contact-a11y-and-tests`, 3 = `feat/github-activity` (or `main` once merged).

### Known

| # | Bug | Impact | Proposed fix | Branch | Status |
|---|-----|--------|--------------|--------|--------|
| K1 | If `github-stats.json` is missing, the Activity section hides but the **Activity nav link stays** and does nothing when clicked. This happens locally without a token, and in production if the CI fetch fails | Dead nav link (desktop and mobile). On GitHub Pages the missing file also logs a 404 in the console | Hide the nav item when there are no stats, or always render a small "Activity unavailable" section | 3 | Open |
| K2 | `eslint.config.js` only lints `scripts/**/*.js`, so `scripts/*.mjs` get no lint rules | Lint gap only; the scripts pass once included | Change the glob to `scripts/**/*.{js,mjs}` by hand (the ECC config-protection hook blocks agents from editing it) | 3 | Open |
| K3 | After a failed submit, focus stays on the Send button instead of moving to the first field with an error | Minor a11y: screen-reader users hear each error only when they reach that field | Focus the first invalid field on submit | 2 | Open |

### From testing

Add a row for anything the manual checklist turns up: what you did, what you expected, what happened, and the browser/viewport.

| # | Steps | Expected | Actual | Browser / viewport | Branch | Status |
|---|-------|----------|--------|--------------------|--------|--------|
| T1 | Open the hero at phone width | Buttons readable | The three hero buttons squeeze into one row and wrap to 2–3 lines each | Chrome, 375 px | 3 | Fixed: stacked full width below `sm`, one row above |
| T2 | Load the preview build with the console open | No errors | CSP blocks the web manifest: Vite inlined the 263-byte file as a `data:` URL, and its icon paths ignored the `/portfolio/` base | Chrome, desktop | 3 | Fixed: manifest + Android icons moved to `public/`, relative icon paths, name and theme colour filled in |
| T3 | View the Activity section on desktop | Heatmap fills the card | Fixed 11 px cells fill only about half the card; on mobile the grid opened on the oldest weeks | Chrome, 2560 px and 375 px | 3 | Fixed: square cells stretch to fill (10 px minimum, then scroll); opens scrolled to the latest weeks |
| T5 | Phone width: open the burger menu, tap the X | Menu closes | Menu stays open. A document-level click-outside listener closed it on mousedown, then the X's click toggled it open again. On `main` (Tailwind v3) `z-60` wasn't a real class, so the X sat under the backdrop and the tap closed the menu through the backdrop; v4 made `z-60` valid and exposed the bug | Chrome, 375 px | 3 | Fixed: listener removed, and the backdrop now really handles taps outside. It was `inset-0`, but the header's translate/backdrop-blur made it cover only the header strip, so it's now `w-screen h-screen`. Panel given `z-50` above the backdrop; mobile/desktop navs labelled. Unit test with real pointer events and a Playwright test that taps the X and a panel link |
| T4 | `Should not init.` / `Should not init page.` in the console | — | Comes from a browser extension, not the site (the text isn't in the repo or the build) | Brave | — | Not a bug |
