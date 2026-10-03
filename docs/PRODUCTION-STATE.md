# Production state — 3 October 2026

This is a dated observation, not a dashboard inventory or proof of later activation.
Audit reference: `main` commit `8c5192095128b2c6c4e2d0a9ae865d952f97cb32`.
The trust-foundation branch is code/content only and has not been deployed.

Use three separate labels in future updates: **IMPLEMENTED IN CODE**,
**REQUIRED EXTERNAL CONFIGURATION**, **VERIFIED IN PRODUCTION**. Record the date,
evidence and deployed version when known; do not convert a runbook into a claim.

## Verified in production during the audit

- HTTPS apex served the public pages, robots and sitemap. Public canonical
  tags, social metadata and the Person/ProfessionalService graph used the apex.
- Cloudflare nameservers: `aryanna.ns.cloudflare.com`, `mustafa.ns.cloudflare.com`.
  Apex A: `104.21.79.214`, `172.67.148.208`. AAAA:
  `2606:4700:3036::6815:4fd6`, `2606:4700:3034::ac43:94d0`.
- Independent SSL Labs checks completed on all four addresses: trusted Google
  Trust Services RSA WR1 and ECDSA WE1 certificates, CN `aberbach.co`, SANs
  `aberbach.co` and `*.aberbach.co`. Valid 26 September–25 December 2026.
  TLS 1.2/1.3 worked; TLS 1.0/1.1 remained supported (grade B).
- HTTP apex served **200**, without an HTTPS redirect. `www` returned **NXDOMAIN**
  in Google/Cloudflare DNS and independent SSL diagnostics.
- GET `/api/brief` returned 405 JSON, `Use POST.`, `Cache-Control: no-store`.
  This establishes routing, not POST acceptance or storage/email readiness.
- Named Google, Bing, OpenAI and Anthropic user-agent probes received HTML.
  `Python-urllib/3.11` and `/3.12` received **403 / Cloudflare error 1010**.
  User-agent probes did not simulate real crawler IPs or TLS fingerprints.
- Contact HTML contained no Turnstile widget/site key. The Worker secret state
  was unknown. Do not infer both halves are disabled.
- Hosting injected a `static.cloudflareinsights.com/beacon.min.js` script.
  The exact Web Analytics/RUM dashboard settings were not inspected.
- Successful page responses lacked CSP, HSTS, nosniff, referrer policy,
  permissions policy and frame protection. Block responses had different headers.

The audit environment intercepted TLS; its curl certificate was not used as
public certificate evidence. No real brief or email was submitted. Page markers
cannot identify the deployed commit conclusively.

## Implemented in code, not independently activated by this branch

| Component | Repository behavior | External state at audit |
|---|---|---|
| Canonical metadata | HTTPS apex throughout | Live metadata verified; redirects incomplete |
| Worker/static assets | API prefix routed first, ASSETS fallback | Public route/assets verified; exact bindings/version uninspected |
| KV | Save brief before email; 90-day TTL | Unknown; active binding entry absent from audited main |
| R2 | Private upload pointer, rollback, no public read route | Unknown; active binding entry absent; lifecycle unverified |
| Turnstile | Fail closed when secret configured; action/hostname checks | Widget absent; secret and hostname configuration unknown |
| Resend | Two immediate idempotent attempts, undelivered marker | Unknown; docs said unverified; usual DNS record names absent |
| Gmail | Public receiving address, visitor Reply-To | Inbox delivery untested; mailbox expiry unspecified |
| Google/Bing | Sitemap/robots/canonical infrastructure | Account verification/submission/indexing unknown |

No apex TXT verification record was observed. That does not establish that a
previous Search Console verification never existed. IndexNow was intentionally
not implemented. The wildcard robots policy permits search and training agents;
Soufiane has not decided a training opt-out policy.

## Required external configuration — pending until Soufiane is home

- **Cloudflare/domain:** inspect and correct www DNS and redirect, Always Use
  HTTPS, minimum TLS and 1010/Browser Integrity Check/security events. Review
  Web Analytics and future security headers. HSTS stays deferred until domain
  behavior is stable. No settings changed in this branch.
- **Storage:** inspect existing resources before creating anything; establish
  real BRIEFS and private BRIEF_FILES bindings. Verify no public R2 domain or
  access, and a 90-day lifecycle rule on `briefs/`. No invented resource IDs.
- **Turnstile:** verify widget hostname/action configuration and activate its
  secret and build-time site key together. No key or secret added here.
- **Resend:** inspect sender verification, copy only dashboard-generated DNS
  records, establish the API secret and later authorize a delivery test.
- **Search:** log into Search Console/Bing and verify properties, sitemap
  submissions and indexing. See [DISCOVERY-ACTIVATION.md](DISCOVERY-ACTIVATION.md).
- **Operations:** assign manual undelivered checks, delivery/bounce visibility,
  deletion handling and a recovery process that respects retention. KV/R2 TTL
  does not delete Gmail copies or external shared links.

A future authorized end-to-end test must verify storage, private file retrieval,
TTL/lifecycle, Resend acceptance, Gmail receipt and Reply-To. A public GET checker
cannot prove these. No real submission is authorized by running diagnostics.

## Official documentation checked on 3 October 2026

- [Cloudflare error 1010](https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1010/)
  and [Browser Integrity Check](https://developers.cloudflare.com/waf/tools/browser-integrity-check/).
- [Web Analytics](https://developers.cloudflare.com/web-analytics/about/),
  [automatic installation](https://developers.cloudflare.com/web-analytics/get-started/),
  [FAQ](https://developers.cloudflare.com/web-analytics/faq/) and
  [RUM beacon privacy](https://developers.cloudflare.com/speed/observatory/rum-beacon/).
  Cloudflare describes browser-performance/page-view measurement, automatic
  hosting injection and a beacon that does not access cookies/browser storage.
  Its FAQ says query strings are not logged by Web Analytics. This is not a
  claim that every Cloudflare security product collects no request information.

## Evidence and verification limits

Audited main CI passed build, dry-run bundle, Worker, domain and smoke tests;
469 Worker assertions passed locally. They did not prove external activation.
The new production checker is opt-in and read-only, and is expected to fail
while these dashboard prerequisites remain unresolved. Maintain evidence dates
rather than describing an old audit as a current service guarantee.
