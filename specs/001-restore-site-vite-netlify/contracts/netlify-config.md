# Contract: Build, Test and Deploy Configuration

## `netlify.toml` (repo root)
```toml
[build]
  command = "npm run build:netlify"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[[headers]]
  for = "/*"
  [headers.values]
    X-Robots-Tag = "noindex"
```
Netlify builds and serves previews only; `creeperspeak.com` is never added to Netlify.

## npm scripts (`package.json`, names follow `comk`/`PracticeEnglish`)
| Script | Command |
|--------|---------|
| `dev` | `vite` |
| `build` | `vite build` |
| `preview` | `vite preview` |
| `test` | `vitest run` |
| `test:e2e` | `playwright test` |
| `test:build` | `vitest run --exclude tests/unit/year.test.js` (deploy-gating tests; excludes the calendar-dependent year check so a new year never blocks a deploy) |
| `build:netlify` | `npm run build && npm run test:build && node scripts/deploy-firebase.mjs` |

devDependencies: `vite ^7`, `vitest`, `@playwright/test`, `firebase-tools`. Lockfile committed. `engines.node >= 20.19`. `.nvmrc` = `20`.

## `scripts/deploy-firebase.mjs` behaviour
| Condition | Result |
|-----------|--------|
| `CONTEXT != production` or `BRANCH != master` | Log "skipping Firebase deploy", exit 0 |
| Production but `FIREBASE_SERVICE_ACCOUNT` missing | Log clear error, exit 1 (build fails; live site unchanged) |
| Production with credential | Write JSON to temp file, set `GOOGLE_APPLICATION_CREDENTIALS`, run `firebase deploy --only hosting`, delete temp file; propagate exit code |

## Netlify site settings (manual, documented in `docs/DEPLOY.md`)
Connect the GitHub repo; production branch `master`; Deploy Previews and branch deploys on; env var `FIREBASE_SERVICE_ACCOUNT` scoped to Production only. No custom domain on Netlify.

## GitHub Actions (`.github/workflows/ci.yml`)
Triggers: `pull_request`, push to `master`. Steps: checkout, setup-node (from `.nvmrc`), `npm ci`, `npm run build`, `npm test`, `npx playwright install --with-deps chromium webkit`, `npm run test:e2e`. No secrets, no deploy.
