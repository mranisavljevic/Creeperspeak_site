# Quickstart: Validation Guide

Prerequisites: Node 20 (`nvm use`), npm; Netlify, Firebase and Hover access for steps 3-5.

## 1. Local build, preview and checks (SC-004)
```bash
npm install
npm run dev          # live preview; all pages and images load
npm run build        # produces dist/
npm test             # Vitest checks on dist/ (links, assets, lang, alt, nav, year)
npm run preview      # click through every page
```
Expect: `index.html`, `music.html`, `contact.html`, `lookmom.html`, `404.html` in `dist/`; all tests pass.

## 2. Responsive and navigation e2e (SC-006)
```bash
npx playwright install chromium webkit   # first time only
npm run test:e2e
```
Expect: Chromium and WebKit at 390x844 pass: every page loads, nav links work, no horizontal scroll, unknown path shows the 404 page.

## 3. PR flow (US2)
Push a branch, open a PR. Expect: GitHub CI green, Netlify Deploy Preview available, Netlify log shows "skipping Firebase deploy". Review each page on the preview.

## 4. Production hand-off (FR-012, SC-003)
Merge to `master`. Expect: Netlify build runs build + tests + `firebase deploy`; change visible on the Firebase URL (`https://<project>.web.app`) within 5 minutes. Failure drill: temporarily blank `FIREBASE_SERVICE_ACCOUNT`, push, confirm the Netlify build fails with a clear message and the live site still serves the previous version; restore the variable.

## 5. Domain cutover (US1)
Follow [contracts/dns-records.md](./contracts/dns-records.md). Then from two networks (SC-001): `http://creeperspeak.com` redirects to HTTPS home; `www` redirects to apex; each nav link works; an unknown path shows the 404 page; valid certificate (SC-005).
