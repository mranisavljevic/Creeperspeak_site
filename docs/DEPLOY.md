# Deploy Guide

Flow: GitHub -> Netlify (build + tests + previews) -> Firebase Hosting (production, `creeperspeak.com`). DNS stays at Hover.

## 1. Firebase

1. Create a Firebase project and enable Hosting.
2. Put the real project id in `.firebaserc` (placeholder: `creeperspeak-site`) and commit.
3. In Google Cloud IAM create a service account with only the **Firebase Hosting Admin** role; create a JSON key.
4. First deploy (either locally with `npx firebase login && npm run build && npx firebase deploy --only hosting`, or by merging to `master` once Netlify is set up).
5. Hosting -> Add custom domain: `creeperspeak.com`, then `www.creeperspeak.com` as **Redirect to creeperspeak.com**. The www redirect is a console-only setting (not in `firebase.json`).

## 2. Hover DNS

Do not change nameservers. Edit records only (details: `specs/001-restore-site-vite-netlify/contracts/dns-records.md`):

| Action | Type | Host | Value |
|--------|------|------|-------|
| Add (keep existing TXT/SPF) | TXT | `@` | Firebase verification string |
| Replace existing | A | `@` | A record(s) shown in Firebase console |
| Replace existing | A or CNAME | `www` | Value shown in Firebase console |
| Leave alone | MX, other TXT | - | - |

Verify:

```bash
dig creeperspeak.com +short
dig www.creeperspeak.com +short
curl -I http://creeperspeak.com        # redirect to https
curl -I https://www.creeperspeak.com   # 301 to apex
```

Propagation takes minutes to ~24 hours; the managed certificate may take a while after DNS resolves.

## 3. Netlify and GitHub

1. Create the GitHub repo and push.
2. In Netlify: import the repo; production branch `master`; enable branch deploys and Deploy Previews. Build settings come from `netlify.toml`.
3. Add env var `FIREBASE_SERVICE_ACCOUNT` (the full JSON key), scoped to the **Production** context only.
4. Do **not** add `creeperspeak.com` to Netlify. `*.netlify.app` previews send `X-Robots-Tag: noindex`.

Behaviour: non-production builds log "skipping Firebase deploy". On `master` production, a missing `FIREBASE_SERVICE_ACCOUNT` fails the build and the live site is unchanged.

## 4. Rollback

Firebase console -> Hosting -> Release history -> roll back to a previous release.

## 5. Failure drill

Blank `FIREBASE_SERVICE_ACCOUNT` in Netlify, push to `master`, confirm the build fails with a clear message and the live site still serves the previous version, then restore the variable.
