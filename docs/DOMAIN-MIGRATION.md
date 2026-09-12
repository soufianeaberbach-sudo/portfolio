# Domain migration — aberbach.co

The canonical website origin is **`https://aberbach.co`** — the apex.
`www.aberbach.co` is a permanent redirect to it and must never be
independently indexable.

Phase A (this document's subject) is domain and canonical infrastructure only.
No internationalization, no analytics, no tracking, no design change. The
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

### 1. DNS and HTTPS — Cloudflare dashboard

1. Add `aberbach.co` to Cloudflare and move its nameservers.
2. Apex record, **proxied** (orange cloud), pointing at wherever the Worker is
   served.
3. `www` as a **proxied CNAME to the apex**. It must be proxied, or a redirect
   rule cannot act on it.
4. Wait for Universal SSL to issue for **both** the apex and `www`. A redirect
   from `www` is useless if `https://www.aberbach.co` fails its TLS handshake
   first.
5. Turn on **Always Use HTTPS**.
6. Leave **HSTS off** until the apex is confirmed serving correctly. It is hard
   to walk back.

### 2. www → apex redirect — Cloudflare dashboard

This is the authoritative mechanism. Rules → **Redirect Rules** → create a
rule with a **custom filter expression** (not the simple hostname builder — the
`/api/` carve-out below needs an expression):

- **When incoming requests match** — edit as expression:

  ```
  http.host eq "www.aberbach.co" and not starts_with(http.request.uri.path, "/api/")
  ```

- **Then** — Dynamic redirect
- **Expression:** `concat("https://aberbach.co", http.request.uri.path)`
- **Preserve query string:** on
- **Status:** `301` permanent

**The `/api/` exclusion is not optional.** Browsers downgrade a 301 on a POST
to a GET and discard the request body, so a rule that redirected
`www.aberbach.co/api/brief` would silently destroy a submitted brief instead of
delivering it. The Worker fallback carries the identical carve-out, and
`npm run test:worker` asserts that both layers agree — including that the
expression above still excludes the prefix.

An API request on `www` should not arise in practice: the page GET is redirected
long before a form exists to submit. But the rule must not be the thing that
turns a rare case into a lost enquiry.

Why a Redirect Rule rather than relying on the Worker: it runs at the edge
before the Worker is invoked, costs no Worker invocation, and keeps working even
if the Worker errors. The Worker carries the same redirect only as a fallback,
in case this rule is ever removed or mis-scoped.

Verify with a **deep path and a query**, the apex, and the endpoint — not just
the root:

```sh
# 1. a normal page on www redirects, preserving path and query
curl -sSI "https://www.aberbach.co/process/?utm_source=linkedin" | head -n 5
# expect: HTTP/2 301
#         location: https://aberbach.co/process/?utm_source=linkedin

# 2. the apex does NOT redirect — anything else here is a loop
curl -sSI "https://aberbach.co/process/" | head -n 3
# expect: HTTP/2 200

# 3. the endpoint on www is NOT redirected by the rule
curl -sSI "https://www.aberbach.co/api/brief" | head -n 3
# expect: 405 (the endpoint answering for itself), NOT 301
```

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

`BRIEF_FROM` is now `brief@aberbach.co`. **The domain is not verified.** Add
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
5. Leave **international targeting unset** — that is what supports a worldwide
   audience. Do not set a country.
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
value scales with content churn, and this is a stable seven-route site that
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

**Nothing is installed.** No Google Analytics, no Tag Manager, no Meta Pixel,
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
implemented in the site code. **That is true and must stay true.** Anything
installed later has to update that page in the same change, in every published
locale. No cookie banner while no consent-requiring tracker exists. No
fingerprinting, no invasive visitor identification.
