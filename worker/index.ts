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

/* Only the two methods used. Binary uploads must NOT go in KV — it is a
   metadata store with a small value ceiling — so an uploaded reference goes
   to a private R2 bucket and KV keeps the pointer. */
interface R2BucketLike {
  put(
    key: string,
    value: ArrayBuffer,
    options?: { httpMetadata?: { contentType?: string }; customMetadata?: Record<string, string> },
  ): Promise<unknown>;
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
  /* PRIVATE bucket for uploaded reference files. Absent until the bucket is
     bound, in which case an attached file is refused with a clear message
     rather than silently dropped — see handleBrief. Never served to the
     public: the bucket has no public URL and the Worker exposes no read
     route, so a stored reference is reachable only with account access. */
  BRIEF_FILES?: R2BucketLike;
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

/* Upload policy.
 *
 * 10 MB is deliberate rather than generous. A Worker reads the whole body into
 * memory to validate it, the runtime gives 128 MB, and the files this actually
 * exists for — a sketch, a phone photo of a fitting, a tech pack PDF, a spec
 * sheet — are comfortably under it. A larger ceiling would buy nothing and
 * risk the request being the thing that fails.
 *
 * Extension, declared type AND leading bytes all have to agree. An extension
 * is a claim by the sender and a Content-Type is a claim by the browser, so
 * neither decides alone: the magic prefix is what the bytes actually are.
 *
 * Executables and scripts are absent by design — .exe, .js, .sh, .bat, .cmd,
 * .apk, .dmg and anything else not listed simply has no entry, so the
 * allowlist refuses it without needing a blocklist to stay ahead of.
 *
 * A bare .zip is deliberately NOT accepted. The Office formats below are
 * already ZIP containers, so nothing legitimate is lost, and a bare archive is
 * the easiest way to post an executable payload into the bucket. */
const UPLOAD = {
  maxBytes: 10 * 1024 * 1024,
  maxNameLength: 120,
};

interface FileKind {
  ext: string;
  /* Content-Type values a browser plausibly sends for this extension. */
  types: string[];
  /* Leading bytes, as hex. At least one must match. */
  magic: string[];
  label: string;
}

/* PK\x03\x04 is the ZIP header the modern Office formats share; D0CF11E0 is
   the legacy OLE2 container. They cannot be told apart by magic alone, so for
   those the extension and declared type carry the distinction — which is safe
   here because a stored file is never executed or served, only downloaded by
   its recipient. */
const ZIP_MAGIC = ['504b0304', '504b0506', '504b0708'];
const OLE2_MAGIC = ['d0cf11e0a1b11ae1'];

const ACCEPTED_FILES: FileKind[] = [
  { ext: 'pdf', types: ['application/pdf'], magic: ['25504446'], label: 'PDF' },
  { ext: 'jpg', types: ['image/jpeg'], magic: ['ffd8ff'], label: 'JPEG image' },
  { ext: 'jpeg', types: ['image/jpeg'], magic: ['ffd8ff'], label: 'JPEG image' },
  { ext: 'png', types: ['image/png'], magic: ['89504e470d0a1a0a'], label: 'PNG image' },
  { ext: 'webp', types: ['image/webp'], magic: ['52494646'], label: 'WebP image' },
  { ext: 'docx', types: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'], magic: ZIP_MAGIC, label: 'Word document' },
  { ext: 'doc', types: ['application/msword'], magic: OLE2_MAGIC, label: 'Word document' },
  { ext: 'xlsx', types: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'], magic: ZIP_MAGIC, label: 'Excel workbook' },
  { ext: 'xls', types: ['application/vnd.ms-excel'], magic: OLE2_MAGIC, label: 'Excel workbook' },
  { ext: 'pptx', types: ['application/vnd.openxmlformats-officedocument.presentationml.presentation'], magic: ZIP_MAGIC, label: 'PowerPoint deck' },
  { ext: 'ppt', types: ['application/vnd.ms-powerpoint'], magic: OLE2_MAGIC, label: 'PowerPoint deck' },
];

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

/* What is recorded about an accepted upload. `key` is the R2 object key and is
   random, so it is not derivable from anything the sender controls; `name` is
   the sanitized display name, kept only so the brief email can say what the
   file was called. */
interface StoredFile {
  key: string;
  name: string;
  size: number;
  type: string;
  label: string;
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

/* Reduced to a plain, safe display name. Path separators, control characters
   and anything non-printable are gone, so the stored name cannot traverse a
   directory, inject a header into the brief email, or carry a surprise into a
   filesystem when it is eventually downloaded. The result is never used to
   build the storage key — that is random — so a hostile name is only ever
   inert text. */
function sanitizeFilename(raw: string): string {
  const base = raw.split(/[/\\]/).pop() ?? '';
  const cleaned = base
    /* eslint-disable-next-line no-control-regex */
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, '')
    .replace(/[^A-Za-z0-9._ -]/g, '_')
    .replace(/\s+/g, ' ')
    .replace(/^[._ ]+/, '')
    .trim();
  if (!cleaned || cleaned === '.' || cleaned === '..') return 'reference';
  return cleaned.length > UPLOAD.maxNameLength ? cleaned.slice(0, UPLOAD.maxNameLength) : cleaned;
}

function extensionOf(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : '';
}

function hexPrefix(bytes: Uint8Array, length: number): string {
  return [...bytes.slice(0, length)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

type UploadCheck = { kind: FileKind; bytes: ArrayBuffer; name: string } | { error: string };

/* Order matters: size before bytes, because reading a 2 GB body into memory to
   discover it is too large is the failure this is meant to avoid. */
async function validateUpload(file: File): Promise<UploadCheck> {
  const name = sanitizeFilename(file.name || 'reference');

  if (file.size === 0) {
    return { error: 'That file appears to be empty. Please choose the file again.' };
  }
  if (file.size > UPLOAD.maxBytes) {
    const mb = (UPLOAD.maxBytes / (1024 * 1024)).toFixed(0);
    return { error: `That file is larger than ${mb} MB. Please send a smaller version, or add a link to it instead.` };
  }

  const ext = extensionOf(name);
  const kind = ACCEPTED_FILES.find((candidate) => candidate.ext === ext);
  if (!kind) {
    return {
      error: 'That file type is not accepted. Please attach a PDF, an image (JPEG, PNG, WebP) or an Office document, or add a link to it instead.',
    };
  }

  /* The browser's Content-Type is advisory: some send an empty string for an
     unfamiliar extension, and a few send application/octet-stream. An empty
     value is tolerated; a value that names a DIFFERENT accepted format is not,
     because that is the mismatch worth catching. */
  const declared = (file.type || '').split(';')[0].trim().toLowerCase();
  if (declared && declared !== 'application/octet-stream' && !kind.types.includes(declared)) {
    return { error: 'That file does not look like the type its name suggests. Please check the file and try again.' };
  }

  const bytes = await file.arrayBuffer();
  if (bytes.byteLength === 0) {
    return { error: 'That file appears to be empty. Please choose the file again.' };
  }
  if (bytes.byteLength > UPLOAD.maxBytes) {
    const mb = (UPLOAD.maxBytes / (1024 * 1024)).toFixed(0);
    return { error: `That file is larger than ${mb} MB. Please send a smaller version, or add a link to it instead.` };
  }

  const head = new Uint8Array(bytes);
  const matches = kind.magic.some((magic) => hexPrefix(head, magic.length / 2) === magic);
  /* WebP is RIFF....WEBP: the container magic alone would also match a WAV, so
     the format tag is checked too. */
  const webpOk = kind.ext !== 'webp' || hexPrefix(head.slice(8), 4) === '57454250';
  if (!matches || !webpOk) {
    return {
      error: 'That file’s contents do not match its type. If it was renamed, please attach the original, or add a link instead.',
    };
  }

  return { kind, bytes, name };
}

/* The key is random and carries no part of the sender's filename, so objects
   are not enumerable or guessable from anything a visitor supplies. The
   display name rides along as metadata instead. */
async function storeUpload(env: Env, id: string, check: { kind: FileKind; bytes: ArrayBuffer; name: string }): Promise<StoredFile | null> {
  if (!env.BRIEF_FILES) return null;
  const key = `briefs/${id}/${crypto.randomUUID()}.${check.kind.ext}`;
  await env.BRIEF_FILES.put(key, check.bytes, {
    httpMetadata: { contentType: check.kind.types[0] },
    customMetadata: {
      brief: id,
      filename: check.name,
      receivedAt: new Date().toISOString(),
    },
  });
  return {
    key,
    name: check.name,
    size: check.bytes.byteLength,
    type: check.kind.types[0],
    label: check.kind.label,
  };
}

function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function emailText(brief: Brief, id: string, file: StoredFile | null): string {
  return [
    `Name:     ${brief.name}`,
    `Company:  ${brief.company || '—'}`,
    `Email:    ${brief.email}`,
    `Stage:    ${brief.stage}`,
    `Link:     ${brief.link || '—'}`,
    `File:     ${file ? `${file.name} (${file.label}, ${formatBytes(file.size)})` : '—'}`,
    '',
    'What needs solving',
    '------------------',
    brief.message,
    '',
    `Reference: ${id}`,
    ...(file
      ? [
          '',
          'Uploaded reference',
          '------------------',
          'Stored privately. It is not on a public URL and there is no link to',
          'share — open it from the R2 bucket with account access:',
          `  ${file.key}`,
        ]
      : []),
  ].join('\n');
}

async function sendEmail(env: Env, brief: Brief, id: string, file: StoredFile | null): Promise<boolean> {
  if (!env.RESEND_API_KEY || !env.BRIEF_TO || !env.BRIEF_FROM) return false;
  const payload = {
    from: env.BRIEF_FROM,
    to: [env.BRIEF_TO],
    /* So replying in the mail client answers the client directly. */
    reply_to: brief.email,
    subject: `Development brief — ${brief.stage} — ${brief.name}`,
    text: emailText(brief, id, file),
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

/* `wantsJson` is about the RESPONSE, and it is no longer the same question as
   how the body arrived. A file cannot travel in JSON, so the page posts
   multipart when one is attached — but it is still a scripted caller that
   needs a JSON answer, and it says so with an Accept header. A native
   no-JavaScript form post sends neither, and still gets HTML and a redirect. */
async function readBody(
  request: Request,
): Promise<{ form: Record<string, unknown>; wantsJson: boolean; file: File | null }> {
  const type = request.headers.get('content-type') ?? '';
  const wantsJsonReply = (request.headers.get('accept') ?? '').includes('application/json');

  if (type.includes('application/json')) {
    const parsed: unknown = await request.json();
    if (!isFormObject(parsed)) throw new Error('body is not an object');
    return { form: parsed, wantsJson: true, file: null };
  }

  const data = await request.formData();
  const form: Record<string, unknown> = {};
  let file: File | null = null;
  data.forEach((value, key) => {
    if (typeof value === 'string') {
      form[key] = value;
      return;
    }
    /* Only the one known field carries a file. Anything else arriving as a
       blob is recorded as empty rather than stored, so an extra part cannot
       smuggle a second upload past the checks. */
    if (key === 'file' && value && typeof (value as File).arrayBuffer === 'function') {
      const candidate = value as File;
      if (candidate.size > 0 || candidate.name) file = candidate;
      form[key] = candidate.name ?? '';
      return;
    }
    form[key] = '';
  });
  return { form, wantsJson: wantsJsonReply, file };
}

async function handleBrief(request: Request, env: Env): Promise<Response> {
  let form: Record<string, unknown>;
  let wantsJson = true;
  let upload: File | null = null;
  try {
    const parsed = await readBody(request);
    form = parsed.form;
    wantsJson = parsed.wantsJson;
    upload = parsed.file;
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

  /* The attached file is checked AFTER the spam screens and Turnstile, so a
     bot never gets 10 MB of validation work out of the endpoint, and BEFORE
     anything is persisted, so a rejected file cannot leave a half-recorded
     brief behind. */
  let pendingFile: { kind: FileKind; bytes: ArrayBuffer; name: string } | null = null;
  if (upload) {
    if (!env.BRIEF_FILES) {
      /* Refused, not silently dropped: accepting the brief while discarding
         the reference the sender thought they had attached would be a lie. */
      return fail(
        503,
        'Attachments are not switched on yet. Please send the brief without the file and email it separately, or add a link to it instead.',
        'file',
      );
    }
    const result = await validateUpload(upload);
    if ('error' in result) return fail(400, result.error, 'file');
    pendingFile = result;
  }

  /* Persist BEFORE sending. Without a store there is nothing durable to
     promise, so the brief is refused rather than accepted and dropped. */
  if (!env.BRIEFS) {
    return fail(503, 'The form is not accepting briefs yet. Please email directly — the address is below the form.');
  }

  const id = `${new Date().toISOString()}-${crypto.randomUUID().slice(0, 8)}`;

  /* The file goes to R2 first, so the KV record can name it and never points
     at an object that does not exist. If this fails the brief is refused
     outright: the alternative is a stored brief that claims an attachment
     nobody can find, and the sender still has their typed text to retry with. */
  let stored: StoredFile | null = null;
  if (pendingFile) {
    try {
      stored = await storeUpload(env, id, pendingFile);
    } catch {
      return fail(
        502,
        'The brief was not sent because the attached file could not be saved. Nothing you typed has been lost — please try again, or submit without the file.',
        'file',
      );
    }
  }

  try {
    /* Only what is needed to read and answer the brief. Request country and
       user agent were being stored and were never used, so they are gone.
       An upload contributes its pointer and display name — never its bytes,
       which live in R2. */
    await env.BRIEFS.put(
      `brief:${id}`,
      JSON.stringify({ ...brief, id, receivedAt: new Date().toISOString(), file: stored }),
      { expirationTtl: RETENTION_SECONDS },
    );
  } catch {
    return fail(502, 'The brief could not be saved. Please email directly — the address is below the form.');
  }

  const delivered = await sendEmail(env, brief, id, stored);
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
  return json(200, { ok: true, id, file: stored ? { name: stored.name, size: stored.size } : null });
}

/* The canonical website host. The apex only: www must never be independently
   indexable, and these two are the whole of the redirect below. Kept as
   literals rather than derived from the request, so a Worker reached on any
   other hostname — a workers.dev subdomain, a preview alias, a future
   subdomain — is never rewritten to somewhere it did not ask for. */
const CANONICAL_HOST = 'aberbach.co';
const WWW_HOST = `www.${CANONICAL_HOST}`;

/* www -> apex, as a SECOND line of defence only.
 *
 * The authoritative redirect is a Cloudflare Redirect Rule, which runs at the
 * edge before this Worker is invoked — see docs/DOMAIN-MIGRATION.md. This
 * exists because that rule lives in a dashboard and nothing in the repository
 * can prove it is still there; if it is ever removed or mis-scoped, this
 * catches the request instead of serving the site on a second indexable host.
 *
 * The match is EXACT. An earlier version redirected any hostname beginning
 * `www.`, which would have rewritten hosts this Worker has no business
 * rewriting; only www.aberbach.co is redirected and everything else passes
 * through untouched. It cannot loop, because the target host is not WWW_HOST.
 *
 * /api/* is deliberately NOT redirected, and the Cloudflare rule carries the
 * same carve-out. Browsers downgrade a 301 on a POST to a GET and drop the
 * body, so redirecting the endpoint could silently discard a brief. In
 * practice the form is only ever served from the apex — the page GET is
 * redirected long before the form exists — so an API request on www should not
 * occur; if one does it is handled normally, and the existing origin check
 * still applies. */
function redirectToApex(url: URL): Response | null {
  /* WHATWG URL lowercases the hostname, so this is already case-insensitive. */
  if (url.hostname !== WWW_HOST) return null;
  if (url.pathname === '/api' || url.pathname.startsWith('/api/')) return null;
  const target = new URL(url.href);
  target.hostname = CANONICAL_HOST;
  /* 301: permanent, so search engines transfer authority to the apex rather
     than keeping both hosts. Path and query are preserved by construction. */
  return Response.redirect(target.href, 301);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    const apexRedirect = redirectToApex(url);
    if (apexRedirect) return apexRedirect;

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
        /* Cheap gate before any parsing. formData() reads the whole body into
           memory, so an oversized upload is refused on its declared length
           rather than after it has already been buffered. The real check still
           happens on the bytes — Content-Length is a claim — but this stops the
           obvious case costing anything. Generous headroom over the file
           ceiling covers the text fields and the multipart framing. */
        const declaredLength = Number(request.headers.get('content-length') ?? '0');
        if (Number.isFinite(declaredLength) && declaredLength > UPLOAD.maxBytes + 1024 * 1024) {
          const mb = (UPLOAD.maxBytes / (1024 * 1024)).toFixed(0);
          return json(413, {
            ok: false,
            field: 'file',
            error: `That submission is too large. Attachments are limited to ${mb} MB.`,
          });
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
