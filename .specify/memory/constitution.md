<!--
Sync Impact Report
Version change: 1.0.0 → 2.0.0
Modified principles:
  - I. Static-First, No Build Step → I. Static Output, Vite Build (redefined: Vite is now the
    required build tool; output MUST still be static files)
  - IV. Lightweight Assets (clarified: assets are checked against the built output; build-time
    optimization allowed)
  - V. Valid, Portable Markup (clarified: Vite `base` MUST keep paths relative/portable)
Added sections: Principle VI. Netlify Testing and Deployment
Removed sections: none
Modified sections: Technical Constraints (tooling and layout), Development Workflow (build and
  deploy-preview checks), Governance (unchanged in substance)
Follow-up TODOs: none. Node version and Vite major version are intentionally left to be pinned
  in package.json/.nvmrc when the tooling is added.
-->
# Creeperspeak Site Constitution

## Core Principles

### I. Static Output, Vite Build
The site MUST be built with Vite and MUST ship as plain static files (HTML, CSS, JS, assets)
produced by `vite build`. Server-side runtimes MUST NOT be introduced, and no site content MAY
require a server to render. Vite MUST be configured for multi-page output so each existing page
remains its own HTML document. Additional frameworks (e.g. React, Vue) and other bundlers MUST
NOT be introduced without a constitution amendment. JavaScript MAY be added only for a clear
user-facing need, MUST be small, and MUST degrade gracefully when disabled. Dependencies MUST
be limited to dev tooling plus what a feature clearly needs, and MUST be pinned by lockfile.
Rationale: Vite modernizes the dev and build workflow while static output keeps hosting cheap
and the site durable.

### II. Consistent Structure and Shared Styling
Every page MUST use the same document skeleton (`#wrapper`, `header` with logo and `nav`,
content `section`, `footer`) and load `normalize.css`, `main.css`, and `responsive.css` in that
order. Styling MUST live in `css/`; inline styles MUST NOT be used. Navigation links MUST be
identical across pages, with the current page marked `class="selected"`. Shared markup MAY be
factored out with build-time tooling only if the built pages still satisfy this principle.
Rationale: pages are easy to drift apart, so consistency is the guard against it.

### III. Responsive and Accessible
Every page MUST include the viewport meta tag and render usably from phone width to desktop.
Responsive rules MUST go in `css/responsive.css`. Images MUST have `alt` attributes (empty
only when purely decorative), links opening a new tab MUST use `target="_blank"` with
`rel="noopener"`, and text MUST keep readable contrast.

### IV. Lightweight Assets
Images MUST be web-optimized (resized and compressed) before or during the build; no single
image in the built output SHOULD exceed 500 KB without justification. Source file names MUST
be lowercase with underscores and use consistent extensions. Third-party scripts, fonts, and
trackers MUST NOT be added without explicit approval.

### V. Valid, Portable Markup
Pages MUST be well-formed HTML with `<!DOCTYPE html>`, `lang` on `<html>`, `charset`, and a
descriptive `<title>`. Internal links MUST be relative, and Vite `base` MUST be set so the built
site works from any host or subpath. Dead links and missing assets MUST be fixed before merging.

### VI. Netlify Testing and Deployment
The site MUST be deployed on Netlify, configured in a committed `netlify.toml` that defines the
build command (`vite build`), the publish directory, and the pinned Node version. Every pull
request MUST be verified on its Netlify Deploy Preview before merge, and `master` MUST
auto-deploy to production only after a successful build. Build output (e.g. `dist/`) and
`node_modules/` MUST NOT be committed. Secrets MUST NOT be committed; any needed values MUST be
set as Netlify environment variables.
Rationale: previews give a real-host test of every change, and a single declared pipeline keeps
deployment reproducible.

## Technical Constraints

- Tooling: Vite (via `package.json` with a lockfile) is the sole build tool; `npm run dev`,
  `npm run build`, and `npm run preview` MUST work from a clean checkout.
- Layout: HTML pages are Vite entry points at the project root; `css/` holds stylesheets;
  `img/` holds images (or `public/` for assets copied verbatim). `vite.config.*` and
  `netlify.toml` live at the root.
- Branding: lowercase "creeperspeak." wordmark and the existing visual identity MUST be
  preserved unless a change is explicitly requested.
- Copyright footer year MUST be kept current when pages are touched.
- Content changes (new pages, nav entries) MUST update every page's navigation and the Vite
  entry list.

## Development Workflow

- Changes are made on a branch and merged to `master` through a pull request; commits use
  clear, imperative messages.
- Before opening a PR, `npm run build` MUST succeed locally.
- Before merging, the author MUST open each changed page on the Netlify Deploy Preview at
  mobile and desktop widths and confirm links, images, and navigation work.
- Reviews MUST check the changes against the Core Principles above.

## Governance

This constitution supersedes other practices for this repository. Amendments require a written
change to this file, a Sync Impact Report update, and a version bump under semantic versioning:
MAJOR for removed or redefined principles, MINOR for added or materially expanded principles
or sections, PATCH for clarifications. Any deviation from a principle MUST be justified in the
change description. Compliance is reviewed on every change before merge.

**Version**: 2.0.0 | **Ratified**: 2026-11-09 | **Last Amended**: 2026-11-09
