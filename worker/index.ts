/* Cloudflare Worker for the development-brief endpoint.
 *
 * The site itself stays a fully static Astro build. This Worker exists only to
 * give the Contact form a real submission path: every request that matches a
 * built asset is served by Cloudflare before this code runs, so in practice
 * the only thing that reaches here is POST /api/brief. Anything else that does
 * arrive is handed straight to the ASSETS binding, which keeps the site
 * serving normally even if this file has a problem.
 *
 * Order of operations is deliberate: validate, screen for spam, PERSIST, then
 * send. The brief is written to KV before the email is attempted, so a mail
 * provider outage cannot lose a brief and the success response stays truthful
 * — it says the brief was received, which is exactly what was guaranteed.
 *
 * Types are declared locally rather than imported from @cloudflare/workers-
 * types: this project has no runtime dependencies and adding one for two
 * interfaces is not worth it.
 */

interface KVNamespaceLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

interface Env {
  /* Static assets from ./dist. Always present. */
  ASSETS: { fetch(request: Request): Promise<Response> };
  /* Durable store for submitted briefs. Absent until the namespace is bound. */
  BRIEFS?: KVNamespaceLike;
  BRIEF_TO?: string;
  BRIEF_FROM?: string;
  RESEND_API_KEY?: string;
  /* When absent, Turnstile is not enforced — see verifyTurnstile. */
  TURNSTILE_SECRET?: string;
  /* Comma-separated hostnames a Turnstile solve may come from. Not a secret.
     Required once TURNSTILE_SECRET is set — see verifyTurnstile. */
  TURNSTILE_HOSTNAMES?: string;
}

/* Must match data-action on the widget in BriefForm. A solve from any other
   widget on the account — a different form, a different site — carries a
   different action and is not accepted here. */
const TURNSTILE_ACTION = 'contact_brief';

/* Never accepted as a Turnstile hostname, even if someone puts one in the
   allowlist. A solve that claims to come from a loopback name did not come
   from the production site. */
const TURNSTILE_HOSTNAME_DENY = ['localhost', '127.0.0.1', '::1', '[::1]', '0.0.0.0'];

const STAGES = [
  'Idea / reference',
  'In development',
  'Fit / sample',
  'Pre-production',
  'Production issue',
] as const;

const LIMITS = {
  name: 120,
  company: 120,
  email: 254,
  message: 5000,
  link: 2000,
  messageMin: 10,
  /* A human cannot read the form, type a brief and submit inside 3 seconds. */
  minElapsedMs: 3_000,
  maxElapsedMs: 24 * 60 * 60 * 1000,
  perIpPerHour: 5,
};

/* How long a submitted brief is kept. Stated verbatim on /privacy/, so the two
   must be changed together. */
const RETENTION_DAYS = 90;
const RETENTION_SECONDS = RETENTION_DAYS * 24 * 60 * 60;

interface Brief {
  name: string;
  company: string;
  email: string;
  stage: string;
  message: string;
  link: string;
}

type Invalid = { field: string; error: string };

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/* Deliberately permissive: the goal is to catch typos, not to adjudicate the
   RFC. A wrong-but-plausible address is better rejected by the mail server
   than by a regex that refuses somebody's real address. */
function emailLooksValid(value: string): boolean {
  return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(value);
}

function validate(form: Record<string, unknown>): { brief: Brief } | { invalid: Invalid } {
  const name = str(form.name);
  const company = str(form.company);
  const email = str(form.email);
  const stage = str(form.stage);
  const message = str(form.message);
  const link = str(form.link);

  if (!name) return { invalid: { field: 'name', error: 'Please add your name.' } };
  if (name.length > LIMITS.name) return { invalid: { field: 'name', error: 'That name is too long.' } };
  if (company.length > LIMITS.company) return { invalid: { field: 'company', error: 'That company name is too long.' } };
  if (!email) return { invalid: { field: 'email', error: 'Please add an email address so a reply can reach you.' } };
  if (email.length > LIMITS.email || !emailLooksValid(email)) {
    return { invalid: { field: 'email', error: 'That email address does not look complete.' } };
  }
  if (!STAGES.includes(stage as (typeof STAGES)[number])) {
    return { invalid: { field: 'stage', error: 'Please choose where the product is now.' } };
  }
  if (message.length < LIMITS.messageMin) {
    return { invalid: { field: 'message', error: 'A sentence or two about what needs solving is enough.' } };
  }
  if (message.length > LIMITS.message) {
    return { invalid: { field: 'message', error: 'That is longer than the form accepts — send the detail by email instead.' } };
  }
  if (link) {
    if (link.length > LIMITS.link) return { invalid: { field: 'link', error: 'That link is too long.' } };
    let parsed: URL;
    try {
      parsed = new URL(link);
    } catch {
      return { invalid: { field: 'link', error: 'That does not look like a complete link.' } };
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { invalid: { field: 'link', error: 'Links need to start with http:// or https://' } };
    }
  }

  return { brief: { name, company, email, stage, message, link } };
}

