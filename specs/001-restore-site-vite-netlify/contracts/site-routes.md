# Contract: Public Routes

| Request | Response |
|---------|----------|
| `http://creeperspeak.com/*` | 301 to `https://creeperspeak.com/*` |
| `https://www.creeperspeak.com/*` | 301 to `https://creeperspeak.com/*` |
| `/` | `index.html` (200) |
| `/index.html`, `/music.html`, `/contact.html`, `/lookmom.html` | 200, same paths as the legacy site |
| `/css/*`, `/img/*` or hashed `/assets/*` | 200, static assets |
| any unknown path | `404.html` (404) with link to `/` |

Guarantees: no URL restructuring (FR-004); all internal links relative; every response over TLS with a valid certificate.
