# Contract: DNS Changes at Hover

Prerequisite: Firebase project created, Hosting enabled, a first successful deploy done, then Hosting -> Add custom domain for `creeperspeak.com` and for `www.creeperspeak.com` (choose "Redirect to creeperspeak.com"). Firebase shows the exact records; use those values if they differ from the shapes below.

| Action | Type | Host | Value |
|--------|------|------|-------|
| Add (keep existing TXT, e.g. SPF) | TXT | `@` | Firebase verification string |
| Replace existing | A | `@` | Firebase A record(s) shown in console |
| Replace existing | A or CNAME | `www` | Value shown in console |
| Leave alone | MX, other TXT | - | - |

Do not change nameservers. Verify: `dig creeperspeak.com +short`, `dig www.creeperspeak.com +short`, then `curl -I http://creeperspeak.com` (expect redirect to https) and `curl -I https://www.creeperspeak.com` (expect 301 to apex). Allow minutes to ~24 hours for propagation and certificate issuance.
