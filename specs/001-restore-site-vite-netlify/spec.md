# Feature Specification: Restore Site Online with Modern Build and Hosting

**Feature Branch**: `001-restore-site-vite-netlify`

**Created**: 2026-11-09

**Status**: Ready for implementation

**Input**: User description: "This is a very old website I created for personal use. I had planned it to highlight my work as a software engineer, and to have links to my creative projects. I have not used it or updated it in many years, so I'd like to get it working again, and probably to start updating the content. To start, I'd like to get the site just working again, and to add Vite and Netlify, the same way I have with `../comk`. Currently the site is unreachable with the error \"Bad Gateway: Unable to connect to creeperspeak.com:80\". The domain is registered with Hover.com"

**Amendment (2026-11-09)**: "Perhaps we should move the hosting to Firebase as part of this project, so that the deploy can continue to happen via Netlify -> Firebase"

## Clarifications

### Session 2026-11-09

- Q: Which address should be canonical, with the other redirecting to it? → A: `creeperspeak.com` (apex) is canonical; `www.creeperspeak.com` redirects to it.
- Q: Should old page addresses keep working as-is or move to clean URLs? → A: Keep existing `.html` addresses unchanged; no URL restructuring.
- Q: Change individual DNS records at Hover or move nameservers to Netlify DNS? → A: Keep DNS at Hover; edit only the site's A/ALIAS and CNAME records.

### Session 2026-11-09 (amendment: Firebase hosting)

- Q: Where does the live site get served from? → A: Firebase Hosting serves production at creeperspeak.com. DNS records at Hover point to Firebase, not Netlify.
- Q: What role does Netlify keep? → A: Netlify remains the build-and-deploy pipeline: it builds the site on every push, publishes branch/PR previews, and, for the main branch, pushes the successful build to Firebase for production (Netlify → Firebase).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitors can reach the site at creeperspeak.com (Priority: P1)

A visitor types creeperspeak.com into a browser and sees the existing site's pages load instead of a "Bad Gateway" error, over a secure connection.

**Why this priority**: The site is currently down; nothing else matters until it is reachable.

**Independent Test**: Visit creeperspeak.com (and www.creeperspeak.com) from a device outside the owner's network and confirm the home page loads and each page link works.

**Acceptance Scenarios**:

1. **Given** the site is published, **When** a visitor opens `http://creeperspeak.com`, **Then** they are taken to the secure version and the home page displays.
2. **Given** the home page is open, **When** the visitor follows each navigation link (main, music, contact), **Then** each page loads without errors and external links open correctly.
3. **Given** a visitor uses `www.creeperspeak.com`, **When** the page loads, **Then** they are redirected to `https://creeperspeak.com` and reach the same site.

---

### User Story 2 - Owner can build, preview, and publish changes easily (Priority: P2)

The owner can run the site locally with live preview, produce a production build, and have pushing changes to the repository build and publish the update automatically (built by Netlify, served live from Firebase), mirroring the build workflow already used for the `comk` project.

**Why this priority**: This makes future content updates low-effort, which is the owner's stated goal after restoration.

**Independent Test**: Make a small text change, preview it locally, push it, and confirm it appears on the live site without manual file uploads.

**Acceptance Scenarios**:

1. **Given** a fresh checkout, **When** the owner runs the documented local preview command, **Then** the site is viewable locally with all pages and images.
2. **Given** a content change is pushed to the main branch, **When** the automated build and publish completes, **Then** the live site (served from Firebase) shows the change.
3. **Given** a change is proposed on another branch, **When** it is pushed, **Then** a separate preview copy of the site is available for review before it goes live.

---

### User Story 3 - Existing content is correct and presentable (Priority: P3)

The existing pages look right on modern phones and desktops, with no broken links or images, and obviously stale details (such as the 2014 copyright year) are corrected so the site is a sound base for new content.

**Why this priority**: Content refresh comes after the site is live; this only removes obvious breakage.

**Independent Test**: Open every page at phone and desktop widths and confirm no broken images/links and the footer year is current.

**Acceptance Scenarios**:

1. **Given** any page, **When** viewed at phone and desktop widths, **Then** layout is usable and images display.
2. **Given** any page footer, **When** viewed, **Then** it shows the current year.
3. **Given** every link on every page, **When** followed, **Then** none lead to an error.

---

### Edge Cases

