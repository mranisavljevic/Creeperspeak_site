# Contract: DNS Changes at Hover

Prerequisite: Netlify site created and `creeperspeak.com` + `www.creeperspeak.com` added in Domain management (Netlify shows the exact targets; use those if they differ from below).

| Action | Type | Host | Value |
|--------|------|------|-------|
| Replace existing | A | `@` | `75.2.60.5` (Netlify load balancer) |
| Replace existing | CNAME | `www` | `<site-name>.netlify.app` |
| Leave alone | MX, TXT, others | - | - |

Do not change nameservers. Verify: `dig creeperspeak.com +short`, `dig www.creeperspeak.com +short`, then `curl -I http://creeperspeak.com` (expect 301 to https) and `curl -I https://www.creeperspeak.com` (expect 301 to apex). Allow minutes to a few hours for propagation; Netlify provisions the certificate after DNS resolves.
