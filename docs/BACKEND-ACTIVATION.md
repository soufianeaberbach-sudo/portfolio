# Backend activation — Contact brief pipeline

The intended path, end to end:

```
browser → Turnstile → Worker (POST /api/brief) → BRIEFS KV → Resend → inbox
```

The site is a static Astro build. The Worker in `worker/index.ts` exists only
so the Contact form has a real submission path. Everything in this document is
operational; nothing here changes the design or the copy.

Commands below were checked against the Wrangler pinned in `devDependencies`
(4.x). If the CLI moves on, `npx wrangler <command> --help` is the authority.

---

## What "ready" means

The form is **not** production-ready until all six rows are configured *and*
one real brief has arrived end to end. A green build proves none of it.

| Item | Kind | Set with |
|---|---|---|
| `ASSETS` | binding | already in `wrangler.jsonc` |
| `BRIEF_TO` | var | already in `wrangler.jsonc` |
| `BRIEF_FROM` | var | already in `wrangler.jsonc` |
| `BRIEFS` | KV binding | step 2 |
| `RESEND_API_KEY` | Worker secret | step 3 |
| `TURNSTILE_SECRET` | Worker secret | step 4 |
| `PUBLIC_TURNSTILE_SITEKEY` | **build-time** env var | step 4 |

`PUBLIC_TURNSTILE_SITEKEY` is the odd one out and the usual cause of a broken
activation: it is not a Worker secret. Astro reads it at build time and inlines
it into the page. It is public and appears in the page source.

---

## 1. Authenticate

```sh
npx wrangler whoami          # confirms the account, or tells you to log in
npx wrangler login           # opens a browser for OAuth
```

`wrangler login` needs a real browser and outbound access to
`api.cloudflare.com`, so it has to be run from a normal workstation, not from a
sandboxed CI or agent container.

Do not paste an API token into a chat window. If a token is needed for
automation, put it in the environment as `CLOUDFLARE_API_TOKEN`.

## 2. Create and bind the KV namespace

Check first — do not create a duplicate:

```sh
npx wrangler kv namespace list
```

If no `BRIEFS` namespace exists:

```sh
npx wrangler kv namespace create portfolio-BRIEFS \
  --binding BRIEFS --update-config
```

`--update-config` writes the real namespace id into `wrangler.jsonc` for you,
which is the point: the id should never be typed by hand and a placeholder must
never be committed. The entry lands as a sibling of `vars`:

```jsonc
"kv_namespaces": [{ "binding": "BRIEFS", "id": "<real id>" }]
```

Verify the binding resolves:

```sh
npx wrangler kv key list --binding BRIEFS --remote --prefix brief:
```

Until `BRIEFS` is bound, `POST /api/brief` answers **503** and the page tells
the visitor to email directly. Nothing is ever accepted and then dropped.

## 3. Resend

Two different addresses, and they are not interchangeable:

| | Value | What it is |
|---|---|---|
| `BRIEF_TO` | `soufianeaberbach@gmail.com` | The **public contact address**. Also shown on `/contact/`, in the no-JavaScript fallback and in every mailto link. Needs no verification. |
| `BRIEF_FROM` | `brief@aberbach.co` | The **transactional sender**. Nobody writes to it. Resend requires the From domain to be one it has verified, and a `gmail.com` sender cannot be verified by a third-party relay — hence the owned domain. |

So **`aberbach.co` must be a verified sending domain in Resend**, or Resend
refuses the send. It is **not verified yet**.

1. Add `aberbach.co` in the Resend dashboard.
2. Resend then generates the DNS records for that domain and displays them.
   Copy them exactly as shown — they are per-domain values (selector names and
   key material differ per account), so they cannot be written down in advance
   and must not be guessed.
3. Add them at the DNS host for `aberbach.co`, then press Verify in Resend and
   wait for the domain to report verified.
4. Create an API key and set it as a Worker secret:

```sh
npx wrangler secret put RESEND_API_KEY     # prompts; the value is not echoed
npx wrangler secret list                   # names only, never values
```

Failure behaviour, by design: if Resend rejects or is down, the brief is
**already in KV** and an `undelivered:<reference>` record is written next to
it. The visitor is still told the brief was received, which is true.

## 4. Turnstile — both halves together

