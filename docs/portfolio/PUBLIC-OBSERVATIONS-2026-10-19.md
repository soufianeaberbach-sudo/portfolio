# Public observations — 19 October 2026

**REVIEW EVIDENCE · read-only GETs, 15:43–15:44 UTC.** Observed from the managed
execution environment through its inherited HTTPS proxy with TLS verification
and user-agent `Mozilla/5.0 documentation-verification`. No browser interaction,
form POST, dashboard inspection, secret access, DNS change or deployment occurred.
This extends, and does not replace, the [3 October audit](../PRODUCTION-STATE.md).

## What was observed

| Probe | Result | What this establishes |
| --- | --- | --- |
| HTTPS apex `/`, `/portfolio/`, `/contact/` | HTTP 200; expected titles and apex canonical tags | These pages were retrievable from this client at that time. |
| `/expertise/`, `/process/`, `/experience/`, `/privacy/`, `/before-we-start/`, `/working-terms/` | HTTP 200 | The remaining declared public informational routes responded. |
| `/portfolio/` HTML | Five archives (`rtw`, `activewear`, `streetwear`, `evening`, `swimwear`), ten links each; 58 `data-ww-reader` articles; `swimwear-ref-10` present | Public HTML is consistent with the merged V2.1 content contract. Not a live animation/navigation test. |
| `/robots.txt` | HTTP 200; `User-agent: *`, `Allow: /`, apex sitemap URL | Current sampled policy permits retrieval; no proof of crawler classification, training use or indexing. |
| `/sitemap.xml` | HTTP 200; nine declared HTTPS apex page URLs | Current sitemap response is present, not evidence of account submission/indexing. |
| HTTP apex `/` with redirect-following | HTTP 200, final URL remained `http://aberbach.co/` | This probe did not observe HTTP→HTTPS redirection. It does not inspect dashboard rules or guarantee all clients see the same path. |
| HTTPS www `/` | curl exit 56, CONNECT tunnel failed with proxy 403; HTTP status 000 | Environment-mediated request failure. **Not** evidence that current www DNS is NXDOMAIN or its TLS is broken. Recheck independently. |
| GET `/api/brief` | HTTP 405 | Endpoint rejects GET. No proof of POST acceptance, storage, mail or anti-bot readiness. |
| `/contact/` HTML | No `cf-turnstile` widget | No visible widget in this response. Worker secret configuration remains unknown. |
| Portfolio/Contact response headers | No CSP, HSTS, nosniff, referrer-policy, permissions-policy or frame-protection headers in sampled responses | Those header names were absent on these responses only; no complete security audit or recommendation to enable them blindly. |

## Version and service limits

Fresh Git fetch and GitHub PR metadata separately confirmed main
`a36ae62af385641f2c4d92c07bcd851d10ee24d7`, PR #42 merged at 15:41:30 UTC,
feature `34c0286978de846298dbb2a4340979dd4b8887a6`. Their trees match. The public
HTML does **not** expose an exact release SHA; do not state that a specific commit
was deployed solely from these content markers. No hosting deployment log was inspected.

No physical iPhone Safari, motion, runtime focus/return, accessibility technology,
performance, real crawler IP, public certificate-chain assessment, external DNS
inventory, Search Console/Bing, Cloudflare resources, Resend, Gmail or end-to-end
brief was verified. TLS travels through an environment proxy; no public certificate
identity claim follows from curl success. No real or synthetic brief was sent.

PR #42's GitHub CI run
[39279672922](https://github.com/soufianeaberbach-sudo/portfolio/actions/runs/39279672922)
was queued when checked during reconnaissance. Do not convert the independent
local [QA record](review/womenswear-v21/QA.md) into a claim that this CI completed.

## Reproduction boundary

Use public GET requests and inspect the actual response body and headers
separately. Count archive links inside each `section[data-ww-archive]` and reader
articles with `data-ww-reader`; raw textual ID occurrences can double-count cast
and archive doors. URL fragments are not sent to the server. Obtain a separately
authorized real-browser/device and owner/dashboard review for the unverified
behaviors. None of the runbooks is permission to change configuration.
