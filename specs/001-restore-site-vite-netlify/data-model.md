# Data Model

Static site; no stored data. Entities describe repository and deployment artifacts.

## Page
| Field | Rule |
|-------|------|
| file | `index.html`, `music.html`, `contact.html`, `lookmom.html`, `404.html` at repo root; same path in `dist/` |
| `<html lang>` | `en` |
| title | Non-empty, descriptive; wordmark "creeperspeak." plus page name where useful |
| skeleton | `#wrapper` > `header` (logo + `nav`) > `section` > `footer` |
| stylesheets | `normalize.css`, `main.css`, `responsive.css` in that order |
| nav | Identical on all pages: main / music (Bandcamp, new tab, `rel="noopener"`) / contact |
| footer | `creeperspeak. © <current year>` |

## Asset
| Field | Rule |
|-------|------|
| path | `css/*.css`, `img/*` (lowercase names) |
| size | Built image <= 500 KB |
| references | Relative; every reference resolves in `dist/` |
| images | `alt` present (empty only if decorative) |

## Domain configuration
| Record | Host | Value | Notes |
|--------|------|-------|-------|
| TXT | `@` | Firebase verification value | added alongside existing TXT records |
| A | `@` | Firebase Hosting IP(s) shown in console | replaces dead host |
| A or CNAME | `www` | value shown in console (`<project>.web.app` for CNAME) | console redirects `www` to apex |
| MX/other TXT | - | unchanged | email preserved |

## Hosting configuration
| File | Role |
|------|------|
| `netlify.toml` | Build command, publish dir, Node pin, noindex header. Builds and previews only |
| `firebase.json` | `hosting.public = dist`, ignore list, asset cache header; 404 page served by default |
| `.firebaserc` | Default Firebase project id (not secret) |

## Deploy credential
| Field | Rule |
|-------|------|
| name | `FIREBASE_SERVICE_ACCOUNT` (Netlify env var, Production context only) |
| value | Service-account JSON with "Firebase Hosting Admin" role |
| handling | Never committed; script writes it to an OS temp file for the CLI and deletes it afterwards |

## Deployment
States: `building` -> `tested` -> `handed-off` (live on Firebase) | `failed` (at build, test or hand-off; live site unchanged).
Contexts: `production` (`master`; hand-off to Firebase happens), `branch-deploy` and `deploy-preview` (Netlify URLs only; hand-off skipped).
