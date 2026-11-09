# Contract: Build and Deploy Configuration

`netlify.toml` (committed, repo root):

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"
```

npm scripts (`package.json`): `dev` = `vite`, `build` = `vite build`, `preview` = `vite preview`, `test` = `node scripts/check-links.mjs`.

Netlify site settings (manual, documented in README): connect GitHub repo; production branch `master`; deploy previews for PRs and branch deploys enabled; primary domain `creeperspeak.com`, `www.creeperspeak.com` added as alias; HTTPS enforced. No environment secrets are required.
