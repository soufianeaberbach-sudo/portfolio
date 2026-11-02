# SEO & backend final audit — 2 November 2026

**Technical closure: NOT YET APPROVED.** Two live domain faults remain and
account-level backend, search and analytics evidence is unavailable. This report
closes the source audit/handover work only; it is not a certificate of completed
production hardening or search activation.

Audit source: latest `main` = baseline
`f12a2f04d86c2005e52ba5391ddbdc1c56a7aaaa`.
Branch: `fix/seo-backend-final-2026-11`. The obsolete CV branch is not used.
Public observations below were collected around 13:07–13:15 UTC on 2 November.
Read the eventual release receipt at the end for subsequent CI/merge evidence.

## 1. Domain & HTTPS

| Finding | Classification | Current evidence |
|---|---|---|
| HTTPS apex pages | Verified operational | All 30 localized routes returned 200 HTML, no detected noindex/challenge, exact self-canonical; public checker |
| Apex DNS/Worker origin | Partly verified; requires external dashboard access | Public traffic reaches Cloudflare. Exact Custom Domain vs Route and origin records were not authenticated |
| www | Confirmed problem | Google DNS A and CNAME queries returned Status 3/NXDOMAIN; Cloudflare DNS also supplied the zone SOA |
| HTTP apex | Confirmed problem | curl GET `http://aberbach.co/portfolio/?verify=production&source=read-only` returned 200, not HTTPS redirect; HTTP localized contact also returned 200 |
| www redirects/path/query | Confirmed incomplete | Cannot operate while www has no DNS; no successful redirect or TLS test can be claimed for this hostname |
| API | Verified operational for GET | HTTPS apex `/api/brief`: 405 `{"ok":false,"error":"Use POST."}`, `Cache-Control: no-store` |
| Public TLS | Partial independent verification | New SSL Labs run reached Ready/grade B on both IPv4 endpoints; IPv6 checks were still in progress at the last observed poll. Full chain details and current www TLS were not obtained |
| HSTS | Not applicable to activation now | Not enabled by this change; prerequisites are unmet |

The environment intercepts TLS. Its browser certificate failure is a local trust
limitation, not evidence that the public apex certificate is invalid. Independent
SSL Labs results must be completed before claiming all-address TLS validation.
Historical September certificate dates are not reused as current evidence.

The domain runbook now gives two explicit 308 rules: www pages to HTTPS apex,
excluding both `/api` and `/api/*`; then HTTP to HTTPS on the same host. Both
preserve query strings and methods. It distinguishes Worker Custom Domains
(Cloudflare creates DNS/certificates) from existing Worker Routes (verify route
coverage before using the proxied www-to-apex alias). No DNS destination or
Worker route was invented, replaced or deployed.

## 2. Backend, security and privacy

**Owner-confirmed operational:** real Contact emails arrive. No real submission,
resend, customer-record edit, manual file deletion, secret rotation or provider
reconfiguration was performed. `worker/index.ts`, Contact components, bindings,
sender and recipient are unchanged.