/* Two cheap screens that need no third party, plus Turnstile when configured.
   The honeypot is a field no visible UI fills in; the timestamp catches bots
   that post instantly. */
function screenSpam(form: Record<string, unknown>): Invalid | null {
  if (str(form.website)) return { field: '', error: 'spam' };

  /* The timestamp is stamped by the page's script, so a submission without one
     is either a pre-Turnstile native POST or a bot. An absent stamp is not
     treated as suspicious by itself — the honeypot, the rate limit, the origin
     check and, once configured, Turnstile decide. */
  const raw = str(form.t);
  if (!raw) return null;

  const started = Number(raw);
  if (!Number.isFinite(started) || started <= 0) return { field: '', error: 'spam' };
  const elapsed = Date.now() - started;
  if (elapsed < LIMITS.minElapsedMs || elapsed > LIMITS.maxElapsedMs) {
    return { field: '', error: 'timing' };
  }
  return null;
}

/* Returns true when the request may proceed.
 *
 * Once TURNSTILE_SECRET is configured, EVERY submission must present a valid
 * token — scripted or not. Content type is not a credential: keying the
 * requirement off it meant anyone could skip the check by posting
 * form-urlencoded, which is trivial to do and defeats the point of having it.
 *
 * The consequence is deliberate: a visitor with JavaScript disabled cannot
 * produce a token and so cannot use the form once Turnstile is live. They get
 * the <noscript> direct-email route in BriefForm instead. Weakening the server
 * for that case would have meant weakening it for everyone.
 *
 * Verification fails CLOSED. A Turnstile outage or a malformed response
 * rejects the submission rather than waving it through — the visitor is told
 * to retry and the direct email address is on the page either way.
 *
 * success:true alone is NOT the whole check. A token is just proof that some
 * widget on this Cloudflare account was solved somewhere, so the response's
 * context is checked too:
 *
 *   - action must equal TURNSTILE_ACTION, which pins the solve to this form
 *     rather than any other widget on the account
 *   - hostname must appear in TURNSTILE_HOSTNAMES, so a token minted on a
 *     copy of the page hosted elsewhere is refused
 *
 * The allowlist is required once the secret is set. If it is missing or empty
 * the request is rejected BEFORE siteverify is called — silently skipping
 * hostname validation would be the one failure nobody notices, and failing
 * before the call also avoids spending the visitor's single-use token on a
 * check that cannot pass. Loopback names are never accepted whatever the
 * allowlist says.
 *
 * With no secret configured there is nothing to verify against, so the check
 * is skipped. That is the pre-activation state and it is safe: the honeypot,
 * timing screen, rate limit and origin check all still apply. */
function allowedTurnstileHostnames(env: Env): string[] {
  return (env.TURNSTILE_HOSTNAMES ?? '')
    .split(',')
    .map((host) => host.trim().toLowerCase())
    .filter((host) => host.length > 0 && !TURNSTILE_HOSTNAME_DENY.includes(host));
}

async function verifyTurnstile(env: Env, token: string, ip: string): Promise<boolean> {
  if (!env.TURNSTILE_SECRET) return true;
  if (!token) return false;

  const allowed = allowedTurnstileHostnames(env);
  if (allowed.length === 0) return false;

  try {
    const body = new FormData();
    body.append('secret', env.TURNSTILE_SECRET);
    body.append('response', token);
    if (ip) body.append('remoteip', ip);
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
    });
    if (!res.ok) return false;
    const data = (await res.json()) as {
      success?: boolean;
      action?: string;
      hostname?: string;
    };
    if (data.success !== true) return false;
    if (data.action !== TURNSTILE_ACTION) return false;
    const hostname = (data.hostname ?? '').trim().toLowerCase();
    if (!hostname || !allowed.includes(hostname)) return false;
    return true;
  } catch {
    return false;
  }
}

/* The raw IP is never persisted. It is hashed and truncated first: enough to
   count repeat submissions within an hour, not enough to be a stored identifier
   once the key expires. */