- A visitor requests a page that does not exist: they see a friendly not-found page with a way back home.
- A visitor uses an old bookmarked URL (e.g. `lookmom.html`, `music.html`): it still resolves at the same address.
- DNS changes are still propagating: some visitors may briefly see the old error; the owner is told how long to expect this.
- The build succeeds but the hand-off to Firebase fails (e.g. expired or missing credentials): the live site MUST stay on its previous version, and the failure MUST be visible in the Netlify deploy log.
- A branch/PR push: it MUST NOT touch production; only the main branch updates the live Firebase site.
- A visitor with an expired or missing secure certificate would see a warning: the secure certificate must be valid before the domain is announced as working.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The site MUST be reachable at creeperspeak.com and www.creeperspeak.com, with `creeperspeak.com` as the canonical address and `www.creeperspeak.com` redirecting to it.
- **FR-002**: All traffic MUST be served over a valid secure connection, and plain-HTTP requests MUST redirect to it.
- **FR-003**: All existing pages (home, music, contact, lookmom) MUST be preserved and load correctly, including their images and styles.
- **FR-004**: Existing page addresses (e.g. `music.html`, `lookmom.html`) MUST continue to work unchanged at the same paths; no URL restructuring.
- **FR-005**: The owner MUST be able to preview the site locally and produce a production-ready build using a short, documented set of commands.
- **FR-006**: Pushing to the main branch MUST automatically build and publish the site to production; pushes to other branches MUST produce a separate preview that does not affect production.
- **FR-012**: Production hosting MUST be on Firebase Hosting. The Netlify build MUST deploy its successful main-branch output to Firebase (Netlify → Firebase), and a failed build or failed hand-off MUST leave the current live version untouched.
- **FR-013**: Firebase credentials needed for the hand-off MUST be stored as Netlify environment variables and MUST NOT be committed to the repository.
- **FR-014**: Hosting behavior that the site relies on (HTTPS redirect, custom not-found page, unchanged `.html` paths) MUST be configured in the Firebase hosting configuration committed to the repository, and MUST NOT depend on Netlify-only features. The two Firebase console-only settings (attaching the `creeperspeak.com` custom domain and the `www` → apex redirect) cannot be expressed in committed config; they MUST instead be documented as explicit manual steps in `docs/DEPLOY.md`.
- **FR-007**: The project setup (build tool, hosting configuration, ignore rules, scripts) MUST follow the same conventions as the owner's `comk` project.
- **FR-008**: The owner MUST be given step-by-step instructions to point the Hover-registered domain at Firebase Hosting (including adding the custom domain in Firebase and any verification record it requires), including which records to change and how to verify it. DNS MUST remain at Hover (no nameserver change); the instructions edit only the apex A/ALIAS and `www` CNAME records, plus any verification TXT record Firebase requires, and leave all other records (e.g. email MX/SPF) untouched.
- **FR-009**: Visitors requesting a missing page MUST see a not-found page that links back to the home page.
- **FR-010**: Stale details on existing pages (copyright year, missing page language, missing link safety attributes, missing image descriptions) MUST be corrected.
- **FR-011**: The README MUST document how to run, build, deploy, and update the site.

### Key Entities

- **Page**: A visitor-facing page (home, music, contact, lookmom) with navigation, content, and footer.
- **Asset**: An image or stylesheet used by pages.
- **Domain configuration**: The records at the registrar that determine where creeperspeak.com points.
- **Deployment**: A published version of the site, either live (served from Firebase) or a branch preview (served by Netlify).
- **Deploy credential**: The secret that lets the Netlify build publish to Firebase; held only in Netlify settings.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of requests to creeperspeak.com and www.creeperspeak.com return the site (no error pages) from at least two different networks.
- **SC-002**: Every page and link on the site loads without error (0 broken links or images across all pages).
- **SC-003**: A content edit goes from the owner's computer to the live site in under 5 minutes with no manual upload step, and a deliberately failed hand-off leaves the previous live version serving 100% of requests.
- **SC-004**: A new checkout can be previewed locally by following the README in under 5 minutes.
- **SC-005**: Browsers show a valid secure-connection indicator with no warnings on all pages.
- **SC-006**: Every page is usable at phone width (no horizontal scrolling or overlapping content).

## Assumptions

- Scope is restoration and workflow modernization only; new content (software engineering portfolio, creative project links) is a later feature.
- The owner has access to their Hover account and can edit DNS records, can create a Netlify site connected to this repository, and can create a Firebase project with Hosting enabled (free tier is sufficient).
- The repository's host (e.g. GitHub) is available for connecting automated publishing.
- Visual design and existing branding stay as-is.
- Requested tooling (Vite for build, Netlify for build/previews, Firebase for production hosting) is an owner decision; the `comk` project is the reference for conventions.
- Netlify's default secure certificate provisioning is acceptable.
- The cause of the current outage is that the old host no longer serves the domain; moving hosting resolves it.
- Branch/PR previews stay on Netlify's preview URLs; only production uses Firebase. Firebase preview channels are out of scope.
- Firebase's default managed certificate for custom domains is acceptable.
- The Netlify → Firebase hand-off happens inside the Netlify build (not a separate CI service); the exact mechanism is a planning decision.
- The constitution's Principle VI was amended (v3.0.0) to say Netlify builds/previews and Firebase hosts production; the plan, research, and quickstart artifacts have been regenerated accordingly.
- Navigation decision (default, owner may override): the nav is identical on all pages and contains `main.`, `music.` (external link to the Bandcamp page, opening in a new tab) and `contact.`. `music.html` and `lookmom.html` stay reachable at their existing URLs but are not linked from the nav.
- The constitution's "Static-First, No Build Step" principle conflicts with adopting a build tool; the constitution was amended (v2.0.0) to allow a Vite build step while keeping the output static; no further constitution change is needed.
