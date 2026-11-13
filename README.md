# creeperspeak.

Static multi-page site (index, music, contact, look mom) served at https://creeperspeak.com.

## Prerequisites

Node 20 (`nvm use`) and npm.

## Commands

| Command | What it does |
|---------|--------------|
| `npm install` | Install dev tooling |
| `npm run dev` | Live-reload dev server |
| `npm run build` | Build static site to `dist/` |
| `npm run preview` | Serve `dist/` locally (unknown paths show the 404 page) |
| `npm test` | Vitest checks on the built output |
| `npm run test:e2e` | Playwright (Chromium + WebKit, 390x844) |

Note: `tests/unit/year.test.js` checks the footer year and fails each January until the
footers are bumped. It runs in `npm test` and CI but not in the Netlify deploy gate (`test:build`).

## Deploy flow

GitHub -> Netlify builds and runs tests -> on `master` only, the tested `dist/` is deployed to
Firebase Hosting (which serves `creeperspeak.com`). Other branches and PRs get Netlify preview URLs
only. GitHub Actions CI also runs build, unit and e2e tests on PRs and `master`.

Setup, DNS and rollback steps: [docs/DEPLOY.md](docs/DEPLOY.md).

The empty `creeperspeak_site/` directory at the repo root is a stray leftover; it is not published
(only `dist/` ships).