async function hashIp(ip: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
  return [...new Uint8Array(digest)]
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/* KV is eventually consistent, so this is a throttle rather than a hard
   ceiling. That is the right trade for spam control: approximate is enough,
   and no brief is ever rejected because a counter was a second stale. */
async function overRateLimit(env: Env, ip: string): Promise<boolean> {
  if (!env.BRIEFS || !ip) return false;
  const key = `rate:${await hashIp(ip)}:${new Date().toISOString().slice(0, 13)}`;
  try {
    const current = Number((await env.BRIEFS.get(key)) ?? '0');
    if (current >= LIMITS.perIpPerHour) return true;
    await env.BRIEFS.put(key, String(current + 1), { expirationTtl: 3600 });
  } catch {
    return false;
  }
  return false;
}

/* Native form posts get an origin check: a form POST from this site carries an
   Origin or Referer pointing back at it. This is an extra screen, never a
   substitute for Turnstile — once the secret is configured a valid token is
   required here too. Absent headers are allowed through, since some privacy
   tools strip them and the honeypot, timing and rate limit still stand. */
function sameOrigin(request: Request): boolean {
  const target = new URL(request.url).origin;
  const origin = request.headers.get('origin');
  if (origin) return origin === target;
  const referer = request.headers.get('referer');
  if (referer) {
    try {
      return new URL(referer).origin === target;
    } catch {
      return false;
    }
  }
  return true;
}

function emailText(brief: Brief, id: string): string {
  return [
    `Name:     ${brief.name}`,
    `Company:  ${brief.company || '—'}`,
    `Email:    ${brief.email}`,
    `Stage:    ${brief.stage}`,
    `Link:     ${brief.link || '—'}`,
    '',
    'What needs solving',
    '------------------',
    brief.message,
    '',
    `Reference: ${id}`,
  ].join('\n');
}

async function sendEmail(env: Env, brief: Brief, id: string): Promise<boolean> {
  if (!env.RESEND_API_KEY || !env.BRIEF_TO || !env.BRIEF_FROM) return false;
  const payload = {
    from: env.BRIEF_FROM,
    to: [env.BRIEF_TO],
    /* So replying in the mail client answers the client directly. */
    reply_to: brief.email,
    subject: `Development brief — ${brief.stage} — ${brief.name}`,
    text: emailText(brief, id),
  };
  /* Derived from the brief reference, which is already unique per submission,
     and computed once so BOTH attempts present the same key. Without it a
     retry after a request that actually reached Resend — a timeout, a dropped
     response, a 5xx returned after the send — delivers the brief twice. The
     body is built above and is never rebuilt, so the two attempts are
     byte-identical as well, which is what makes the key meaningful. */
  const idempotencyKey = `brief/${id}`;
  const body = JSON.stringify(payload);

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${env.RESEND_API_KEY}`,
          'content-type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body,
      });
      if (res.ok) return true;
    } catch {
      /* fall through to the retry */
    }
  }
  return false;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

/* The no-JS error path. A JSON body would be useless to somebody without
   scripting, so this is a small readable page with a way back; browsers
   restore the typed values on back navigation. */
function htmlError(message: string, status = 400): Response {
  const body = `<!doctype html><html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" /><title>Brief not sent</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;padding:2rem;
background:#f3f0e9;color:#11110f;font:16px/1.6 system-ui,sans-serif}
main{max-width:32rem}h1{font-size:1.5rem;margin:0 0 1rem}
a{color:#11110f;text-decoration:underline;text-underline-offset:3px}</style></head>
<body><main><h1>The brief was not sent</h1><p>${escapeHtml(message)}</p>
<p><a href="/contact/#brief">Go back to the form</a></p></main></body></html>`;
  return new Response(body, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  });
}

function json(status: number, data: Record<string, unknown>): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

/* A parsed body that is not a plain object is treated as unreadable rather
   than passed on. `JSON.parse('null')` succeeds and yields null, so a body of
   literal `null` used to reach the screens and throw on the first property
   read — answering 500 for what is plainly a malformed request. Arrays and
   scalars never threw, but they are not form bodies either, so all of them are
   refused in one place with the 400 that already exists for this. */
function isFormObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function readBody(request: Request): Promise<{ form: Record<string, unknown>; wantsJson: boolean }> {
  const type = request.headers.get('content-type') ?? '';
  if (type.includes('application/json')) {
    const parsed: unknown = await request.json();
    if (!isFormObject(parsed)) throw new Error('body is not an object');
    return { form: parsed, wantsJson: true };
  }
  const data = await request.formData();
  const form: Record<string, unknown> = {};
  data.forEach((value, key) => {
    form[key] = typeof value === 'string' ? value : '';
  });
  return { form, wantsJson: false };
}

async function handleBrief(request: Request, env: Env): Promise<Response> {
  let form: Record<string, unknown>;
  let wantsJson = true;
  try {
    const parsed = await readBody(request);
    form = parsed.form;
    wantsJson = parsed.wantsJson;
  } catch {
    return json(400, { ok: false, error: 'That submission could not be read.' });
  }

  const fail = (status: number, error: string, field = '') =>
    wantsJson ? json(status, { ok: false, error, field }) : htmlError(error, status);

  const spam = screenSpam(form);
  if (spam) {
    return fail(
      400,
      spam.error === 'timing'
        ? 'That submission looked automated. Please reload the page and try again.'
        : 'That submission was rejected as automated. Please reload the page and try again.',
    );
  }

  const checked = validate(form);
  if ('invalid' in checked) return fail(400, checked.invalid.error, checked.invalid.field);
  const brief = checked.brief;

  const ip = request.headers.get('CF-Connecting-IP') ?? '';
  if (await overRateLimit(env, ip)) {
    return fail(429, 'Several briefs have already been sent from this connection. Please email directly instead.');
  }

  /* Native form posts get an origin check as well. It is not a substitute for
     Turnstile — it is an additional, cheap screen on the path that cannot run
     the page's script. */
  if (!wantsJson && !sameOrigin(request)) {
    return fail(400, 'That submission did not come from this site. Please reload the page and try again.');
  }

  const token = str(form['cf-turnstile-response']);
  if (!(await verifyTurnstile(env, token, ip))) {
    return fail(
      400,
      'The spam check did not pass. Please reload the page and try again, or email the brief directly.',
    );
  }

  /* Persist BEFORE sending. Without a store there is nothing durable to
     promise, so the brief is refused rather than accepted and dropped. */
  if (!env.BRIEFS) {
    return fail(503, 'The form is not accepting briefs yet. Please email directly — the address is below the form.');
  }

  const id = `${new Date().toISOString()}-${crypto.randomUUID().slice(0, 8)}`;
  try {
    /* Only what is needed to read and answer the brief. Request country and
       user agent were being stored and were never used, so they are gone. */
    await env.BRIEFS.put(
      `brief:${id}`,
      JSON.stringify({ ...brief, id, receivedAt: new Date().toISOString() }),
      { expirationTtl: RETENTION_SECONDS },
    );
  } catch {
    return fail(502, 'The brief could not be saved. Please email directly — the address is below the form.');
  }

  const delivered = await sendEmail(env, brief, id);
  if (!delivered) {
    /* The brief is safe in KV, so this is not a failure for the sender. Record
       it so the gap is visible, and still report receipt, which is true. */
    try {
      await env.BRIEFS.put(
        `undelivered:${id}`,
        JSON.stringify({ id, email: brief.email, at: new Date().toISOString() }),
        { expirationTtl: RETENTION_SECONDS },
      );
    } catch {
      /* nothing further to do */
    }
  }

  /* Native form posts get a redirect to a real page rather than JSON. Reachable
     before Turnstile is activated; afterwards such a submission is rejected
     earlier, and BriefForm hides the form from no-JavaScript visitors. */
  if (!wantsJson) {
    return new Response(null, { status: 303, headers: { location: '/contact/sent/' } });
  }
  return json(200, { ok: true, id });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const isApi = url.pathname === '/api/brief';

    if (isApi) {
      /* The API answers for itself. Falling through to ASSETS on an exception
         would have served the 404 page — or a 405 — in place of an error, so a
         real fault looked like a routing mistake and the caller had no way to
         tell a bug from a bad request. */
      try {
        if (request.method !== 'POST') {
          return json(405, { ok: false, error: 'Use POST.' });
        }
        return await handleBrief(request, env);
      } catch {
        const wantsJson = (request.headers.get('content-type') ?? '').includes('application/json');
        const message =
          'Something went wrong handling the brief. Nothing was saved — please try again, or email it directly.';
        return wantsJson
          ? json(500, { ok: false, error: message })
          : htmlError(message, 500);
      }
    }

    /* Only non-API routes fall back to the static site, and that fallback is
       still guarded so a fault here cannot take the site down. */
    try {
      return await env.ASSETS.fetch(request);
    } catch {
      return env.ASSETS.fetch(request);
    }
  },
};