| Area | Classification | Evidence / limitation |
|---|---|---|
| Persistence before email | Verified in source/tests | File → KV brief → Resend. KV failure refuses receipt; attached-file rollback remains best effort |
| Provider failure | Verified in source/tests | Two immediate attempts share Resend idempotency key and byte-identical payload; brief already persisted; failed delivery gets an undelivered marker |
| Recovery | Verified in code; dashboard process unverified | Full brief survives even if the secondary marker write fails. Private manual KV triage is still required; no background replay or automatic mailbox-delivery guarantee is claimed |
| Duplicate behavior | Verified scoped behavior | Idempotency prevents duplicate provider sends within a brief's retries. Separate client resubmissions get separate brief IDs; no global submission deduplication is claimed |
| Rate limiting | Verified in source/tests | Five per IP per UTC hour, truncated SHA-256 key, 3600-second TTL. KV is eventually consistent; this is an approximate throttle, not an atomic ceiling; counter failure is fail-open |
| KV binding | Complete in source; requires external dashboard access | BRIEFS namespace `ed126be0d3d44342b0873639bdd1eb63` exists in config added on 27 October; deployed binding/version not authenticated |
| KV retention/privacy | Verified in source/tests; deployed records uninspected | Brief/undelivered TTL 7,776,000 seconds (90 days); no public record retrieval route. No client records exported |
| R2 binding | Complete in source; requires external dashboard access | BRIEF_FILES → `portfolio-brief-files`; no Worker read route |
| R2 public access/lifecycle | Requires external dashboard access | r2.dev/custom-domain access, bucket policies, existing objects and lifecycle rules could not be inspected. Private random keys are not proof that bucket public access is disabled |
| Turnstile | Verified in code; production pairing unverified | When secret is configured: every format requires a token; exact action contact_brief and allowed hostname; missing token/context, malformed/non-ok response or exception fails closed. Build-time public key must match deployed secret/widget |
| Resend | Owner-confirmed delivery; requires account evidence | Config retains brief@aberbach.co → soufianeaberbach@gmail.com with visitor Reply-To. Domain status, delivery/bounce logs and key permissions uninspected; no new mail sent |
| Validation | Verified in source/tests | Text limits, stage allowlist, link protocol, origin/referrer checks when supplied, honeypot/timing, bounded body before parsing |
| Uploads | Verified in source/tests | PDF/JPEG/PNG/WebP, extension/MIME/signature checks; WebP format tag; 10 MiB file, 11 MiB total body; sanitized names; randomized object keys |
| Public errors/cache | Verified in source/tests; GET live | Fixed safe error text, no provider response or credential disclosure; JSON/errors no-store. Native success 303 occurs only after persistence, not before form handling |
| Static security headers | Confirmed missing on sampled live apex response; corrected in code | Added _headers for nosniff, referrer policy, same-origin frame protection and camera/microphone/geolocation restrictions. Frame-ancestors self preserves same-origin document readers. No script/style CSP restriction or HSTS added |
| Privacy | Consistent with source and verification limits | All languages state 90-day KV expiry, R2 retention target with enforcement unverified, one-hour rate keys, and separate mailbox retention. No unsupported stronger deletion promise added |

### Safe R2 correction prepared, not executed

Installed Wrangler **4.127.1** help specifies positional name/prefix; the old
`--name`/`--prefix` command was stale. On an authenticated workstation:

```sh
npx wrangler r2 bucket lifecycle list portfolio-brief-files
npx wrangler r2 bucket lifecycle add --help
# Only after private rule/object-age review and required deletion approval:
npx wrangler r2 bucket lifecycle add portfolio-brief-files expire-briefs briefs/ --expire-days 90
npx wrangler r2 bucket lifecycle list portfolio-brief-files
```

**A 90-day age rule applies to existing matching objects too.** Inspect the
existing rules and object age/count inventory privately first. Files already
90 days old may become eligible for deletion. Do not overwrite unrelated rules
with lifecycle set, remove multipart cleanup, or enable deletion affecting
existing customer files without the owner's separate explicit authorization.
No lifecycle rule is reported as missing without dashboard evidence.

## 3. Technical SEO

### Verified live

The unchanged production checker covered every indexable route:
`/`, `/expertise/`, `/portfolio/`, `/process/`, `/experience/`,
`/contact/`, `/privacy/`, `/before-we-start/`, `/working-terms/`,
`/techpacks/material-credits/`, each in EN, FR and ES.

- All 30: direct 200 HTML, exact HTTPS apex self-canonical, no detected noindex
  or challenge. No page-to-page redirect chain in these direct requests.
- robots.txt: 200 text/plain, wildcard Allow /, canonical sitemap declaration.
- sitemap.xml: 200 XML, exactly the 30 expected unique URLs; no missing/duplicate
  entries against the route manifest.
- Eight named search/AI user-agent probes received indexable HTML. These are
  accessibility observations, not verified crawler-IP tests.

### Source audit and corrections

The shared layout generates HTML lang/dir, localized titles/descriptions,
self-canonicals, reciprocal EN/FR/ES and x-default (English), localized Open Graph
and Twitter values. Sitemap alternates share the same locale/path helpers.
English remains unprefixed; no Arabic, automatic language redirect or new routes.
Existing i18n CI checks built metadata, translated navigation, browser switching,
Contact mocks and Portfolio interactions.

One genuine schema vocabulary mismatch was corrected: `provider` was present on
`ProfessionalService` (a LocalBusiness subtype), while schema.org/provider is
defined for Service and other listed types, not LocalBusiness. Remove only that
property; retain the real Person/WebSite/ProfessionalService graph, publisher,
existing identity and visible Tangier location. No new commercial claims or rich
result types were added. The source-preservation receipt pins the exact changed
layout blob; it does not exempt any visual, Contact or photographic source.

