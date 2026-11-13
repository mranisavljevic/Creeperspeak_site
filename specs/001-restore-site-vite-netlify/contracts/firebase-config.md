# Contract: Firebase Hosting Configuration

`firebase.json` (repo root):
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "cleanUrls": false,
    "headers": [
      {
        "source": "/assets/**",
        "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
      }
    ]
  }
}
```
`.firebaserc`: `{ "projects": { "default": "<firebase-project-id>" } }` (placeholder `creeperspeak-site` until the owner creates the project).

Behaviour provided by Firebase Hosting without extra config: HTTP -> HTTPS on custom domains, managed certificate, `404.html` for unknown paths, `.html` paths served as-is.

Console-only settings (cannot be expressed in `firebase.json`): custom domain `creeperspeak.com`; `www.creeperspeak.com` added as a redirect to the apex.

The service account used by CI/Netlify needs only the "Firebase Hosting Admin" role.
