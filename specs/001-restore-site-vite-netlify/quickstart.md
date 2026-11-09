# Quickstart: Validation Guide

Prerequisites: Node 20 (`nvm use`), npm, Netlify and Hover access.

## 1. Local build and preview (SC-004)
```bash
npm install
npm run dev        # live preview, all pages and images load
npm run build      # produces dist/
npm test           # link/asset/markup checks pass on dist/
npm run preview    # serve dist/ and click through every page
```
Expect: `index.html`, `music.html`, `contact.html`, `lookmom.html`, `404.html` in `dist/`; no broken links or images; footer shows current year.

## 2. Responsive check (SC-006)
Open each page at ~375px and ~1280px; no horizontal scroll or overlap.

## 3. Deploy Preview (US2, constitution VI)
Push a branch, open a PR, open the Netlify Deploy Preview, review each page. Merge to `master`; confirm production deploy succeeds and shows the change within 5 minutes (SC-003).

## 4. Domain cutover (US1)
Follow [contracts/dns-records.md](./contracts/dns-records.md). Then from two networks (SC-001): `http://creeperspeak.com` redirects to HTTPS home; `www` redirects to apex; each nav link works; an unknown path shows the 404 page; browser shows valid certificate (SC-005).