The existing home title already targets Fashion Designer and Product Developer.
Visible roles and Expertise/Process cover pattern making, grading, fit,
technical documentation and 3D validation; FR/ES dictionaries contain their
natural equivalents. More explicit service-led titles and case-study copy for
CAD Pattern Development, Technical Design and Tech Pack Development belong to
the separate client-acquisition content phase. No keyword-density rewrite.

**Live audit limit:** the extended browser pass (all metadata, internal links,
widget and beacon) did not complete: Chromium rejected the environment's
intercepting certificate, then the execution environment went offline. Do not
claim a complete live hreflang/OG/JSON-LD/internal-link or browser-render audit
from the basic 30-page checker. Local CI coverage and live checks are distinct.

Portfolio fragments remain client-side states, not independent indexable case
studies. Independent project URLs are deliberately deferred.

## 4. Search engines

**Requires external dashboard access; current account status unknown.** No
Google Search Console or Bing authenticated tool/account was available. Absence
of an apex TXT in this audit is not proof of an unverified existing property.
No token was invented, sitemap submitted, indexing requested, or activation
claimed. Readable pages/sitemap do not prove inclusion or ranking.

## 5. Production tests and release evidence

Before loss of the execution environment:

| Check | Actual result |
|---|---|
| Latest main | f12a2f04d86c2005e52ba5391ddbdc1c56a7aaaa |
| Existing main GitHub CI | Success, [run 41429912912](https://github.com/soufianeaberbach-sudo/portfolio/actions/runs/41429912912), 2 November 10:34–10:51 UTC |
| npm ci | Passed after moving local npm cache into writable /tmp |
| Worker tests (unchanged runtime) | 509 passed, 0 failed |
| Stubbed production-checker tests | Passed |
| Live checker with --agents | 41 passed, 5 failed; details below |
| Local build / Wrangler dry-run | Not completed: sparse public-asset download still in progress; build could not resolve material-credits.json. Earlier telemetry write also needed local environment adjustment. Not classified as a repository production defect |
| Production browser pass | Blocked by environment certificate trust; no successful all-language visual audit claimed |
| Cloudflare account check | wrangler whoami: not authenticated |
| Authenticated deploy/version | Unavailable; source SHA cannot prove the deployed Worker version |

### Investigated live diagnostic failures

The base checker still has the historical four domain failures (33 pass/4 fail
without agent probes). The actual --agents run had 41 pass/5 fail:

1. www DNS — ENOTFOUND; independently confirmed NXDOMAIN via DNS-over-HTTPS.
2. HTTP apex → HTTPS — Node/proxy transport returned fetch failed on that probe;
   independent curl GET confirmed the underlying production defect: HTTP 200.
3. HTTPS www → apex — transport fails and DNS is missing; no valid redirect
   can be established.
4. HTTP www → HTTPS apex — same missing hostname prerequisite.
5. Python-urllib/3.12 — 403; independent curl reproduced `error code: 1010`.

No check was weakened or removed. No production POST occurred. The named
Googlebot/bingbot probes passed, but real bot access requires Security Events
and search-account fetch evidence.

## 6. Remaining owner actions — account access only

1. **Cloudflare [portfolio](https://dash.cloudflare.com/?to=/:account/workers-and-pages)
   and [zone DNS](https://dash.cloudflare.com/?to=/:account/:zone/dns/records):**
   inspect current Worker version/build and Custom Domain vs Route; apply the
   exact architecture-appropriate www and ordered 308 corrections in
   [DOMAIN-MIGRATION](../DOMAIN-MIGRATION.md). Preserve apex/email records and
   /api routing. Independently validate TLS on both hosts and repeat all localized
   path/query/loop/API GET checks. HSTS remains deferred.
2. **Cloudflare Worker Settings/Bindings and R2:** compare deployed BRIEFS and
   BRIEF_FILES bindings with the real IDs above; verify 90-day KV TTL and
   3600-second rate TTL without changing client records. In R2 Settings confirm
   public development URL disabled, no public custom domain, and inspect
   lifecycle/object ages. Apply only the prepared correction if actually needed
   and authorized after the existing-object impact check.
3. **Cloudflare [Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile)
   and [Resend](https://resend.com/domains):** inspect the current production
   widget/hostname/action, deployed secret *names*, and build-time site key
   together. Check current sender domain and delivery/bounce state. Preserve
   working values; do not rotate keys or generate a real submission.
4. **[Google Search Console](https://search.google.com/search-console):**
   inspect existing sc-domain:aberbach.co property. If verification is needed,
   use Google's actual TXT token. Inspect/submit
   https://aberbach.co/sitemap.xml; review processing and Page indexing.
   Inspect /, /expertise/, /contact/ and equivalent /fr/ and /es/ URLs for live
   access and Google-selected canonical. Request indexing where appropriate.
5. **[Bing Webmaster Tools](https://www.bing.com/webmasters):**
   inspect existing property or import the verified Search Console property;
   verify the same sitemap, Site Explorer and URL Inspection. Record real crawl
   errors; do not promise immediate indexing.
6. **Cloudflare Security Events/Web Analytics:** correlate 1010 observations
   with actual verified-bot/IP/rule events before any narrowly scoped remedy.
   Never disable protection globally or trust a spoofable user-agent allowlist.
   Confirm Web Analytics receives current visits and review field Core Web
   Vitals/available samples. Historical beacon injection is not current
   dashboard proof; no current CWV metric was obtained and no speculative
   performance change was made.
7. **Production release:** verify the CI-tested commit is deployed by the
   existing Cloudflare build integration, preserving its build-time Turnstile
   key and runtime secrets. Recheck _headers, all 30 pages, JSON-LD correction,
   localized browser navigation and the six existing CV downloads. A main merge
   alone is not a deployment receipt.

## 7. Final technical status

| Category | Status |
|---|---|
| Complete and verified | Source audit, owner-confirmed Contact delivery, 509 hermetic backend assertions, live 30-page canonical/indexability checks, robots/sitemap/API GET |
| Complete in code, awaiting deployment | Static security headers, schema property correction, corrected domain/R2 runbooks; release receipt below must distinguish CI/merge from deployment |
| Awaiting external account activation/inspection | Google/Bing state, deployed binding/privacy/lifecycle and Turnstile pairing evidence, Resend account state, analytics/security events |
| Unresolved technical blocker | www NXDOMAIN and missing HTTP→HTTPS redirect; final live browser and all-address TLS verification incomplete |
| Deferred commercial/marketing improvement | Independent Portfolio case-study routes and focused multilingual service/keyword copy; no redesign |

**Do not formally close development until the domain blockers and required
production verification above are resolved.** The working site and email pipeline
remain operational based on their respective public/owner evidence; that is not
the same as meeting this assignment's full definition of done.

## References

- [Cloudflare static asset headers](https://developers.cloudflare.com/workers/static-assets/headers/)
- [Cloudflare redirect semantics](https://developers.cloudflare.com/rules/url-forwarding/single-redirects/settings/)
- [Cloudflare Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- [R2 object lifecycle behavior](https://developers.cloudflare.com/r2/buckets/object-lifecycles/)
- [schema.org/provider](https://schema.org/provider)

## 8. Source release receipt

Published as [PR #60](https://github.com/soufianeaberbach-sudo/portfolio/pull/60)
from the latest baseline, with implementation commit
`5aaa109d8e0aa6b5a752947c7c5e601d1f443985`.
The only subsequent change for this receipt is documentation.

[Implementation CI run 41451992319](https://github.com/soufianeaberbach-sudo/portfolio/actions/runs/41451992319)
supersedes the interrupted local build attempt: production build, Wrangler
dry-run, Worker backend tests, domain/canonical guards, production-checker tests,
PNG/PDF/measurement integrity and browser smoke tests have passed. The
multilingual/CV/Portfolio suites were still running at this receipt's timestamp;
consult that run and the
[final branch CI](https://github.com/soufianeaberbach-sudo/portfolio/actions?query=branch%3Afix%2Fseo-backend-final-2026-11)
for their eventual complete results. Do not treat an in-progress run as passed.

No Worker runtime, Contact component, resource binding, image, Tech Pack or CV
file differs from the baseline. GitHub's eight-file diff confirms that scope.
This source release does not establish a Cloudflare deployment, a corrected
domain, lifecycle enforcement or search-account activation. The final merge SHA
is recorded by PR #60; the **deployed SHA remains unverified** until checked in
Cloudflare with account access.
