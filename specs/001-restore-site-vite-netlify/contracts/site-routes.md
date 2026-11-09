# Contract: Public Routes (served by Firebase Hosting)

| Request | Response |
|---------|----------|
| `http://creeperspeak.com/*` | Redirect to `https://creeperspeak.com/*` (Firebase automatic) |
| `https://www.creeperspeak.com/*` | 301 to `https://creeperspeak.com/*` (console redirect) |
| `/` | `index.html` (200) |
| `/index.html`, `/music.html`, `/contact.html`, `/lookmom.html` | 200, same paths as the legacy site |
| `/css/*`, `/img/*` or hashed `/assets/*` | 200, static assets |
| any unknown path | `404.html` (404) with link to `/` |

Guarantees: no URL restructuring (FR-004); all internal links relative; every response over TLS with a valid certificate. Branch/PR previews are served by Netlify at its own URLs with `X-Robots-Tag: noindex`.
