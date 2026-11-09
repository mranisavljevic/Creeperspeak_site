# Implementation Plan: Restore Site Online with Modern Build and Hosting

**Branch**: `001-restore-site-vite-netlify` | **Date**: 2026-11-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-restore-site-vite-netlify/spec.md`

## Summary

Bring the dormant four-page static site (index, music, contact, lookmom) back online at
`creeperspeak.com`, using the same Vite / Netlify / GitHub / Firebase build, deploy and test
setup as `../comk` and `../PracticeEnglish`. Vite builds a multi-page static `dist/`; Vitest
checks the built output and Playwright (Chromium + WebKit, phone viewport) covers navigation and
responsiveness; GitHub hosts the repo and runs a CI workflow; Netlify builds every push, serves
branch/PR previews, and on `master` hands the tested `dist/` to Firebase Hosting from inside the
build using a service-account env var. Firebase serves production at `creeperspeak.com`, with DNS
kept at Hover. Small content fixes (copyright year, `lang`, `rel="noopener"`, `alt`, no inline
style, consistent nav, 404 page) and a deploy guide complete the work.

## Technical Context

**Language/Version**: HTML5/CSS3; Node.js 20 (pinned via `.nvmrc` and `netlify.toml`), no app JS

**Primary Dependencies**: dev-only, lockfile-pinned: `vite` (^7), `vitest`, `@playwright/test`, `firebase-tools`; no runtime dependencies

**Storage**: N/A (static files)

**Testing**: `npm test` (Vitest on built `dist/`: links, assets, markup rules, image size, year); `npm run test:e2e` (Playwright, Chromium + WebKit at 390x844); GitHub Actions CI on PRs and `master`; Netlify build re-runs Vitest before the Firebase hand-off; manual Deploy Preview review (constitution VI)

**Target Platform**: Production on Firebase Hosting; previews on Netlify; modern desktop and mobile browsers

**Project Type**: Static multi-page website

**Performance Goals**: Pages fully static; no image in `dist/` above 500 KB (constitution IV)

**Constraints**: Existing `.html` URLs unchanged; relative links; no new frameworks, third-party scripts or fonts; branding unchanged; deploy secret only in Netlify env (Production context)

**Scale/Scope**: 4 pages + 404, 3 stylesheets, 3 images

## Constitution Check

*GATE: passes before Phase 0 research and after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Static Output, Vite Build | PASS | Vite multi-page, output is static `dist/`; lockfile committed; extra deps are dev tooling only (vitest, playwright, firebase-tools) |
| II. Consistent Structure | PASS (with fixes) | Nav is currently inconsistent across pages (lookmom has a 4th link; music/contact links lack `target`); normalized to identical nav. Inline `style` on the music iframe moves to `css/main.css` |
| III. Responsive & Accessible | PASS (with fixes) | Viewport present; add `alt`, `rel="noopener"`, iframe `title` |
| IV. Lightweight Assets | PASS / watch | `istanbul_trainstation_small.JPG` is 431 KB (<500 KB) and is unreferenced; `fruitmash.JPG` is 50 KB. Source names with uppercase `.JPG` are legacy; renaming to lowercase `.jpg` is in scope (see research R7) |
| V. Valid, Portable Markup | PASS (with fixes) | Add `lang`; Vite `base: './'` |
| VI. Netlify Build/Preview, Firebase Production | PASS | `netlify.toml` (build, `dist`, Node pin); `firebase.json` with `public: dist`; hand-off only from `master` after build and tests succeed, from the same `dist/`; no secrets committed; `creeperspeak.com` never added to Netlify |

No violations; Complexity Tracking not required.

## Project Structure

### Documentation (this feature)

```text
specs/001-restore-site-vite-netlify/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── site-routes.md
│   ├── netlify-config.md
│   ├── firebase-config.md
│   └── dns-records.md
└── tasks.md             # created by /speckit-tasks
```

### Source Code (repository root)

```text
index.html  music.html  contact.html  lookmom.html  404.html   # Vite entry points
css/        normalize.css  main.css  responsive.css
img/        favicon.ico  fruitmash.jpg  istanbul_trainstation_small.jpg
tests/      unit/site.test.js  e2e/site.spec.js  (+ vitest global setup that builds dist/)
scripts/    deploy-firebase.mjs            # Netlify production hand-off to Firebase
.github/workflows/ci.yml                   # build + vitest + playwright on PR/master
docs/DEPLOY.md                             # Netlify, Firebase, Hover DNS, rollback
vite.config.js                             # multi-page inputs, base './', vitest block
playwright.config.js                       # chromium + webkit, 390x844, vite preview
netlify.toml  firebase.json  .firebaserc  .nvmrc  .gitignore
package.json  package-lock.json  README.md
```

**Structure Decision**: Flat root layout with HTML files as Vite entries, mirroring `comk`
(root-level `index.html`, `vite.config.js` with `rollupOptions.input` plus a `test` block) and
`PracticeEnglish` (`netlify.toml`, `.nvmrc`, `docs/DEPLOY.md`, Playwright config). The stray nested
`creeperspeak_site/` directory is not part of the site and is left untouched; remove or ignore it
separately.

## Open Owner Items

- Create the Firebase project and give its id (placeholder `creeperspeak-site` in `.firebaserc`).
- Create a Hosting Admin service account and set `FIREBASE_SERVICE_ACCOUNT` in Netlify (Production only).
- `www` -> apex redirect is a Firebase console setting (cannot live in `firebase.json`); this is the one place FR-014 cannot be met purely from committed config.
- Whether `look, mom.` / `music.html` appear in the nav (default: no).

## Complexity Tracking

None.
