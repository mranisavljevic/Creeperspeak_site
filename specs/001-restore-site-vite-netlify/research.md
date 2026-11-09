# Research: Restore Site with Vite, Netlify (build/preview) and Firebase (production)

Reference projects: `../comk` and `../PracticeEnglish`. User direction: use the same
Vite / Netlify / GitHub / Firebase deploy and test approach as those two.

## R1. What do the reference projects actually do?
- **Findings**
  - `comk`: `package.json` scripts `dev`/`build`/`preview`/`test` (`vite`, `vite build`, `vite preview`, `vitest run`); devDeps `vite ^7`, `vitest ^3`; `vite.config.js` with a `test` block (`environment: 'node'`, `include: ['tests/**/*.test.js']`) and `build.rollupOptions.input` for several HTML files; `.gitignore` (node_modules, dist, logs, .env, editor/OS files); `.firebaserc` + `firebase.json`. GitHub repo is the Netlify source (`DEPLOYMENT.md`: Netlify "Import from Git", build `npm run build`, publish `dist`).
  - `PracticeEnglish`: `netlify.toml` (`[build] command = "npm run build"`, `publish = "dist"`), `.nvmrc`, `.firebaserc` + `firebase.json` (Firebase Hosting for a second host), `docs/DEPLOY.md` (Netlify Import from Git; Firebase custom domain with A/TXT records at registrar; rollback via Netlify "Publish deploy" and Firebase release history), `scripts/deploy-*.sh` that runs `firebase deploy --only hosting`, Vitest for unit/component tests (`npm test`) and Playwright for e2e at a 390x844 phone viewport (`npm run test:e2e`, Chromium + WebKit projects), `.gitignore` adds `.firebase`, `.netlify`, `playwright-report`, `test-results`.
  - Neither project has `.github/workflows` today. In both, GitHub is the source-of-truth repo that Netlify watches; Firebase is deployed with the Firebase CLI.
- **Decision**: Mirror these conventions: same scripts names, `vite ^7` + `vitest` for tests, Playwright (Chromium + WebKit, 390 px viewport) for a small responsive/nav e2e, `netlify.toml` + `.nvmrc`, `.firebaserc` + `firebase.json`, `.gitignore` union, and a `docs/DEPLOY.md`-style deploy guide. Production publishing is automated, unlike the manual `deploy-audio.sh`, because FR-006/FR-012 require it.

## R2. Vite and Node versions
- **Decision**: `vite ^7` (same range as `comk`; `PracticeEnglish` uses ^8 but needs Node >= 22.12). Node 20 (`.nvmrc`=20, `NODE_VERSION=20` in `netlify.toml`); Vite 7 requires >= 20.19, local is 20.20.2.
- **Alternatives**: Vite 8 / Node 22 (rejected: no benefit for a four-page site; changes the baseline relative to `comk`).

## R3. Multi-page and portable paths
- **Decision**: `build.rollupOptions.input` = `index`, `music`, `contact`, `lookmom`, `404` (resolved with `resolve(__dirname, ...)` as in `comk`); `base: './'`. Output keeps `/music.html` etc. (FR-004).
- **Alternatives**: Clean URLs (rejected in clarification); `public/` for everything (rejected: loses hashing).

## R4. Netlify role (build + previews only)
- **Decision**: Git-connected Netlify site; `netlify.toml` with a build command, `publish = "dist"`, Node pin. Branch deploys and Deploy Previews on; Netlify does NOT serve the production domain (constitution VI v3.0.0). `creeperspeak.com` is never added to Netlify.
- **Alternatives**: Netlify serving production (rejected by amendment).

## R5. Netlify -> Firebase hand-off mechanism (resolves TODO FIREBASE_DEPLOY_MECHANISM)
- **Decision**: Do the hand-off **inside the Netlify build**, as the spec assumes. Netlify build command is `npm run build:netlify`, which runs `vite build`, then `vitest run` (checks on `dist/`), then `node scripts/deploy-firebase.mjs`. The script is a no-op unless `CONTEXT=production` and `BRANCH=master`; otherwise it prints "skipping Firebase deploy". In production it writes the service-account JSON from the `FIREBASE_SERVICE_ACCOUNT` env var to a temp file outside the repo, sets `GOOGLE_APPLICATION_CREDENTIALS`, and runs `firebase deploy --only hosting --project <id>` with `firebase-tools` (devDependency, lockfile-pinned). Any non-zero exit fails the Netlify build and the deploy log shows why; Firebase only swaps versions on a successful deploy, so the live site is untouched on failure (FR-012). The same `dist/` that was just built and tested is what ships (constitution VI).
- **Credential**: Google service account with the "Firebase Hosting Admin" role, JSON stored only as a Netlify env var scoped to Production context (FR-013). Not the deprecated `FIREBASE_TOKEN`.
- **Why not a GitHub Action for deploy**: Would be a second CI system, a second build (not the verified output), and the spec fixed Netlify -> Firebase. GitHub is still used for source, PRs and a CI workflow (R6).
- **Side effect to accept**: Netlify also builds and serves production at `<site>.netlify.app`, which duplicates the content. Mitigation: `netlify.toml` sets `X-Robots-Tag: noindex` on all Netlify responses; Firebase serves its own headers, so production is unaffected.
- **Alternatives**: Netlify build plugin for Firebase (rejected: unmaintained third-party code); GitHub Action `FirebaseExtended/action-hosting-deploy` (rejected as above); manual `firebase deploy` (rejected: FR-006).

