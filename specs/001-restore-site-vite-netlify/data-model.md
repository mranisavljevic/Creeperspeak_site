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
| nav | Identical on all pages: main / music (Bandcamp, new tab) / contact |
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
| A | `@` | Netlify load balancer IP | replaces dead host |
| CNAME | `www` | `<site>.netlify.app` | Netlify redirects to apex |
| MX/TXT/others | - | unchanged | email preserved |

## Deployment
States: `building` -> `ready` (published) | `failed`. Contexts: `production` (`master`), `branch-deploy`, `deploy-preview` (PR). Production publishes only on successful build.
