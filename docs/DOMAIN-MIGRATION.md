# Domain migration — aberbach.co

> TECHNICAL RUNBOOK with HISTORICAL PLANNING — reconciled 19 October 2026.
> Domain/canonical code exists; dashboard activation is not certified by this file.
> The later locale, Arabic-font and measurement sections record future plans, not
> implemented routes or current Portfolio priorities. Reconfirm scope and approval
> before executing them. Read [CURRENT-STATE](portfolio/CURRENT-STATE.md),
> [actual site map](portfolio/SITE-MAP-AND-NAVIGATION.md) and
> [dated public observations](portfolio/PUBLIC-OBSERVATIONS-2026-10-19.md).

> **Status:** implementation/runbook, not a production activation record.
> See [PRODUCTION-STATE.md](PRODUCTION-STATE.md) for the dated audit.
> Dashboard actions below remain pending and are not authorized by this code pass.


The canonical website origin is **`https://aberbach.co`** — the apex.
`www.aberbach.co` is intended to redirect permanently to it and must never be
independently indexable. On 3 Oct 2026 it returned NXDOMAIN; the redirect was
not operational. HTTP also served 200 rather than redirecting to HTTPS.

Phase A (this document's subject) is domain and canonical infrastructure only.
No internationalization, no application analytics integration, no design change. The
sections after the runbook record decisions already taken for later phases so
they are not re-argued.

---

## What Phase A changed in the repository

| File | Change |
|---|---|
| `astro.config.mjs` | `site` → `https://aberbach.co`. The single source for canonical, `og:url`, sitemap and robots. |
| `src/pages/sitemap.xml.ts` | Dev fallback origin. |
| `src/pages/robots.txt.ts` | Dev fallback origin. |
| `wrangler.jsonc` | `TURNSTILE_HOSTNAMES` → `aberbach.co,www.aberbach.co`. `BRIEF_FROM` → `brief@aberbach.co`. Docs. |
| `worker/index.ts` | `www` → apex 301, as a second line of defence. Matches the host **exactly** and excludes `/api/`. |
| `tests/worker.mjs` | Origin, sender and hostname fixtures; redirect assertions. |
| `tests/domain.mjs` | **New.** The guard described below. |
| `docs/BACKEND-ACTIVATION.md` | Separates the website domain from the email sending domain. |

**Deliberately unchanged:** `BRIEF_TO`, and the public contact address
`soufianeaberbach@gmail.com` wherever it appears — on `/contact/`, in the
no-JavaScript fallback, in `/privacy/` and in every mailto link. That address
is a Gmail mailbox, not a website URL. The domain migration does not touch it,
and `npm run test:domain` asserts it is still present so a future sweep cannot
delete it either.

### The guard

`npm run test:domain` fails CI if the old website domain reappears in source or
in the built output — canonical, `og:url`, JSON-LD ids, the social image,
sitemap, robots, or the Turnstile allowlist. It also asserts that no locale
route and no analytics script has appeared, and that the noindex routes stayed
noindex.

A line may name the old domain on purpose by carrying the marker
`domain-guard-allow`; every such line is printed in the run output, so the
exemptions stay visible.

---

## Runbook — external steps, in order

Nothing below can be done from repository code. Do them in this order: the
redirect must exist before any sitemap is submitted, and the Turnstile widget
must be created **after** the domain is live so it is bound to the right host.

### 1. DNS and HTTPS — current correction, 2 November 2026

This section supersedes the historical activation instructions. Current public
checks still find www NXDOMAIN and HTTP apex returning 200. No Cloudflare account
was authenticated during this audit. Do not recreate the working apex or infer
the origin destination from Cloudflare's public anycast A/AAAA answers.

1. Inspect Workers & Pages → portfolio → Settings → Domains & Routes, plus the
   zone's DNS records. Record whether the apex uses a **Worker Custom Domain**
   or a **Worker Route**. Preserve it and the existing `/api/*` Worker-first
   routing. No routes are declared in the repository, so this is a dashboard fact.
2. For a Custom Domain deployment, add `www.aberbach.co` to the **same Worker**
   using Domains & Routes; let Cloudflare create the actual DNS and certificate.
   Check existing records first. Do not also add a conflicting CNAME.
3. For a Route deployment, a **proxied CNAME www → aberbach.co** is the existing
   runbook's proposed alias, not an invented origin. Verify that the same Worker
   route also covers www, including `/api/*`, before enabling the alias. A DNS
   alias alone does not configure Worker routing. Preserve the apex destination.
4. Verify active certificates covering both hosts, with trusted public chains.
   Do not treat an intercepted workstation certificate as public TLS evidence.
5. Use the explicit **308** HTTP rule below rather than a blanket 301 upgrade.
   Do not enable Always Use HTTPS alongside a conflicting method-changing rule.
   Inspect existing rules and their order before changing any of them.
6. Keep HSTS deferred until both hosts, TLS, redirects and API exceptions are
   independently verified. Leave email/security DNS records unchanged.

Architecture references:
[Worker Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
and [Worker Routes](https://developers.cloudflare.com/workers/configuration/routing/routes/).

### 2. Canonical redirects — ordered Cloudflare Single Redirect Rules

These are concrete proposed settings, **not deployed settings**. They run before
the Worker/static asset router, so matching built pages cannot bypass them.

**Rule 1: www → HTTPS apex, excluding the API namespace.**

Custom filter expression:

```
http.host eq "www.aberbach.co" and http.request.uri.path ne "/api" and not starts_with(http.request.uri.path, "/api/")
```

- Dynamic target: `concat("https://aberbach.co", http.request.uri.path)`
- **Preserve query string:** on
- **Status:** `308` permanent, method and body preserved

**Rule 2: HTTP → HTTPS on the same host.**

Custom filter expression:

```
not ssl and http.host in {"aberbach.co" "www.aberbach.co"}
```

- Dynamic target: `concat("https://", http.host, http.request.uri.path)`
- **Preserve query string:** on
- **Status:** `308` permanent, method and body preserved

Put Rule 1 first: an HTTP www page then reaches the HTTPS apex in one hop.
Rule 1 never matches the apex, and Rule 2 never matches HTTPS, preventing loops.
The www API remains on www; Rule 2 can upgrade its scheme without converting a
POST to GET. HTTPS `/api/brief` must still answer for itself. Existing same-origin
checks remain active: a caller carrying an HTTP Origin after an upgrade may be
refused, rather than silently accepted with a lost body. The browser Contact page
must reach HTTPS before it can render a form. Never test with a real submission
without the owner's separate explicit authorization.

The unchanged Worker fallback still uses 301 for **non-API** www requests and
excludes both `/api` and `/api/*`. It is secondary only: matching static assets
bypass it. The edge rules above are required for complete host/scheme coverage.

Verify using GET requests (not real form posts):

```sh
curl -sS -D - -o /dev/null 'http://aberbach.co/fr/contact/?verify=production&source=read-only'
curl -sS -D - -o /dev/null 'https://www.aberbach.co/es/portfolio/?verify=production&source=read-only'
curl -sS -D - -o /dev/null 'http://www.aberbach.co/fr/process/?verify=production&source=read-only'
curl -sS -D - -o /dev/null 'https://aberbach.co/fr/contact/'
curl -sS -D - 'https://aberbach.co/api/brief'
curl -sS -D - 'https://www.aberbach.co/api/brief'
npm run verify:production
npm run verify:production -- --agents
```

Expect one 308 to the exact HTTPS apex path/query for page variants, then 200.
HTTPS API GET must return 405 JSON and no-store, with no host redirect.
Check the dashboard rule status codes and method preservation; GET alone cannot
prove POST behavior. API method-preservation regression tests stay hermetic.

[Cloudflare redirect status-code semantics](https://developers.cloudflare.com/rules/url-forwarding/single-redirects/settings/).

### 3. Worker route

Confirm the Worker serves the new zone, that `run_worker_first: ["/api/*"]`
applies on `aberbach.co`, and that `POST /api/brief` is reachable there. The
Worker's origin check derives from the request URL, so it follows the new host
automatically — but confirm rather than assume.

### 4. Turnstile — Cloudflare dashboard, after the domain is live

Create the widget for `aberbach.co`, and add `www.aberbach.co` to it while the
redirect is still new. See `wrangler.jsonc` for the full activation policy and
the reason both hosts are listed. Then, together and never separately:

```sh
npx wrangler secret put TURNSTILE_SECRET
PUBLIC_TURNSTILE_SITEKEY=0x... npx wrangler deploy
```

Narrow the widget and `TURNSTILE_HOSTNAMES` to the apex alone once the redirect
has been verified stable in production.

### 5. Resend — Resend dashboard

`BRIEF_FROM` is now `brief@aberbach.co`. **Verification is pending confirmation in Resend** (3 Oct 2026 audit). Inspect the dashboard, then if needed add
`aberbach.co` as a sending domain in Resend, then add the DNS records Resend
itself generates — they are per-domain values and must be copied from the
dashboard, never guessed — and wait for Resend to report it verified. Full
steps in `docs/BACKEND-ACTIVATION.md`.

`BRIEF_TO` is a Gmail mailbox and needs no verification. Only the sender does.

### 6. Google Search Console — after the domain is live

Preferred: a **Domain property** for `aberbach.co`, verified by **DNS TXT**. It
covers the apex, `www`, every subdomain and both protocols in one record, and
it survives any future rebuild because it lives in DNS rather than in the HTML.

No verification meta tag is in the codebase and no token has been invented. If
a URL-prefix property is ever preferred instead, the insertion point is one
optional prop on `SiteLayout` fed by a `PUBLIC_GOOGLE_SITE_VERIFICATION`
build-time variable, rendering the meta tag only when set.

Then:

1. Verify the Domain property.
2. Submit `https://aberbach.co/sitemap.xml`.
3. URL-inspect the homepage.
4. URL-inspect `/expertise/`, `/portfolio/`, `/process/`, `/experience/`,
   `/contact/`.
5. The site has no geographic targeting restriction in code. Verify current
   Search Console capabilities rather than relying on a retired international
   targeting setting; metadata alone does not establish worldwide indexing.
6. If the previous domain is verified and under your control, use the **Change
   of Address** tool. It only works once its 301s are live.

### 7. Bing Webmaster Tools

**Import the verified property from Search Console.** That is the least-work
path and avoids a second verification artifact in the codebase. If verifying
independently, use DNS for the same reasons as above. No token has been
invented. Then submit the same sitemap.

### 8. Outbound links

Update the four platform profiles, the email signature and the CV to
`https://aberbach.co`, with the UTM parameters below. Easy to forget, and it is
where much of the referral traffic lives.

### 9. Post-cutover verification

Re-run `npm ci`, `npm run build`, `npx wrangler deploy --dry-run`,
`npm run test:worker`, `npm run test:domain`, `npm run test:smoke`. Then submit
one real end-to-end brief on the new domain, per the live test in
`docs/BACKEND-ACTIVATION.md`.

---

## IndexNow — not implemented, and not recommended yet

Assessed and declined. IndexNow is a push protocol consumed by Bing, Yandex,
Seznam and Naver; **Google does not use it**, which removes most of the upside
for a portfolio whose acquisition traffic will be overwhelmingly Google. Its
value scales with content churn, and this is a small, stable site that
Bing will discover from the sitemap well within the window that matters for a
considered B2B enquiry.

No key, no endpoint, no extra infrastructure.

Revisit only if the site starts publishing case studies, articles or frequent
project updates — roughly a dozen-plus URL changes a month is where it begins
to earn its keep.

---

## Later phases — decisions already taken

Recorded so they are not re-argued. **None of this is implemented.**

### Phase B — internationalization

Planned locales: English (default), French, Spanish, Arabic. Italian possibly
later. Route model:

```
en   /            /expertise/     /portfolio/     /process/     …
fr   /fr/         /fr/expertise/  /fr/portfolio/  /fr/process/  …
es   /es/         /es/expertise/  …
ar   /ar/         /ar/expertise/  …
```

Rules, all settled:

- A dedicated crawlable URL per language. No query-string switching, no
  IP-based auto redirect, no cookie-required selection.
- **Self-canonical per locale.** A French page canonicalizes to itself, never
  back to English.
- **Reciprocal hreflang**, generated from one manifest so non-reciprocity is
  not expressible. `x-default` → English.
- **No alternate link for a translation that does not exist.** A locale
  registry carries a `published` flag; hreflang, the sitemap and the switcher
  all read it, so a locale produces no URL until its content is approved.
- English route slugs stay stable — no translated slugs, no redirect debt.
- Arabic uses `lang="ar"` and `dir="rtl"`.
- **No thin pages.** A locale ships only when its visible content is genuinely
  translated, not when the navigation is.

### Phase C — wire contracts that must change before multilingual Contact

Both are prerequisites, not nice-to-haves, and neither is in Phase A.

**Stage values.** The five Contact stage values are currently human-readable
English strings used as both the visible label and the wire value, whitelisted
in `worker/index.ts` and tied together by a CI drift guard. Translating them
would make every non-English submission fail validation. They become stable
machine ids:

```
idea_reference   in_development   fit_sample   pre_production   production_issue
```

Locale dictionaries then translate the labels independently.

**Error codes.** The Worker currently returns English human-readable error
strings. It gains stable codes that locale dictionaries map to localized
messages, retaining the English text as a fallback:

```
INVALID_EMAIL        INVALID_STAGE       MESSAGE_TOO_SHORT
RATE_LIMITED         TURNSTILE_FAILED    STORAGE_UNAVAILABLE
UNREADABLE_SUBMISSION
```

### Language switcher — not implemented

Small, secondary, keyboard and screen-reader accessible. Desktop: in the
existing header. Mobile: inside the existing mobile menu. Footer access
optional. **No flags** — a flag names a country, not a language. Switches to
the **equivalent current page**, never always the homepage. No redesign.

### Arabic typography — not approved

Candidate: **IBM Plex Sans Arabic**. Not approved until visual QA, because none
of the three loaded faces — Archivo, Inter, JetBrains Mono — covers Arabic
script, so `/ar/` would otherwise render in an uncontrolled system fallback.

QA must cover **390, 430, 768, 1024, 1440** and check: display headings, line
height, navigation, form labels, buttons, mixed Arabic/Latin content, software
names, URLs, email addresses, numerals, and RTL spacing.

---

## Measurement — designed, not installed

**No analytics integration is included by application code.** The 3 Oct 2026
audit observed a Cloudflare beacon injected by hosting; its dashboard setting
is pending review and Privacy discloses it. No Google Analytics, no Tag Manager, no Meta Pixel,
no LinkedIn Insight Tag, no Clarity, no Hotjar, no advertising cookies, no
cookie banner. `npm run test:domain` asserts this.

### Event taxonomy, for a later pass

```
page_view                 portfolio_category_open   portfolio_project_view
contact_view              brief_start               brief_submit_success
brief_submit_error        email_click               linkedin_click
upwork_click              fiverr_click              freelancer_click
language_change
```

**Never collected:** name, email address, company, message content, the private
reference link, the Turnstile token, or the raw IP. An error event carries a
fixed reason code, never a message containing visitor input.

An implementation limited to this set, with no cookies and no cross-site
identifier, does not require a consent banner — that is a design goal, not an
accident.

### UTM convention

A closed vocabulary, because dozens of near-duplicate values make aggregation
impossible. Lowercase, hyphenated.

| Parameter | Allowed values |
|---|---|
| `utm_source` | `linkedin` `upwork` `fiverr` `freelancer` `email` `cv` `qr` `outreach` |
| `utm_medium` | `profile` `signature` `document` `print` `dm` `post` |
| `utm_campaign` | `portfolio` `brief` `hiring` or a quarter, e.g. `2026-q4` |
| `utm_content` | `bio-link` `featured` `about` `footer` `headline` |

Examples:

```
LinkedIn profile   ?utm_source=linkedin&utm_medium=profile&utm_campaign=portfolio&utm_content=bio-link
Email signature    ?utm_source=email&utm_medium=signature&utm_campaign=portfolio
QR on a printed CV ?utm_source=qr&utm_medium=print&utm_campaign=hiring
Upwork profile     ?utm_source=upwork&utm_medium=profile&utm_campaign=brief&utm_content=about
```

Three rules: UTMs go only on links pointing **at** the site, never on an
internal link (it would overwrite the original attribution), and a UTM'd URL
must never become a canonical — the self-canonical is built from the path
alone, so the query string is already stripped.

No attribution storage is implemented.

### Privacy

`/privacy/` states that no advertising trackers or analytics scripts are
implemented in the site code. This describes application code, not hosting injection: production was
observed adding a Cloudflare analytics/RUM beacon. See PRODUCTION-STATE.md.
Do not interpret a source test as proving no production analytics. Anything
installed later has to update that page in the same change, in every published
locale. No cookie banner while no consent-requiring tracker exists. No
fingerprinting, no invasive visitor identification.