## R6. Tests (same as the reference projects)
- **Decision**:
  - `npm test` = `vitest run`. Tests under `tests/unit/` read the built `dist/` (global setup runs `vite build` if `dist/` is missing/stale): every relative `href`/`src` resolves; `lang`, `alt`, `rel="noopener"` for `_blank`, viewport meta, `<title>`, identical nav, no inline `style`, image <= 500 KB, copyright year equals current year, every entry in the Vite input list exists. This replaces the earlier custom `scripts/check-links.mjs` (R8 of the previous plan) with the Vitest setup that `comk` and `PracticeEnglish` already use.
  - `npm run test:e2e` = `playwright test`, `tests/e2e/`, against `vite preview` with Chromium + WebKit at 390x844 (as `PracticeEnglish`): each page loads, nav links resolve, no horizontal scroll (SC-006), unknown path shows `404.html` with a link home. One spec file, no fixtures.
  - GitHub Actions `.github/workflows/ci.yml` on `pull_request` and push to `master`: `npm ci`, `npm run build`, `npm test`, install Playwright browsers, `npm run test:e2e`. CI only verifies; it has no deploy permissions or secrets.
  - Netlify build also runs `vitest run` so a failing check blocks the Firebase hand-off. Playwright is NOT run in Netlify (browser download is slow and fragile there); it is a GitHub CI gate.
- **Alternatives**: Custom link-check script (rejected: duplicates Vitest); Playwright in Netlify (rejected, see above).

## R7. Firebase Hosting configuration (FR-014)
- **Decision**: `firebase.json`: `hosting.public = "dist"`, `ignore` as in `PracticeEnglish`, no rewrites, `cleanUrls: false`, `trailingSlash` unset (`.html` paths unchanged), Firebase serves `404.html` for unknown paths automatically. Long-cache header for hashed `/assets/**`; default for HTML. `.firebaserc` default project id committed (not secret).
- **Firebase project id**: owner must create the project; plan uses placeholder `creeperspeak-site` in `.firebaserc`, replaced at setup (open owner item).
- **HTTP -> HTTPS**: Firebase Hosting does this automatically for custom domains with a managed certificate (FR-002).
- **www -> apex (FR-001/FR-014 caveat)**: `firebase.json` redirects cannot match on host. The supported mechanism is the Firebase console "Add custom domain" flow: add `www.creeperspeak.com` as a *redirect* to `creeperspeak.com`. This is console configuration, not repo configuration. Documented in the deploy guide; FR-014's "committed config" requirement applies to everything that firebase.json can express. Flag for owner.
- **Alternatives**: Redirect in the app via JS (rejected: not crawler-safe); serve www as a second site (rejected: duplicate content).

## R8. DNS at Hover (FR-008)
- **Decision**: Keep Hover nameservers. In Firebase console -> Hosting -> Add custom domain, add `creeperspeak.com` (apex) and `www.creeperspeak.com` (redirect to apex). Firebase displays: a `TXT` verification record, and `A` records (currently the pair `199.36.158.100`-style; use the exact values shown) for the apex; for `www` use the shown `A` record(s) or `CNAME` to `<project>.web.app`. Add them at Hover; remove the old dead-host apex `A` and `www` records. Do not touch `MX`/`TXT` for email (add Firebase's TXT alongside existing TXT records; do not replace the SPF record). Certificate is issued after verification; can take up to ~24 h.
- **Alternatives**: Move nameservers (rejected in clarification).

## R9. Content fixes (unchanged from previous plan)
- Footer `&copy; 2014` -> current year; add `lang="en"`; `rel="noopener"` on `target="_blank"`; `alt` on the fruitmash image; `title` on the Bandcamp iframe; unique `<title>` per page; identical nav on all pages (`main.` -> `index.html`, `music.` -> Bandcamp new tab, `contact.` -> `contact.html`); inline iframe style moved to `css/main.css`; Bandcamp `http://` -> `https://`.
- Open owner item: whether `look, mom.` / `music.html` should be in the nav (default: no).

## R10. Assets
- Rename `img/fruitmash.JPG` -> `fruitmash.jpg`, `img/istanbul_trainstation_small.JPG` -> `.jpg` (lowercase per constitution IV; Firebase and Netlify are both case-sensitive). 431 KB < 500 KB limit; kept though unreferenced.

## R11. Pre-existing issue
- Nested `creeperspeak_site/` directory duplicates Spec Kit scaffolding; not part of the site (Vite builds only listed inputs); flagged for cleanup. Only `dist/` is published, so it never reaches Firebase.
