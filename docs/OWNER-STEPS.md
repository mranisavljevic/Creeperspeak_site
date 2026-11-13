# Owner Steps: Taking creeperspeak.com Live

Covers tasks T015, T020, T016, T021 and T032. Do them in this order. Background and rollback live in [DEPLOY.md](DEPLOY.md).

Order matters: Netlify and Firebase must work on a `*.web.app` URL **before** you touch DNS, so the domain never points at something broken.

## Before you start

- [ ] Run `npm test && npm run test:e2e` locally and confirm they pass.
- [ ] Commit the pending work on `001-restore-site-vite-netlify`.

---

## Step 1: Create the Firebase project (prep for T015)

1. Go to https://console.firebase.google.com and click **Add project**. Pick a name; note the **project id** (e.g. `creeperspeak-site` or `creeperspeak-site-1a2b3`).
2. Open **Build -> Hosting** and click **Get started** (you can skip the CLI prompts; Netlify will deploy).
3. Open https://console.cloud.google.com/iam-admin/serviceaccounts for that project:
   1. **Create service account**, name it `netlify-deploy`.
   2. Grant only the role **Firebase Hosting Admin**.
   3. Open the account -> **Keys -> Add key -> Create new key -> JSON**. A file downloads.
   4. Keep it private. Never commit it.

## Step 2: Set the project id (T015)

1. Edit `.firebaserc` and replace `creeperspeak-site` with your real project id:
   ```json
   { "projects": { "default": "<your-project-id>" } }
   ```
2. Commit it.

## Step 3: GitHub repo (T020, part 1)

1. Create an empty repo on GitHub (e.g. `creeperspeak-site`), no README or license.
2. Push:
   ```bash
   git remote add origin git@github.com:<you>/creeperspeak-site.git
   git push -u origin 001-restore-site-vite-netlify
   git push origin master
   ```
   (`master` is the production branch. If you'd rather merge via a PR, push the feature branch first and open a PR.)
3. Check the **Actions** tab: the CI workflow should go green on the branch/PR.

## Step 4: Netlify (T020, part 2)

1. https://app.netlify.com -> **Add new site -> Import an existing project -> GitHub**, pick the repo.
2. Set **Production branch** to `master`. Build command and publish dir are read from `netlify.toml`; leave the UI fields as detected.
3. Under **Site configuration -> Build & deploy -> Branches and deploy contexts**, enable **Deploy Previews** and **Branch deploys**.
4. Under **Environment variables**, add:
   - Key: `FIREBASE_SERVICE_ACCOUNT`
   - Value: paste the **entire contents** of the JSON key file
   - Scopes: **Production only** (uncheck Deploy Previews, Branch deploys, etc.)
5. **Do not** add `creeperspeak.com` as a domain in Netlify.
6. Delete the downloaded JSON key file from your machine once it's stored in Netlify.

## Step 5: Verify a preview (part of T021)

1. Push a throwaway branch or open the PR for the current branch.
2. Expected: GitHub CI green; Netlify Deploy Preview URL appears.
3. Open the Netlify deploy log and confirm it contains `skipping Firebase deploy`.
4. Click through every page on the preview URL, on desktop and your phone.

## Step 6: First production deploy (T016, part 1)

1. Merge the branch to `master`.
2. Watch the Netlify production build: build -> tests -> `firebase deploy`. It should finish well within 5 minutes.
3. Open `https://<your-project-id>.web.app` and confirm all pages load.

If the build fails with `FIREBASE_SERVICE_ACCOUNT is not set`, recheck Step 4.4 (value present, Production scope).

## Step 7: Failure drill (T021)

1. In Netlify, blank `FIREBASE_SERVICE_ACCOUNT`.
2. Push a trivial change to `master`.
3. Expected: the build **fails** with a clear message and `*.web.app` still serves the previous version.
4. Restore the variable and re-run the deploy.

## Step 8: Add the domains in Firebase (T016, part 2)

1. Firebase console -> **Hosting -> Add custom domain**.
2. Enter `creeperspeak.com`. Firebase shows a verification **TXT** record and the **A** record(s). Keep this page open.
3. Add `www.creeperspeak.com` and choose **Redirect to creeperspeak.com**.

## Step 9: Update Hover DNS (T016, part 3)

At https://www.hover.com -> **creeperspeak.com -> DNS**. Do **not** change nameservers.

| Action | Type | Host | Value |
|--------|------|------|-------|
| Add (keep existing TXT/SPF) | TXT | `@` | Firebase verification string |
| Replace existing | A | `@` | A record(s) Firebase shows |
| Replace existing | A or CNAME | `www` | Value Firebase shows |
| Leave alone | MX and other TXT | - | - |

Leave MX records alone so email at `miles@creeperspeak.com` keeps working. Go back to Firebase and click **Verify**. Propagation takes minutes to ~24 hours; the certificate may lag after that.

## Step 10: Verify the cutover (T016, T032)

```bash
dig creeperspeak.com +short
dig www.creeperspeak.com +short
curl -I http://creeperspeak.com          # redirect to https
curl -I https://www.creeperspeak.com     # 301 to https://creeperspeak.com
curl -I https://creeperspeak.com/nope    # 404
```

From two networks (home Wi-Fi and phone data):

- [ ] `http://creeperspeak.com` redirects to the HTTPS home page
- [ ] `www.creeperspeak.com` redirects to the apex
- [ ] Padlock shows a valid certificate
- [ ] Every nav link works (main, music -> Bandcamp, contact)
- [ ] An unknown path shows the "Page not found" page
- [ ] The mailto link on the contact page opens your mail app

## Step 11: Final quickstart pass (T032)

Walk through `specs/001-restore-site-vite-netlify/quickstart.md` once, click every external link (Bandcamp etc.) by hand, then tell me and I'll tick T015, T016, T020, T021, T032 in `tasks.md`.

## If something goes wrong

- **Bad release live:** Firebase console -> Hosting -> Release history -> roll back.
- **DNS mistake:** restore the old A/CNAME values in Hover (note them before editing).
- **Build failing on Netlify:** read the log; `npm run build:netlify` reproduces it locally (it skips the Firebase deploy outside production).
