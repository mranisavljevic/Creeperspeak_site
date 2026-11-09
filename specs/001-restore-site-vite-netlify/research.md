# Research: Restore Site with Vite and Netlify

## R1. What does "same as comk" mean?
- **Finding**: `comk` has `package.json` (scripts `dev`/`build`/`preview`, devDependency `vite ^7.1.12`), a `vite.config.js` using `rollupOptions.input` for multiple HTML files, and a `.gitignore` (node_modules, dist, logs, env, editor/OS files). It deploys to **Firebase**, not Netlify; there is no `netlify.toml` or `.nvmrc` to copy.
- **Decision**: Copy the npm scripts, Vite version range, multi-page config style and `.gitignore` from `comk`; author `netlify.toml` fresh. Omit `vitest`, Firebase files and tests framework (no JS to unit test).
- **Alternatives**: Copying Firebase config (rejected: spec and constitution require Netlify).

## R2. Vite version and Node
- **Decision**: `vite ^7`, Node 20 (`.nvmrc` = `20`, `netlify.toml` `NODE_VERSION = "20"`). Vite 7 needs Node >= 20.19; local Node is 20.20.2, so it works.
- **Alternatives**: Node 22 (also fine; 20 matches the local environment).

## R3. Multi-page and portable paths
- **Decision**: `build.rollupOptions.input` lists `index`, `music`, `contact`, `lookmom`, `404`; `base: './'`. Output keeps `/music.html` etc., satisfying FR-004. Vite rewrites `css/*.css` and `img/*` references to hashed assets; HTML stays flat at the root of `dist/`.
- **Alternatives**: Clean URLs (rejected in clarification); `public/` for everything (rejected: loses hashing/optimization).

## R4. Netlify configuration
- **Decision**: Git-connected site, `netlify.toml` with `[build] command = "npm run build"`, `publish = "dist"`, Node pin. Production deploys from `master`; branch deploys and Deploy Previews enabled in the Netlify UI (default for PRs). Netlify serves `404.html` automatically for unknown paths, so no redirect rule is needed for FR-009. Netlify provides HTTPS via Let's Encrypt and redirects HTTP to HTTPS.
- **apex vs www**: With the apex set as the primary domain in Netlify, Netlify redirects `www` to the apex automatically (FR-001).
- **Alternatives**: Netlify CLI/manual deploys (rejected: FR-006 needs auto-publish).

## R5. DNS at Hover (FR-008)
- **Decision**: Keep Hover nameservers. At Hover, set the apex `A` record to Netlify's load balancer IP (documented value `75.2.60.5`; verify in Netlify's domain settings at setup time) and `www` `CNAME` to `<site-name>.netlify.app`. Remove the old apex `A` and `www` records pointing to the dead host. Do not touch `MX`/`TXT` (email at `miles@creeperspeak.com`).
- **Note**: Hover does not support apex ALIAS/ANAME; use the `A` record. Propagation is typically minutes to a few hours; HTTPS certificate is issued after DNS resolves.
- **Alternatives**: Netlify DNS (rejected in clarification).

## R6. Content fixes
- **Decision**:
  - Footer: `&copy; 2014` -> current year (static text, 2026; no JS). Constitution requires keeping it current when pages are touched.
  - Add `lang="en"`, `rel="noopener"` on `target="_blank"` links, descriptive `alt` for `fruitmash` image, `title` on the Bandcamp iframe, unique `<title>` per page.
  - Make nav identical on all pages (constitution II): `main.` -> `index.html`, `music.` -> Bandcamp (`target="_blank" rel="noopener"`), `contact.` -> `contact.html`. `lookmom.html` and `music.html` remain reachable at their URLs but are not in the nav (lookmom is a placeholder page); current page gets `selected` only where it appears in the nav.
  - Move the iframe inline style to `css/main.css` (constitution II); change `http://` Bandcamp link to `https://` to avoid mixed content.
  - Remove the unused `float: left` clearing issues only if the phone-width check (SC-006) finds a problem.
- **Open item for owner**: whether to link `look, mom.` and `music.html` in the nav. Default above is to keep nav identical and minimal.

## R7. Assets
- **Decision**: Rename `img/fruitmash.JPG` -> `fruitmash.jpg` (lowercase per constitution IV; important because Netlify is case-sensitive). `istanbul_trainstation_small.JPG` is unreferenced; keep it renamed to `.jpg` (431 KB, under limit) rather than delete content the owner may reuse. `favicon.ico` stays in `img/`.

## R8. Verification
- **Decision**: `scripts/check-links.mjs` parses built `dist/*.html`, confirms every relative `href`/`src` resolves to a file, and checks `lang`, `alt` and `rel="noopener"` rules. Wired as `npm test` (runs after build). External links are checked manually (Deploy Preview).
- **Alternatives**: Third-party link checkers (rejected: extra dependencies, constitution I).

## R9. Pre-existing issue
- The repo contains a nested `creeperspeak_site/` directory holding duplicate Spec Kit files. It does not affect the build (Vite only builds listed inputs) but is clutter; flagged for cleanup.
