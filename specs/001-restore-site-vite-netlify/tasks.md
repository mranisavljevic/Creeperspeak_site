# Tasks: Restore Site Online with Modern Build and Hosting

**Input**: Design documents from `/specs/001-restore-site-vite-netlify/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included. plan.md and research.md (R6) specify Vitest checks on `dist/` and a Playwright e2e spec, and constitution VI requires a tested build before the Firebase hand-off.

**Organization**: Grouped by user story. Note that US1 (site reachable) depends on the build/hand-off pipeline from US2 to have something to serve, so the pipeline code lives in Foundational and US2 covers the CI/preview/docs side. All paths are relative to the repo root `/Users/mranisavljevic/Dev/Creeperspeak_site`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1, US2, US3

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization mirroring `../comk` and `../PracticeEnglish`

- [ ] T001 Create `package.json` (name `creeperspeak-site`, `"type": "module"`, `engines.node >= 20.19`) with scripts `dev`, `build`, `preview`, `test`, `test:e2e`, `build:netlify` exactly as in `contracts/netlify-config.md`
- [ ] T002 [P] Create `.nvmrc` containing `20` and `.gitignore` (node_modules, dist, logs, .env, .DS_Store, .firebase, .netlify, playwright-report, test-results, editor files)
- [ ] T003 Install devDependencies (`vite@^7`, `vitest`, `@playwright/test`, `firebase-tools`) with `npm install` to produce and commit `package-lock.json`
- [ ] T004 Create `vite.config.js`: `base: './'`, `build.rollupOptions.input` = index, music, contact, lookmom, 404 (via `resolve(__dirname, ...)`), and a `test` block (`environment: 'node'`, `include: ['tests/**/*.test.js']`, `globalSetup: ['tests/unit/global-setup.js']`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Hosting config, deploy script, 404 page and asset renames that every story needs

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Rename `img/fruitmash.JPG` to `img/fruitmash.jpg` and `img/istanbul_trainstation_small.JPG` to `img/istanbul_trainstation_small.jpg` using `git mv` (two steps via a temp name, since macOS is case-insensitive); update the reference in `index.html`
- [ ] T006 [P] Create `netlify.toml` per `contracts/netlify-config.md` (build command `npm run build:netlify`, publish `dist`, `NODE_VERSION = "20"`, `X-Robots-Tag: noindex` header on `/*`)
- [ ] T007 [P] Create `firebase.json` per `contracts/firebase-config.md` (public `dist`, ignore list, `cleanUrls: false`, immutable cache header for `/assets/**`) and `.firebaserc` with placeholder project `creeperspeak-site`
- [ ] T008 [P] Create `scripts/deploy-firebase.mjs` per `contracts/netlify-config.md`: skip with log "skipping Firebase deploy" and exit 0 unless `CONTEXT=production` and `BRANCH=master`; exit 1 with clear error if `FIREBASE_SERVICE_ACCOUNT` missing; otherwise write JSON to an OS temp file outside the repo, set `GOOGLE_APPLICATION_CREDENTIALS`, run `npx firebase deploy --only hosting`, delete the temp file in a `finally`, propagate the exit code
- [ ] T009 Create `404.html` at repo root using the shared page skeleton (same head, header/nav, footer as other pages, `lang="en"`), body text "Page not found" with a link to `index.html`
- [ ] T010 Create `tests/unit/global-setup.js` that runs `vite build` programmatically when `dist/` is missing or older than any source HTML/CSS/img file

**Checkpoint**: Foundation ready; `npm run build` produces `dist/` containing all five pages

---

## Phase 3: User Story 1 - Visitors can reach the site at creeperspeak.com (Priority: P1) 🎯 MVP

**Goal**: Production served by Firebase Hosting at `creeperspeak.com` over HTTPS, `www` redirecting to apex

**Independent Test**: From two networks, `http://creeperspeak.com` redirects to HTTPS home, `www` redirects to apex, every nav link works, unknown path shows the 404 page (quickstart step 5)

### Tests for User Story 1

- [ ] T011 [P] [US1] Create `tests/e2e/site.spec.js` with one spec: each of index/music/contact/lookmom loads with HTTP 200, nav links resolve, and an unknown path renders `404.html` with a link back to `index.html`
- [ ] T012 [P] [US1] Create `playwright.config.js`: `testDir: 'tests/e2e'`, projects Chromium and WebKit at viewport 390x844, `webServer` running `npm run build && npm run preview` on a fixed port

### Implementation for User Story 1

- [ ] T013 [US1] Verify the 404 behavior: run `npm run build && npm run preview` and confirm an unknown path serves `404.html`; if `vite preview` does not, set `appType: 'mpa'` in `vite.config.js`
- [ ] T014 [US1] Write the Firebase and Hover DNS sections of `docs/DEPLOY.md`: create Firebase project, enable Hosting, update `.firebaserc` project id, create Hosting Admin service account and set `FIREBASE_SERVICE_ACCOUNT` in Netlify (Production context only), first deploy, add custom domain `creeperspeak.com`, add `www.creeperspeak.com` as redirect to apex (console-only, FR-014 caveat), Hover DNS edits per `contracts/dns-records.md` (keep MX and existing TXT/SPF, no nameserver change), `dig`/`curl` verification commands, propagation and certificate timing
- [ ] T015 [US1] Owner action (manual): replace the placeholder id in `.firebaserc` with the real Firebase project id and commit
- [ ] T016 [US1] Owner action (manual): perform the production hand-off by merging to `master` after Netlify is configured (T020), then add the custom domains in Firebase and edit Hover DNS following `docs/DEPLOY.md`; confirm quickstart step 5 from two networks

**Checkpoint**: creeperspeak.com serves the site with a valid certificate

---

## Phase 4: User Story 2 - Owner can build, preview, and publish changes easily (Priority: P2)

**Goal**: Documented local workflow, CI on GitHub, Netlify previews for branches/PRs, automatic Firebase publish from `master`

**Independent Test**: Make a text change, preview locally, push a branch (preview URL, Netlify log shows "skipping Firebase deploy"), merge to `master` (change live on Firebase within 5 minutes); failure drill leaves the live site unchanged

### Implementation for User Story 2

- [ ] T017 [P] [US2] Create `.github/workflows/ci.yml`: triggers `pull_request` and push to `master`; steps checkout, setup-node using `.nvmrc` with npm cache, `npm ci`, `npm run build`, `npm test`, `npx playwright install --with-deps chromium webkit`, `npm run test:e2e`; no secrets, no deploy
- [ ] T018 [P] [US2] Create `README.md`: project description, prerequisites (Node 20 via `nvm use`), commands (`npm install`, `npm run dev`, `npm run build`, `npm test`, `npm run test:e2e`, `npm run preview`), deploy flow summary (GitHub -> Netlify build/tests -> Firebase on `master`; previews on other branches), and link to `docs/DEPLOY.md` (FR-011)
- [ ] T019 [US2] Write the Netlify, GitHub and rollback sections of `docs/DEPLOY.md`: connect repo to Netlify with production branch `master`, enable branch deploys and Deploy Previews, do not add `creeperspeak.com` to Netlify, set `FIREBASE_SERVICE_ACCOUNT` scoped to Production only, noindex note for `*.netlify.app`, rollback via Firebase Hosting release history, failure drill from quickstart step 4
- [ ] T020 [US2] Owner action (manual): create the GitHub repo and push, connect it to Netlify per `docs/DEPLOY.md`, set the Production-scoped env var
- [ ] T021 [US2] Run quickstart steps 1-4: local preview/build/tests, e2e, a PR with Deploy Preview, merge hand-off, and the failure drill (blank the env var, confirm build fails and the previous version still serves, restore)

**Checkpoint**: Pushes build, test and publish automatically

---

## Phase 5: User Story 3 - Existing content is correct and presentable (Priority: P3)

**Goal**: Fix stale details so pages are a sound base: current year, `lang`, link safety, alt text, consistent nav, no inline style

**Independent Test**: `npm test` passes; every page at 390 px and desktop widths shows no broken images/links and no horizontal scroll

### Tests for User Story 3

- [ ] T022 [US3] Create `tests/unit/site.test.js` reading built `dist/*.html` and asserting: all relative `href`/`src` resolve to files in `dist/`; `<html lang="en">`; non-empty unique `<title>`; viewport meta; every `<img>` has `alt`; every `target="_blank"` has `rel` containing `noopener`; identical nav markup (ignoring `selected` class) on all pages; no inline `style` attributes; no `dist/` image over 500 KB; footer year equals the current year; every Vite input exists. Run `npm test` and confirm it fails before the fixes below

### Implementation for User Story 3

- [ ] T023 [P] [US3] Fix `index.html`: add `lang="en"`, title `creeperspeak.`, `alt` text on the fruitmash image, `rel="noopener"` on the music link (`target="_blank"`), footer year to the current year (2026)
- [ ] T024 [P] [US3] Fix `music.html`: `lang="en"`, title `music. | creeperspeak.`, nav music link to `https://thetornacls.bandcamp.com/` with `target="_blank" rel="noopener"`, add iframe `title` attribute, remove inline `style` from the iframe (use a class), `http://` to `https://` in the fallback Bandcamp link, footer year
- [ ] T025 [P] [US3] Fix `contact.html`: `lang="en"`, title `contact. | creeperspeak.`, same nav as index (`music.` link with `target="_blank" rel="noopener"`), footer year, check every external link for `rel="noopener"`
- [ ] T026 [P] [US3] Fix `lookmom.html`: `lang="en"`, title `look, mom. | creeperspeak.`, remove the 4th `look, mom.` nav item so nav matches the other pages (open owner item default: not in nav), same music link attributes, footer year
- [ ] T027 [US3] Update `404.html` to match the finished nav/footer/title (`not found | creeperspeak.`) from T023-T026
- [ ] T028 [US3] Move the iframe sizing (`border: 0; width: 350px; height: 442px`) into a class in `css/main.css` and ensure it does not overflow at 390 px in `css/responsive.css`
- [ ] T029 [US3] Run `npm test` and `npm run test:e2e`; fix any failures (broken links, horizontal scroll at 390x844)

**Checkpoint**: All three stories work independently

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T030 [P] Decide on the nested `creeperspeak_site/` directory (stray Spec Kit duplicate): confirm it is not published (only `dist/` ships) and either remove it or add a note in `README.md`
- [ ] T031 [P] Add a short comment in `tests/unit/site.test.js` and `README.md` that the copyright-year test fails each January until the footers are bumped
- [ ] T032 Run the full `specs/001-restore-site-vite-netlify/quickstart.md` validation end to end and record results

---

## Dependencies & Execution Order

- **Setup (Phase 1)**: none. T003 needs T001; T004 needs T003
- **Foundational (Phase 2)**: needs Phase 1. T005 before T010 results are meaningful; T006-T008 are independent; T009 needs T004
- **US1 (Phase 3)**: needs Phase 2. T016 (live cutover) also needs T020 (Netlify configured) and T015
- **US2 (Phase 4)**: needs Phase 2; T021 needs T020
- **US3 (Phase 5)**: needs Phase 2; T022 before T023-T029. Recommended to complete before the first production merge so the first live version is already correct
- **Polish**: after the desired stories

### Practical order

Phases 1, 2, 5 (content), 3 (e2e tests), 4, then the owner-run cutover steps T015, T020, T016. This gets a correct site built and tested locally before anything goes public.

## Parallel Examples

```text
Phase 2:  T006 netlify.toml | T007 firebase.json + .firebaserc | T008 scripts/deploy-firebase.mjs
Phase 3:  T011 tests/e2e/site.spec.js | T012 playwright.config.js
Phase 4:  T017 .github/workflows/ci.yml | T018 README.md
Phase 5:  T023 index.html | T024 music.html | T025 contact.html | T026 lookmom.html
```

## Implementation Strategy

### MVP (User Story 1)

1. Phase 1 and 2 (build, hosting config, 404, deploy script)
2. Phase 5 content fixes are cheap and best done before going live
3. Phase 3: e2e tests, deploy guide, then owner steps to create Firebase project, connect Netlify, merge to `master`, change DNS
4. Validate quickstart step 5

### Incremental Delivery

Setup + Foundational -> US3 content fixes -> US1 go-live -> US2 CI, docs and failure drill -> Polish.

## Notes

- Tasks T015, T016, T020 require the owner's accounts (Firebase, Netlify, GitHub, Hover) and cannot be automated
- `www` -> apex redirect is a Firebase console setting, not repo config
- Commit after each task or logical group
