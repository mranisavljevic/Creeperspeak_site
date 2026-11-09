# Implementation Plan: Restore Site Online with Modern Build and Hosting

**Branch**: `001-restore-site-vite-netlify` | **Date**: 2026-11-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-restore-site-vite-netlify/spec.md`

## Summary

Bring the dormant four-page static site (index, music, contact, lookmom) back online at
`creeperspeak.com`. Add Vite (multi-page, relative `base`) following the `comk` project's
`package.json`/`vite.config.js`/`.gitignore` conventions, deploy via Netlify (git-connected,
`netlify.toml`, branch/deploy previews), keep DNS at Hover with only apex and `www` records edited,
and apply small content fixes (copyright year, `lang`, `rel="noopener"`, `alt`, no inline style,
consistent nav, 404 page). A README documents run/build/deploy/DNS steps.

## Technical Context

**Language/Version**: HTML5/CSS3; Node.js 20 (pinned via `.nvmrc` and `netlify.toml`), no app JS

**Primary Dependencies**: `vite` (^7, dev-only, lockfile-pinned); no runtime dependencies

**Storage**: N/A (static files)

**Testing**: `npm run build` + `npm run preview` smoke check; a small Node link/asset checker script (`npm test`) over `dist/`; manual Netlify Deploy Preview review (constitution VI)

**Target Platform**: Static hosting on Netlify; modern desktop and mobile browsers

**Project Type**: Static multi-page website

**Performance Goals**: Pages fully static; no image in `dist/` above 500 KB (constitution IV)

**Constraints**: Existing `.html` URLs unchanged; relative links; no new frameworks, third-party scripts or fonts; branding unchanged

**Scale/Scope**: 4 pages + 404, 3 stylesheets, 3 images

## Constitution Check

*GATE: passes before Phase 0 research and after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Static Output, Vite Build | PASS | Vite multi-page, output is static `dist/`; lockfile committed |
| II. Consistent Structure | PASS (with fixes) | Nav is currently inconsistent across pages (lookmom has a 4th link; music/contact links lack `target`); normalized to identical nav. Inline `style` on the music iframe moves to `css/main.css` |
| III. Responsive & Accessible | PASS (with fixes) | Viewport present; add `alt`, `rel="noopener"`, iframe `title` |
| IV. Lightweight Assets | PASS / watch | `istanbul_trainstation_small.JPG` is 431 KB (<500 KB) and is unreferenced; `fruitmash.JPG` is 50 KB. Source names with uppercase `.JPG` are legacy; renaming to lowercase `.jpg` is in scope (see research R7) |
| V. Valid, Portable Markup | PASS (with fixes) | Add `lang`; Vite `base: './'` |
| VI. Netlify Testing/Deployment | PASS | `netlify.toml` with `vite build`, `dist`, Node pin |

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
│   └── dns-records.md
└── tasks.md             # created by /speckit-tasks
```

### Source Code (repository root)

```text
index.html  music.html  contact.html  lookmom.html  404.html   # Vite entry points
css/        normalize.css  main.css  responsive.css
img/        favicon.ico  fruitmash.jpg  istanbul_trainstation_small.jpg
public/                       # verbatim assets only if needed (e.g. none initially)
scripts/check-links.mjs       # post-build link/asset verifier
vite.config.js                # multi-page inputs, base './'
netlify.toml                  # build, publish, Node, redirects
package.json  package-lock.json  .nvmrc  .gitignore  README.md
```

**Structure Decision**: Flat root layout with HTML files as Vite entries, mirroring `comk`
(root-level `index.html`, `vite.config.js` with `rollupOptions.input`). The stray nested
`creeperspeak_site/` directory (a duplicate of Spec Kit scaffolding) is not part of the site and
is left untouched by this plan; it should be removed or ignored separately.

## Complexity Tracking

None.