Create a Turnstile widget in the Cloudflare dashboard for the production
hostname. The canonical host is the apex, `aberbach.co`; `www.aberbach.co`
only ever 301s to it, so in normal operation a widget is solved on the apex
alone. Add `www.aberbach.co` to the widget as well while the redirect is still
new — if the redirect is mis-set, a visitor could reach the Contact page on
`www` and a widget bound to the apex only would refuse them. Narrow the widget
and `TURNSTILE_HOSTNAMES` to the apex once the redirect is verified stable.

Do not use Cloudflare's test keys in production. The widget yields a **site
key** (public) and a **secret key**.

```sh
npx wrangler secret put TURNSTILE_SECRET   # the SECRET key
```

The site key is build-time. `wrangler deploy` runs the build command from
`wrangler.jsonc` itself, so the variable must be present in the environment of
*that* deploy — exporting it for an earlier, separate build does nothing:

```sh
PUBLIC_TURNSTILE_SITEKEY=0x... npx wrangler deploy
```

or set it in the Cloudflare project's build environment variables.

The two half-configured states are not symmetrical:

- **site key set, secret missing** — widget renders, nothing verifies it.
  Harmless; this is a valid staging state.
- **secret set, site key missing from the deploy build** — the Worker demands
  a token the page cannot produce, so **every submission is rejected**. This is
  the dangerous one.

Verification fails **closed**: a missing or invalid token, a non-ok siteverify
response, or a thrown fetch all reject. Content type is not a credential —
there is no form-urlencoded or "no-JS" exemption. Visitors without JavaScript
cannot produce a token, so `BriefForm` hides the form from them and shows the
direct email route instead.

## 5. Deploy

Only after steps 1-4:

```sh
PUBLIC_TURNSTILE_SITEKEY=0x... npx wrangler deploy
```

## 6. One live end-to-end test

Submit a single brief through the real Contact page, identifying itself as
`BACKEND E2E TEST`, from an approved address.

Check all of:

- [ ] the page reports the brief was received, with a reference id
- [ ] `brief:<reference>` exists in KV and its content matches what was typed
- [ ] the stored record contains **no** IP address, country or user agent
- [ ] the brief's TTL is roughly 90 days
- [ ] the email arrives at `BRIEF_TO`
- [ ] `Reply-To` is the submitted address, so replying answers the sender
- [ ] the subject contains the stage and the name
- [ ] no `undelivered:` record was written for this reference
- [ ] no secret appears in the page source, the response or the stored record

```sh
npx wrangler kv key list --binding BRIEFS --remote --prefix brief:
npx wrangler kv key get "brief:<reference>" --binding BRIEFS --remote --text
npx wrangler kv key list --binding BRIEFS --remote --prefix undelivered:
```

Then remove the test record so no synthetic data is left behind:

```sh
npx wrangler kv key delete "brief:<reference>" --binding BRIEFS --remote
```

---

## Data kept, and for how long

| Key | Contents | TTL |
|---|---|---|
| `brief:<reference>` | the submitted fields, plus `receivedAt` | 90 days |
| `undelivered:<reference>` | reference, sender address, timestamp | 90 days |
| `rate:<hash>:<hour>` | a count | 1 hour |

The rate-limit key holds a truncated SHA-256 derived from the caller's IP,
never the address itself, and expires after an hour. `RETENTION_DAYS` in
`worker/index.ts` and the retention stated on `/privacy/` must be changed
together.

## Known operational gap

There is **no automated retry** for an `undelivered:` brief. Retrying on a
schedule needs Cloudflare Queues or a Cron Trigger, which is deliberately out
of scope here. This is not a launch blocker: the brief itself is durably
stored, so the record is a prompt to go and read it, not a lost submission.
Checking for undelivered records is a manual step:

```sh
npx wrangler kv key list --binding BRIEFS --remote --prefix undelivered:
```

## Tests

```sh
npm ci
npm run build
npx wrangler deploy --dry-run     # bundles the Worker, needs no credential
npm run test:worker               # Worker behaviour: stub KV, stub fetch
npm run test:smoke                # built site in a real browser
```

`npm run test:worker` covers the guarantees that a live test cannot
conveniently prove: Turnstile failing closed, a KV failure never reporting
success, a Resend failure after persistence preserving the brief, and an
unexpected exception never turning into a static-asset response. It needs no
Cloudflare account, no network and no browser, and uses no real credential.
