/* Backend tests for the brief Worker.
 *
 * Hermetic by design: no Cloudflare account, no network, no workerd. The
 * Worker module is imported directly and driven with a stub Env — a fake KV
 * namespace and a stub global fetch standing in for Turnstile and Resend. That
 * means the spam, privacy and failure-ordering guarantees are checked on every
 * run instead of only during a live end-to-end test.
 *
 * worker/index.ts is imported as TypeScript: Node 22.18+ strips the types
 * itself, so there is no build step and no bundler dependency. CI still runs
 * `wrangler deploy --dry-run` separately, which proves the same file bundles
 * for the real runtime.
 *
 * No production secret is used anywhere here. The Turnstile and Resend
 * credentials below are obvious fakes and the tests assert that neither ever
 * appears in a response body or in stored data.
 *
 *   npm run test:worker
 */

import { readFile } from 'node:fs/promises';

let worker;
try {
  worker = (await import('../worker/index.ts')).default;
} catch (error) {
  console.error(
    'Could not import worker/index.ts. This needs Node 22.18 or newer, which\n' +
      'strips TypeScript types without a build step. Current: ' + process.version,
  );
  console.error(error);
  process.exit(1);
}

/* ------------------------------------------------------------------ harness */

let passed = 0;
const failures = [];
const check = (name, ok, detail = '') => {
  if (ok) { passed += 1; console.log(`  ok   ${name}`); }
  else { failures.push(`${name}${detail ? ' — ' + detail : ''}`); console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
};
const group = (name) => console.log(`\n${name}`);

/* Deliberately unmistakable fakes. Asserted never to leak. */
const FAKE_TURNSTILE_SECRET = '0xFAKE-TURNSTILE-SECRET-FOR-TESTS';
const FAKE_RESEND_KEY = 're_FAKE_KEY_FOR_TESTS';

const ORIGIN = 'https://aberbach.co';
const ENDPOINT = `${ORIGIN}/api/brief`;
const RETENTION_SECONDS = 90 * 24 * 60 * 60;

/* A stub KV namespace. `failPut` decides per key whether the write throws, so
   a brief write can fail while the rate-limit write succeeds. */
function makeKv({ failPut = () => false, failGet = false } = {}) {
  const store = new Map();
  return {
    store,
    puts: [],
    async get(key) {
      if (failGet) throw new Error('kv unavailable');
      const entry = store.get(key);
      return entry ? entry.value : null;
    },
    async put(key, value, options = {}) {
      this.puts.push({ key, ttl: options.expirationTtl });
      if (failPut(key)) throw new Error('kv write failed');
      store.set(key, { value, ttl: options.expirationTtl });
    },
    keys(prefix) {
      return [...store.keys()].filter((k) => k.startsWith(prefix));
    },
    read(key) {
      const entry = store.get(key);
      return entry ? JSON.parse(entry.value) : null;
    },
    ttl(key) {
      const entry = store.get(key);
      return entry ? entry.ttl : null;
    },
  };
}

/* Stub R2. Records every put so a test can assert the key shape, the metadata
   and — importantly — that bytes never reach KV. */
function makeR2({ failPut = false, failDelete = false } = {}) {
  return {
    objects: new Map(),
    puts: [],
    deletes: [],
    async put(key, value, options = {}) {
      this.puts.push({ key, size: value.byteLength, options });
      if (failPut) throw new Error('r2 unavailable');
      this.objects.set(key, { value, options });
    },
    async delete(key) {
      this.deletes.push(key);
      if (failDelete) throw new Error('r2 delete unavailable');
      this.objects.delete(key);
    },
    keys() { return [...this.objects.keys()]; },
  };
}

/* Minimal real file bodies. Each begins with the magic its extension claims,
   so validation is exercised on bytes rather than on a label. */
const MAGIC = {
  pdf: [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37],
  jpg: [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46],
  png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  webp: [0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50],
  zip: [0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00],
  ole2: [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1],
  exe: [0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00],
  none: [0x00, 0x01, 0x02, 0x03],
};

function makeFile(name, kind, { type, bytes = 2048 } = {}) {
  const head = MAGIC[kind] ?? MAGIC.none;
  const buf = new Uint8Array(Math.max(bytes, head.length));
  buf.set(head, 0);
  for (let i = head.length; i < buf.length; i += 1) buf[i] = i % 251;
  const MIME = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    doc: 'application/msword',
    xls: 'application/vnd.ms-excel',
  };
  const ext = name.includes('.') ? name.split('.').pop().toLowerCase() : '';
  return new File([buf], name, { type: type ?? MIME[ext] ?? 'application/octet-stream' });
}

/* Scripted multipart: what the page sends when a file is attached. Accept
   names JSON, so the Worker answers JSON even though the body is multipart. */
function multipartRequest(fields, file, { ip = '203.0.113.9', headers = {} } = {}) {
  const body = new FormData();
  Object.entries(fields).forEach(([k, v]) => body.append(k, String(v)));
  if (file) body.append('file', file, file.name);
  return new Request(ENDPOINT, {
    method: 'POST',
    headers: { accept: 'application/json', origin: ORIGIN, 'CF-Connecting-IP': ip, ...headers },
    body,
  });
}

let assetsCalls = 0;
function makeEnv(overrides = {}) {
  return {
    ASSETS: { async fetch() { assetsCalls += 1; return new Response('static asset', { status: 200 }); } },
    BRIEF_TO: 'soufianeaberbach@gmail.com',
    BRIEF_FROM: 'brief@aberbach.co',
    ...overrides,
  };
}

/* Stub global fetch. Every outbound call is recorded so the Resend payload can
   be inspected, and each host has an explicit scripted outcome. */
const realFetch = globalThis.fetch;
let outbound = [];
let routes = {};
globalThis.fetch = async (input, init = {}) => {
  const url = typeof input === 'string' ? input : input.url;
  outbound.push({ url, init });
  const host = new URL(url).host;
  const handler = routes[host];
  if (!handler) throw new Error(`unexpected outbound request to ${host}`);
  return handler(init, outbound.filter((c) => new URL(c.url).host === host).length);
};
const resetOutbound = (newRoutes = {}) => { outbound = []; routes = newRoutes; };

/* The action and hostname the Worker requires. TURNSTILE_ACTION must match
   data-action on the widget in BriefForm; ALLOWED_HOSTS mirrors the
   TURNSTILE_HOSTNAMES var in wrangler.jsonc. */
const TURNSTILE_ACTION = 'contact_brief';
const ALLOWED_HOSTS = 'aberbach.co,www.aberbach.co';

const siteverify = (extra = {}) =>
  new Response(JSON.stringify({ success: true, action: TURNSTILE_ACTION, hostname: 'aberbach.co', ...extra }), { status: 200 });

const turnstileOk = () => siteverify();
const turnstileBad = () => new Response(JSON.stringify({ success: false, 'error-codes': ['invalid-input-response'] }), { status: 200 });
const turnstileDown = () => { throw new TypeError('fetch failed'); };
const resendOk = () => new Response(JSON.stringify({ id: 'msg_fake' }), { status: 200 });
const resendDown = () => new Response('upstream error', { status: 500 });

/* A brief that passes validation. `t` is stamped far enough in the past to
   clear the 3-second minimum without tripping the 24-hour maximum. */
function goodFields(extra = {}) {
  return {
    name: 'BACKEND E2E TEST',
    company: 'Test Co',
    email: 'test@example.com',
    stage: 'Fit / sample',
    message: 'This is a synthetic backend test brief with enough characters.',
    link: 'https://example.com/reference',
    website: '',
    t: String(Date.now() - 10_000),
    ...extra,
  };
}

function jsonRequest(fields, { method = 'POST', ip = '203.0.113.9', headers = {} } = {}) {
  return new Request(ENDPOINT, {
    method,
    headers: { 'content-type': 'application/json', origin: ORIGIN, 'CF-Connecting-IP': ip, ...headers },
    body: JSON.stringify(fields),
  });
}

function formRequest(fields, { ip = '203.0.113.9', headers = {} } = {}) {
  const body = new URLSearchParams();
  Object.entries(fields).forEach(([k, v]) => body.append(k, String(v)));
  return new Request(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', origin: ORIGIN, 'CF-Connecting-IP': ip, ...headers },
    body: body.toString(),
  });
}

async function call(request, env) {
  const res = await worker.fetch(request, env);
  const text = await res.clone().text();
  let body = null;
  try { body = JSON.parse(text); } catch {}
  return { res, text, body, status: res.status };
}

const noStore = (res) => (res.headers.get('cache-control') ?? '').includes('no-store');

/* Outbound headers are recorded as the plain object the Worker passed, so the
   lookup is case-insensitive rather than assuming a particular spelling. */
function headerOf(call, name) {
  const headers = call?.init?.headers ?? {};
  const hit = Object.keys(headers).find((k) => k.toLowerCase() === name.toLowerCase());
  return hit ? headers[hit] : undefined;
}

/* ----------------------------------------------------------------- 1. happy */

group('1. valid submission, no Turnstile configured');
{
  resetOutbound({ 'api.resend.com': resendOk });
  const kv = makeKv();
  const env = makeEnv({ BRIEFS: kv, RESEND_API_KEY: FAKE_RESEND_KEY });
  const fields = goodFields();
  const { status, body, res } = await call(jsonRequest(fields), env);

  check('responds 200', status === 200, `status ${status}`);
  check('reports ok', body?.ok === true);
  check('returns a reference id', typeof body?.id === 'string' && body.id.length > 10, String(body?.id));
  check('success response is no-store', noStore(res));

  const briefKeys = kv.keys('brief:');
  check('exactly one brief persisted', briefKeys.length === 1, `${briefKeys.length} keys`);
  const stored = kv.read(briefKeys[0]);
  check('stored key matches returned reference', briefKeys[0] === `brief:${body.id}`);
  check('stored name matches submission', stored?.name === fields.name);
  check('stored email matches submission', stored?.email === fields.email);
  check('stored stage matches submission', stored?.stage === fields.stage);
  check('stored message matches submission', stored?.message === fields.message);
  check('stored link matches submission', stored?.link === fields.link);
  check('stored record has receivedAt', typeof stored?.receivedAt === 'string');
  check('brief TTL is the 90-day retention', kv.ttl(briefKeys[0]) === RETENTION_SECONDS, String(kv.ttl(briefKeys[0])));

  const raw = JSON.stringify(stored);
  check('raw IP is NOT stored', !raw.includes('203.0.113.9'), raw.slice(0, 120));
  check('no userAgent stored', !('userAgent' in (stored ?? {})));
  check('no country stored', !('country' in (stored ?? {})));
  check('honeypot field not stored', !('website' in (stored ?? {})));
  check('timing stamp not stored', !('t' in (stored ?? {})));

  const rateKeys = kv.keys('rate:');
  check('rate-limit key written', rateKeys.length === 1, `${rateKeys.length} keys`);
  check('rate-limit key holds no raw IP', !rateKeys[0].includes('203.0.113.9'), rateKeys[0]);
  check('rate-limit TTL is one hour', kv.ttl(rateKeys[0]) === 3600, String(kv.ttl(rateKeys[0])));

  const mail = outbound.find((c) => c.url.includes('api.resend.com'));
  check('Resend was called', Boolean(mail));
  const payload = mail ? JSON.parse(mail.init.body) : {};
  check('Reply-To equals the submitted email', payload.reply_to === fields.email, String(payload.reply_to));
  check('subject contains the stage', String(payload.subject).includes(fields.stage), String(payload.subject));
  check('subject contains the name', String(payload.subject).includes(fields.name), String(payload.subject));
  check('sends from BRIEF_FROM', payload.from === 'brief@aberbach.co', String(payload.from));
  check('sends to BRIEF_TO', Array.isArray(payload.to) && payload.to[0] === 'soufianeaberbach@gmail.com');
  check('email body carries the reference', String(payload.text).includes(body.id));
  check('no undelivered record on success', kv.keys('undelivered:').length === 0);
  check('ASSETS never served the API route', assetsCalls === 0, `${assetsCalls} calls`);
}

group('native form post succeeds with a redirect, not JSON');
{
  resetOutbound({ 'api.resend.com': resendOk });
  const kv = makeKv();
  const env = makeEnv({ BRIEFS: kv, RESEND_API_KEY: FAKE_RESEND_KEY });
  const { status, res } = await call(formRequest(goodFields()), env);
  check('responds 303', status === 303, `status ${status}`);
  check('redirects to the sent page', res.headers.get('location') === '/contact/sent/', String(res.headers.get('location')));
  check('brief still persisted', kv.keys('brief:').length === 1);
}

group('native form post from a foreign origin is rejected');
{
  resetOutbound({});
  const kv = makeKv();
  const env = makeEnv({ BRIEFS: kv });
  const { status, text } = await call(formRequest(goodFields(), { headers: { origin: 'https://evil.example' } }), env);
  check('responds 400', status === 400, `status ${status}`);
  check('nothing persisted', kv.keys('brief:').length === 0);
  check('answers HTML, not JSON', text.startsWith('<!doctype html'));
}

/* ------------------------------------------------------------ 2-4. validation */

group('2. invalid email');
{
  resetOutbound({});
  const kv = makeKv();
  const env = makeEnv({ BRIEFS: kv });
  const { status, body, res } = await call(jsonRequest(goodFields({ email: 'not-an-email' })), env);
  check('responds 400', status === 400, `status ${status}`);
  check('names the email field', body?.field === 'email', String(body?.field));
  check('does not claim success', body?.ok === false);
  check('error response is no-store', noStore(res));
  check('nothing persisted', kv.keys('brief:').length === 0);
  check('no email attempted', outbound.length === 0);
}

group('3. invalid stage');
{
  resetOutbound({});
  const kv = makeKv();
  const env = makeEnv({ BRIEFS: kv });
  const { status, body } = await call(jsonRequest(goodFields({ stage: 'Whatever I like' })), env);
  check('responds 400', status === 400, `status ${status}`);
  check('names the stage field', body?.field === 'stage', String(body?.field));
  check('nothing persisted', kv.keys('brief:').length === 0);
}

group('4. message too short');
{
  resetOutbound({});
  const kv = makeKv();
  const env = makeEnv({ BRIEFS: kv });
  const { status, body } = await call(jsonRequest(goodFields({ message: 'too short' })), env);
  check('responds 400', status === 400, `status ${status}`);
  check('names the message field', body?.field === 'message', String(body?.field));
  check('nothing persisted', kv.keys('brief:').length === 0);
}

group('validation also rejects a non-http link');
{
  resetOutbound({});
  const kv = makeKv();
  const env = makeEnv({ BRIEFS: kv });
  const { status, body } = await call(jsonRequest(goodFields({ link: 'javascript:alert(1)' })), env);
  check('responds 400', status === 400, `status ${status}`);
  check('names the link field', body?.field === 'link', String(body?.field));
  check('nothing persisted', kv.keys('brief:').length === 0);
}

/* --------------------------------------------------------------- 5-7. spam */

group('5. honeypot filled');
{
  resetOutbound({});
  const kv = makeKv();
  const env = makeEnv({ BRIEFS: kv });
  const { status, body } = await call(jsonRequest(goodFields({ website: 'https://spam.example' })), env);
  check('responds 400', status === 400, `status ${status}`);
  check('does not claim success', body?.ok === false);
  check('nothing persisted', kv.keys('brief:').length === 0);
  check('no email attempted', outbound.length === 0);
}

group('6. too-fast submission');
{
  resetOutbound({});
  const kv = makeKv();
  const env = makeEnv({ BRIEFS: kv });
  const { status, body } = await call(jsonRequest(goodFields({ t: String(Date.now()) })), env);
  check('responds 400', status === 400, `status ${status}`);
  check('flagged as automated', /automated/i.test(String(body?.error)), String(body?.error));
  check('nothing persisted', kv.keys('brief:').length === 0);
}

group('6b. an absent timing stamp is not treated as spam by itself');
{
  resetOutbound({ 'api.resend.com': resendOk });
  const kv = makeKv();
  const env = makeEnv({ BRIEFS: kv, RESEND_API_KEY: FAKE_RESEND_KEY });
  const fields = goodFields();
  delete fields.t;
  const { status, body } = await call(jsonRequest(fields), env);
  check('responds 200', status === 200, `status ${status}`);
  check('reports ok', body?.ok === true);
}

group('7. rate limit');
{
  resetOutbound({});
  const kv = makeKv();
  /* Prefill this hour's bucket at the ceiling. The key is derived the same way
     the Worker derives it, from a truncated SHA-256 of the IP. */
  const ip = '203.0.113.55';
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
  const hashed = [...new Uint8Array(digest)].slice(0, 8).map((b) => b.toString(16).padStart(2, '0')).join('');
  const key = `rate:${hashed}:${new Date().toISOString().slice(0, 13)}`;
  await kv.put(key, '5', { expirationTtl: 3600 });
  const env = makeEnv({ BRIEFS: kv });
  const { status, body } = await call(jsonRequest(goodFields(), { ip }), env);
  check('responds 429', status === 429, `status ${status}`);
  check('does not claim success', body?.ok === false);
  check('nothing persisted', kv.keys('brief:').length === 0);
  check('no email attempted', outbound.length === 0);
}

/* ------------------------------------------------------ 8-10. storage + mail */

group('8. missing KV binding');
{
  resetOutbound({});
  const env = makeEnv();
  const { status, body } = await call(jsonRequest(goodFields()), env);
  check('responds 503', status === 503, `status ${status}`);
  check('does NOT claim success', body?.ok === false);
  check('points at the direct email route', /email directly/i.test(String(body?.error)), String(body?.error));
  check('no email attempted with nowhere to persist', outbound.length === 0);
}

group('9. KV write failure');
{
  resetOutbound({});
  const kv = makeKv({ failPut: (key) => key.startsWith('brief:') });
  const env = makeEnv({ BRIEFS: kv, RESEND_API_KEY: FAKE_RESEND_KEY });
  const { status, body } = await call(jsonRequest(goodFields()), env);
  check('responds 502', status === 502, `status ${status}`);
  check('does NOT claim success', body?.ok === false);
  check('no reference id handed out', body?.id === undefined);
  check('nothing persisted', kv.keys('brief:').length === 0);
  check('no email sent for an unsaved brief', outbound.length === 0);
}

group('10. Resend failure after successful KV persistence');
{
  resetOutbound({ 'api.resend.com': resendDown });
  const kv = makeKv();
  const env = makeEnv({ BRIEFS: kv, RESEND_API_KEY: FAKE_RESEND_KEY });
  const { status, body } = await call(jsonRequest(goodFields()), env);

  check('still responds 200 — receipt was guaranteed by persistence', status === 200, `status ${status}`);
  check('reports ok', body?.ok === true);
  check('brief IS preserved', kv.keys('brief:').length === 1);
  check('preserved brief is readable', kv.read(`brief:${body.id}`)?.email === 'test@example.com');
  check('brief TTL is the 90-day retention', kv.ttl(`brief:${body.id}`) === RETENTION_SECONDS);

  const undelivered = kv.keys('undelivered:');
  check('undelivered record written', undelivered.length === 1, `${undelivered.length} keys`);
  check('undelivered record keyed by the same reference', undelivered[0] === `undelivered:${body.id}`);
  check('undelivered record has the 90-day TTL', kv.ttl(undelivered[0]) === RETENTION_SECONDS, String(kv.ttl(undelivered[0])));
  check('undelivered record holds no raw IP', !JSON.stringify(kv.read(undelivered[0])).includes('203.0.113.9'));
  const calls = outbound.filter((c) => c.url.includes('api.resend.com'));
  check('delivery was retried once before giving up', calls.length === 2, `${calls.length} attempts`);

  /* Without an idempotency key, a retry after a request that actually reached
     Resend — a timeout, a dropped response, a 5xx returned after the send —
     delivers the brief twice. */
  const keys = calls.map((c) => headerOf(c, 'idempotency-key'));
  check('both attempts carry an Idempotency-Key', keys.every(Boolean), JSON.stringify(keys));
  check('both attempts use the SAME key', keys[0] === keys[1], JSON.stringify(keys));
  check('the key derives from the brief reference', keys[0] === `brief/${body.id}`, String(keys[0]));
  check('the key contains the brief id', String(keys[0]).includes(body.id), String(keys[0]));
  check('the retry payload is byte-identical', calls[0].init.body === calls[1].init.body);
  check('the key carries no secret', !String(keys[0]).includes(FAKE_RESEND_KEY) && !String(keys[0]).includes(FAKE_TURNSTILE_SECRET));
}

group('10c. different briefs get different idempotency keys');
{
  const seen = [];
  for (let i = 0; i < 3; i += 1) {
    resetOutbound({ 'api.resend.com': resendOk });
    const kv = makeKv();
    const env = makeEnv({ BRIEFS: kv, RESEND_API_KEY: FAKE_RESEND_KEY });
    const { body } = await call(jsonRequest(goodFields()), env);
    const call0 = outbound.find((c) => c.url.includes('api.resend.com'));
    const key = headerOf(call0, 'idempotency-key');
    check(`submission ${i + 1} key matches its own reference`, key === `brief/${body.id}`, String(key));
    seen.push(key);
  }
  check('three submissions produced three distinct keys', new Set(seen).size === 3, JSON.stringify(seen));
}

group('10d. a delivery that succeeds first time is not retried');
{
  resetOutbound({ 'api.resend.com': resendOk });
  const kv = makeKv();
  const env = makeEnv({ BRIEFS: kv, RESEND_API_KEY: FAKE_RESEND_KEY });
  await call(jsonRequest(goodFields()), env);
  const calls = outbound.filter((c) => c.url.includes('api.resend.com'));
  check('exactly one attempt', calls.length === 1, `${calls.length} attempts`);
  check('it still carries an Idempotency-Key', Boolean(headerOf(calls[0], 'idempotency-key')));
  check('the API key is sent as a bearer token, not in the idempotency key', String(headerOf(calls[0], 'authorization')).startsWith('Bearer '));
}

group('10b. email is skipped, not failed, when Resend is unconfigured');
{
  resetOutbound({});
  const kv = makeKv();
  const env = makeEnv({ BRIEFS: kv });
  const { status, body } = await call(jsonRequest(goodFields()), env);
  check('responds 200', status === 200, `status ${status}`);
  check('brief preserved', kv.keys('brief:').length === 1);
  check('no outbound request attempted', outbound.length === 0);
  check('gap recorded as undelivered', kv.keys('undelivered:').length === 1);
}

/* ------------------------------------------------------------ 11-13. Turnstile */

group('11. Turnstile secret enabled + missing token');
{
  resetOutbound({});
  const kv = makeKv();
  const env = makeEnv({ BRIEFS: kv, TURNSTILE_SECRET: FAKE_TURNSTILE_SECRET, TURNSTILE_HOSTNAMES: ALLOWED_HOSTS });
  const { status, body } = await call(jsonRequest(goodFields()), env);
  check('rejects', status === 400, `status ${status}`);
  check('does not claim success', body?.ok === false);
  check('nothing persisted', kv.keys('brief:').length === 0);
  check('siteverify not even called without a token', outbound.length === 0);
  check('secret does not leak into the response', !JSON.stringify(body).includes(FAKE_TURNSTILE_SECRET));
}

group('11b. a form-urlencoded post cannot skip Turnstile');
{
  resetOutbound({});
  const kv = makeKv();
  const env = makeEnv({ BRIEFS: kv, TURNSTILE_SECRET: FAKE_TURNSTILE_SECRET, TURNSTILE_HOSTNAMES: ALLOWED_HOSTS });
  const { status, text } = await call(formRequest(goodFields()), env);
  check('rejects', status === 400, `status ${status}`);
  check('nothing persisted', kv.keys('brief:').length === 0);
  check('secret does not leak into the HTML error', !text.includes(FAKE_TURNSTILE_SECRET));
}

group('12. Turnstile invalid token');
{
  resetOutbound({ 'challenges.cloudflare.com': turnstileBad });
  const kv = makeKv();
  const env = makeEnv({ BRIEFS: kv, TURNSTILE_SECRET: FAKE_TURNSTILE_SECRET, TURNSTILE_HOSTNAMES: ALLOWED_HOSTS });
  const { status, body } = await call(jsonRequest(goodFields({ 'cf-turnstile-response': 'bogus-token' })), env);
  check('rejects', status === 400, `status ${status}`);
  check('siteverify was consulted', outbound.length === 1, `${outbound.length} calls`);
  check('nothing persisted', kv.keys('brief:').length === 0);
  check('secret does not leak into the response', !JSON.stringify(body).includes(FAKE_TURNSTILE_SECRET));
}

group('13. Turnstile siteverify network failure fails CLOSED');
{
  resetOutbound({ 'challenges.cloudflare.com': turnstileDown });
  const kv = makeKv();
  const env = makeEnv({ BRIEFS: kv, TURNSTILE_SECRET: FAKE_TURNSTILE_SECRET, TURNSTILE_HOSTNAMES: ALLOWED_HOSTS });
  const { status, body } = await call(jsonRequest(goodFields({ 'cf-turnstile-response': 'a-token' })), env);
  check('rejects rather than waving through', status === 400, `status ${status}`);
  check('does not claim success', body?.ok === false);
  check('nothing persisted', kv.keys('brief:').length === 0);
}

group('13b. Turnstile non-ok siteverify response fails CLOSED');
{
  resetOutbound({ 'challenges.cloudflare.com': () => new Response('nope', { status: 500 }) });
  const kv = makeKv();
  const env = makeEnv({ BRIEFS: kv, TURNSTILE_SECRET: FAKE_TURNSTILE_SECRET, TURNSTILE_HOSTNAMES: ALLOWED_HOSTS });
  const { status } = await call(jsonRequest(goodFields({ 'cf-turnstile-response': 'a-token' })), env);
  check('rejects', status === 400, `status ${status}`);
  check('nothing persisted', kv.keys('brief:').length === 0);
}

group('13c. a valid token is accepted and the secret is sent only to Cloudflare');
{
  resetOutbound({ 'challenges.cloudflare.com': turnstileOk, 'api.resend.com': resendOk });
  const kv = makeKv();
  const env = makeEnv({ BRIEFS: kv, TURNSTILE_SECRET: FAKE_TURNSTILE_SECRET, TURNSTILE_HOSTNAMES: ALLOWED_HOSTS, RESEND_API_KEY: FAKE_RESEND_KEY });
  const { status, body } = await call(jsonRequest(goodFields({ 'cf-turnstile-response': 'a-good-token' })), env);
  check('responds 200', status === 200, `status ${status}`);
  check('brief persisted', kv.keys(`brief:${body.id}`).length === 1);

  const verify = outbound.find((c) => c.url.includes('challenges.cloudflare.com'));
  check('siteverify called', Boolean(verify));
  const mail = outbound.find((c) => c.url.includes('api.resend.com'));
  check('Resend called', Boolean(mail));
  check('Turnstile secret not sent to Resend', !JSON.stringify(mail?.init ?? {}).includes(FAKE_TURNSTILE_SECRET));
  check('Resend key not sent to Cloudflare', !JSON.stringify(verify?.init?.headers ?? {}).includes(FAKE_RESEND_KEY));
  check('no secret in the stored brief', !JSON.stringify(kv.read(`brief:${body.id}`)).includes(FAKE_RESEND_KEY));
  check('no secret in the response body', !JSON.stringify(body).includes(FAKE_RESEND_KEY) && !JSON.stringify(body).includes(FAKE_TURNSTILE_SECRET));
}

group('a malformed JSON body is a client error, not a server fault');
{
  /* `JSON.parse("null")` succeeds, so a body of literal null once reached the
     screens and threw on the first property read — a 500 for a bad request. */
  for (const raw of ['null', '"a string"', '[]', '123', 'true']) {
    resetOutbound({});
    const kv = makeKv();
    const env = makeEnv({ BRIEFS: kv });
    const request = new Request(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: ORIGIN },
      body: raw,
    });
    const { status, body } = await call(request, env);
    check(`body ${raw} responds 400`, status === 400, `status ${status}`);
    check(`body ${raw} does not claim success`, body?.ok === false);
    check(`body ${raw} persists nothing`, kv.keys('brief:').length === 0);
  }
}

group('unparseable JSON is a client error too');
{
  resetOutbound({});
  const kv = makeKv();
  const env = makeEnv({ BRIEFS: kv });
  const request = new Request(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: ORIGIN },
    body: '{ not json',
  });
  const { status, body } = await call(request, env);
  check('responds 400', status === 400, `status ${status}`);
  check('does not claim success', body?.ok === false);
}

group('frontend and Worker agree on the stage list');
{
  /* The two lists are separate literals — BriefForm renders the radios, the
     Worker whitelists them — so an edit to one without the other would silently
     reject every submission at that stage. Each rendered value is probed
     against the real validator. */
  const source = await readFile(new URL('../src/components/BriefForm.astro', import.meta.url), 'utf8');
  const block = source.match(/const stages = \[([\s\S]*?)\];/);
  check('stage list found in BriefForm', Boolean(block));
  const frontendStages = [...(block?.[1] ?? '').matchAll(/'([^']+)'/g)].map((m) => m[1]);
  check('BriefForm declares five stages', frontendStages.length === 5, `${frontendStages.length} found`);

  for (const stage of frontendStages) {
    resetOutbound({ 'api.resend.com': resendOk });
    const kv = makeKv();
    const env = makeEnv({ BRIEFS: kv, RESEND_API_KEY: FAKE_RESEND_KEY });
    const { status } = await call(jsonRequest(goodFields({ stage })), env);
    check(`Worker accepts the rendered stage "${stage}"`, status === 200, `status ${status}`);
  }
}

group('13d. Turnstile context: success alone is not enough');
{
  /* A token only proves some widget on the account was solved somewhere. The
     action pins it to this form and the hostname pins it to this site. */
  const cases = [
    ['accepted: success + correct action + allowed hostname', {}, 200],
    ['accepted: the second allowed hostname', { hostname: 'www.aberbach.co' }, 200],
    ['accepted: hostname differing only in case', { hostname: 'Aberbach.CO' }, 200],
    ['rejected: wrong action', { action: 'newsletter_signup' }, 400],
    ['rejected: missing action', { action: undefined }, 400],
    ['rejected: wrong hostname', { hostname: 'aberbach.co.evil.example' }, 400],
    ['rejected: hostname not on the list', { hostname: 'staging.aberbach.co' }, 400],
    ['rejected: missing hostname', { hostname: undefined }, 400],
    ['rejected: localhost', { hostname: 'localhost' }, 400],
    ['rejected: 127.0.0.1', { hostname: '127.0.0.1' }, 400],
  ];

  for (const [label, extraFields, expected] of cases) {
    resetOutbound({ 'challenges.cloudflare.com': () => siteverify(extraFields), 'api.resend.com': resendOk });
    const kv = makeKv();
    const env = makeEnv({ BRIEFS: kv, TURNSTILE_SECRET: FAKE_TURNSTILE_SECRET, TURNSTILE_HOSTNAMES: ALLOWED_HOSTS, RESEND_API_KEY: FAKE_RESEND_KEY });
    const { status } = await call(jsonRequest(goodFields({ 'cf-turnstile-response': 'a-token' })), env);
    check(label, status === expected, `status ${status}`);
    check(`  ${expected === 200 ? 'persisted' : 'persisted nothing'}`, kv.keys('brief:').length === (expected === 200 ? 1 : 0));
  }
}

group('13e. a missing hostname allowlist fails CLOSED');
{
  /* Silently skipping hostname validation is the one failure nobody notices,
     so an unset or empty allowlist rejects instead — and rejects before
     siteverify is called, so the visitor's single-use token is not spent on a
     check that cannot pass. */
  for (const [label, hostnames] of [
    ['unset', undefined],
    ['empty string', ''],
    ['only separators', ' , , '],
    ['only loopback names', 'localhost,127.0.0.1'],
  ]) {
    resetOutbound({ 'challenges.cloudflare.com': turnstileOk });
    const kv = makeKv();
    const env = makeEnv({ BRIEFS: kv, TURNSTILE_SECRET: FAKE_TURNSTILE_SECRET, RESEND_API_KEY: FAKE_RESEND_KEY });
    if (hostnames !== undefined) env.TURNSTILE_HOSTNAMES = hostnames;
    const { status, body } = await call(jsonRequest(goodFields({ 'cf-turnstile-response': 'a-token' })), env);
    check(`allowlist ${label} rejects`, status === 400, `status ${status}`);
    check(`allowlist ${label} does not claim success`, body?.ok === false);
    check(`allowlist ${label} persists nothing`, kv.keys('brief:').length === 0);
    check(`allowlist ${label} does not spend the token`, outbound.length === 0, `${outbound.length} siteverify calls`);
  }
}

group('13f. the allowlist is not consulted before Turnstile is enabled');
{
  /* Pre-activation the var is present but the secret is not, so verification
     is skipped entirely and the form still works. */
  resetOutbound({ 'api.resend.com': resendOk });
  const kv = makeKv();
  const env = makeEnv({ BRIEFS: kv, TURNSTILE_HOSTNAMES: ALLOWED_HOSTS, RESEND_API_KEY: FAKE_RESEND_KEY });
  const { status } = await call(jsonRequest(goodFields()), env);
  check('responds 200 with no secret configured', status === 200, `status ${status}`);
  check('no siteverify call', outbound.filter((c) => c.url.includes('challenges')).length === 0);
}

group('13g. the widget action in BriefForm matches the Worker');
{
  /* data-action and TURNSTILE_ACTION are separate literals in separate files;
     a change to one without the other would reject every submission. */
  const source = await readFile(new URL('../src/components/BriefForm.astro', import.meta.url), 'utf8');
  const found = source.match(/data-action="([^"]+)"/);
  check('BriefForm declares a data-action', Boolean(found), String(found));
  check(`BriefForm action is "${TURNSTILE_ACTION}"`, found?.[1] === TURNSTILE_ACTION, String(found?.[1]));

  /* And the same string is what the Worker actually accepts. */
  resetOutbound({ 'challenges.cloudflare.com': () => siteverify({ action: found?.[1] }), 'api.resend.com': resendOk });
  const kv = makeKv();
  const env = makeEnv({ BRIEFS: kv, TURNSTILE_SECRET: FAKE_TURNSTILE_SECRET, TURNSTILE_HOSTNAMES: ALLOWED_HOSTS, RESEND_API_KEY: FAKE_RESEND_KEY });
  const { status } = await call(jsonRequest(goodFields({ 'cf-turnstile-response': 'a-token' })), env);
  check('the Worker accepts the action BriefForm sends', status === 200, `status ${status}`);
}

group('13h. the hostname allowlist matches wrangler.jsonc');
{
  const config = await readFile(new URL('../wrangler.jsonc', import.meta.url), 'utf8');
  const found = config.match(/"TURNSTILE_HOSTNAMES":\s*"([^"]*)"/);
  check('wrangler.jsonc declares TURNSTILE_HOSTNAMES', Boolean(found), String(found));
  check('it matches what these tests assert against', found?.[1] === ALLOWED_HOSTS, String(found?.[1]));
  check('it contains no loopback name', !/localhost|127\.0\.0\.1/.test(found?.[1] ?? ''), String(found?.[1]));
}

group('www -> apex redirect (secondary net behind the Cloudflare rule)');
{
  resetOutbound({});
  assetsCalls = 0;
  const env = makeEnv({ BRIEFS: makeKv() });

  const redirect = async (url, method = 'GET') => {
    const res = await worker.fetch(new Request(url, { method }), env);
    return { status: res.status, location: res.headers.get('location') };
  };

  const root = await redirect('https://www.aberbach.co/');
  check('www root redirects 301', root.status === 301, `status ${root.status}`);
  check('to the apex root', root.location === 'https://aberbach.co/', String(root.location));

  const deep = await redirect('https://www.aberbach.co/process/');
  check('path is preserved', deep.location === 'https://aberbach.co/process/', String(deep.location));

  const query = await redirect('https://www.aberbach.co/contact/?utm_source=linkedin&utm_medium=profile');
  check(
    'query string is preserved',
    query.location === 'https://aberbach.co/contact/?utm_source=linkedin&utm_medium=profile',
    String(query.location),
  );

  const upper = await redirect('https://WWW.ABERBACH.CO/process/?q=1');
  check(
    'the match is case-insensitive',
    upper.location === 'https://aberbach.co/process/?q=1',
    String(upper.location),
  );

  const apex = await redirect('https://aberbach.co/contact/');
  check('the apex is NOT redirected — no loop', apex.status === 200, `status ${apex.status}`);
  check('the apex is served from ASSETS', assetsCalls > 0);

  /* The match is exact, not a `www.` prefix test. An earlier version rewrote
     any host beginning `www.`, which would have redirected hosts this Worker
     has no business rewriting — including a lookalike domain that merely
     contains the canonical name. */
  for (const host of [
    'https://www.example.com/contact/',
    'https://www.aberbach.co.evil.example/contact/',
    'https://aberbach.co.evil.example/contact/',
    'https://portfolio.workers.dev/contact/',
    'https://staging.aberbach.co/contact/',
  ]) {
    const other = await redirect(host);
    check(`${new URL(host).hostname} is NOT redirected`, other.status !== 301, `status ${other.status}`);
    check(`${new URL(host).hostname} gets no Location`, other.location === null, String(other.location));
  }

  /* A 301 on a POST is downgraded to GET by browsers and the body is dropped,
     so the endpoint must never be redirected — a brief would vanish. */
  const api = await redirect('https://www.aberbach.co/api/brief', 'POST');
  check('POST /api/brief on www is NOT redirected', api.status !== 301, `status ${api.status}`);
  check('and gets no Location header', api.location === null, String(api.location));

  const apiGet = await redirect('https://www.aberbach.co/api/brief', 'GET');
  check('GET /api/brief on www still answers 405, not a redirect', apiGet.status === 405, `status ${apiGet.status}`);

  /* The carve-out covers the whole /api/ prefix, not just the one endpoint, so
     a future endpoint inherits it rather than needing to be remembered. */
  for (const path of ['/api/', '/api/brief', '/api/anything']) {
    const api = await redirect(`https://www.aberbach.co${path}`);
    check(`www${path} is not redirected`, api.status !== 301, `status ${api.status}`);
  }
}

group('the documented Cloudflare rule carries the same /api/ carve-out');
{
  /* The Worker is the fallback; the Cloudflare Redirect Rule is authoritative
     and runs first. If only the Worker excluded /api/, the rule would still
     301 a POST to the endpoint and drop the brief — so the documented
     expression has to exclude it too, and that is asserted here rather than
     left to a reader noticing. */
  const doc = await readFile(new URL('../docs/DOMAIN-MIGRATION.md', import.meta.url), 'utf8');
  const expr = doc.match(/^\s*http\.host eq .*$/m)?.[0]?.trim() ?? '';
  check('a Cloudflare match expression is documented', expr.length > 0, expr);
  check('it pins the exact www host', expr.includes('http.host eq "www.aberbach.co"'), expr);
  check('it excludes the /api/ prefix', /not\s+starts_with\(http\.request\.uri\.path,\s*"\/api\/"\)/.test(expr), expr);
  check('the rule is documented as a 301', /\b301\b/.test(doc));
  check('query-string preservation is documented', /[Pp]reserve query string/.test(doc));
}

group('the Turnstile hostname allowlist is the new domain');
{
  const config = await readFile(new URL('../wrangler.jsonc', import.meta.url), 'utf8');
  const hosts = config.match(/"TURNSTILE_HOSTNAMES":\s*"([^"]*)"/)?.[1] ?? '';
  check('allowlist is aberbach.co,www.aberbach.co', hosts === 'aberbach.co,www.aberbach.co', hosts);
  const oldWebsiteDomain = 'soufianeaberbach.com'; // domain-guard-allow: naming it is the point
  check('allowlist carries no old website domain', !hosts.includes(oldWebsiteDomain), hosts);

  const from = config.match(/"BRIEF_FROM":\s*"([^"]*)"/)?.[1] ?? '';
  check('BRIEF_FROM is on the owned domain', from === 'brief@aberbach.co', from);
  check('BRIEF_FROM is not a gmail sender', !from.endsWith('@gmail.com'), from);

  const to = config.match(/"BRIEF_TO":\s*"([^"]*)"/)?.[1] ?? '';
  check('BRIEF_TO is the public Gmail mailbox', to === 'soufianeaberbach@gmail.com', to);
  check('BRIEF_TO is not the dotted display form', to !== 'soufiane' + '.' + 'aberbach@gmail.com', to);
}

/* ================================================== file upload ========== */

group('U1. accepted types are stored in R2, never in KV');
{
  for (const [name, kind, label] of [
    ['tech-pack.pdf', 'pdf', 'PDF'],
    ['fitting.jpg', 'jpg', 'JPEG image'],
    ['sketch.png', 'png', 'PNG image'],
    ['reference.webp', 'webp', 'WebP image'],
  ]) {
    resetOutbound({ 'api.resend.com': resendOk });
    const kv = makeKv();
    const r2 = makeR2();
    const env = makeEnv({ BRIEFS: kv, BRIEF_FILES: r2, RESEND_API_KEY: FAKE_RESEND_KEY });
    const { status, body } = await call(multipartRequest(goodFields(), makeFile(name, kind)), env);

    check(`${name} accepted`, status === 200, `status ${status}`);
    check(`${name} reports ok`, body?.ok === true);
    check(`${name} echoes the filename back`, body?.file?.name === name, JSON.stringify(body?.file));
    check(`${name} stored exactly once in R2`, r2.keys().length === 1, `${r2.keys().length} objects`);

    const key = r2.keys()[0];
    check(`${name} key is namespaced by reference`, key.startsWith(`briefs/${body.id}/`), key);
    check(`${name} key does not contain the sender filename`, !key.includes(name.split('.')[0]), key);
    check(`${name} key ends with the real extension`, key.endsWith('.' + name.split('.').pop().toLowerCase()), key);
    check(`${name} R2 metadata carries the display name`, r2.puts[0].options.customMetadata.filename === name);

    /* The whole point of R2: KV holds a pointer, never bytes. */
    const record = kv.read(`brief:${body.id}`);
    check(`${name} KV holds only a pointer`, record?.file?.key === key, JSON.stringify(record?.file));
    check(`${name} KV record has no byte payload`, !JSON.stringify(record).includes('ArrayBuffer') && JSON.stringify(record).length < 1200, String(JSON.stringify(record).length));
    check(`${name} label recorded as ${label}`, record?.file?.label === label, String(record?.file?.label));

    const mail = outbound.find((c) => c.url.includes('api.resend.com'));
    const text = JSON.parse(mail.init.body).text;
    check(`${name} email names the file`, text.includes(name), text.slice(0, 80));
    check(`${name} email carries the storage key`, text.includes(key));
  }
}

group('U2. oversized files are rejected');
{
  resetOutbound({});
  const kv = makeKv();
  const r2 = makeR2();
  const env = makeEnv({ BRIEFS: kv, BRIEF_FILES: r2, RESEND_API_KEY: FAKE_RESEND_KEY });
  const big = makeFile('huge.pdf', 'pdf', { bytes: 11 * 1024 * 1024 });
  const { status, body } = await call(multipartRequest(goodFields(), big), env);
  check('rejects over the 10 MB ceiling', status === 400 || status === 413, `status ${status}`);
  check('names the file field so the UI can point at it', body?.field === 'file', String(body?.field));
  check('the message states the limit', /10 MB/.test(String(body?.error)), String(body?.error));
  check('nothing stored in R2', r2.keys().length === 0);
  check('nothing persisted in KV', kv.keys('brief:').length === 0);
  check('no email attempted', outbound.length === 0);
}

group('U3. executables and scripts are rejected');
{
  for (const [name, kind, why] of [
    ['payload.exe', 'exe', 'extension not on the allowlist'],
    ['script.js', 'none', 'extension not on the allowlist'],
    ['run.sh', 'none', 'extension not on the allowlist'],
    ['install.bat', 'none', 'extension not on the allowlist'],
    ['thing.cmd', 'none', 'extension not on the allowlist'],
    ['app.apk', 'zip', 'extension not on the allowlist even though it is a ZIP'],
    ['disk.dmg', 'none', 'extension not on the allowlist'],
    ['archive.zip', 'zip', 'bare archives are deliberately excluded'],
    /* Office formats are out for launch: their magic proves only the ZIP or
       OLE2 container, never that the document inside is the claimed format or
       free of macros. The link field covers them. */
    ['spec.docx', 'zip', 'ZIP container proves nothing about the document'],
    ['costing.xlsx', 'zip', 'ZIP container proves nothing about the document'],
    ['lookbook.pptx', 'zip', 'ZIP container proves nothing about the document'],
    ['legacy.doc', 'ole2', 'OLE2 container can carry macros'],
    ['legacy.xls', 'ole2', 'OLE2 container can carry macros'],
    ['legacy.ppt', 'ole2', 'OLE2 container can carry macros'],
    ['payload.pdf', 'exe', 'extension says PDF, bytes say MZ executable'],
    ['sketch.png', 'exe', 'renamed executable'],
  ]) {
    resetOutbound({});
    const kv = makeKv();
    const r2 = makeR2();
    const env = makeEnv({ BRIEFS: kv, BRIEF_FILES: r2, RESEND_API_KEY: FAKE_RESEND_KEY });
    const { status, body } = await call(multipartRequest(goodFields(), makeFile(name, kind)), env);
    check(`${name} rejected (${why})`, status === 400, `status ${status}`);
    check(`${name} nothing stored`, r2.keys().length === 0 && kv.keys('brief:').length === 0);
    check(`${name} does not claim success`, body?.ok === false);
  }
}

group('U4. a declared type that contradicts the extension is rejected');
{
  resetOutbound({});
  const kv = makeKv();
  const r2 = makeR2();
  const env = makeEnv({ BRIEFS: kv, BRIEF_FILES: r2 });
  const lying = makeFile('sketch.png', 'png', { type: 'application/pdf' });
  const { status } = await call(multipartRequest(goodFields(), lying), env);
  check('rejected', status === 400, `status ${status}`);
  check('nothing stored', r2.keys().length === 0);
}

group('U4b. an empty or absent Content-Type is tolerated when the bytes agree');
{
  resetOutbound({ 'api.resend.com': resendOk });
  const kv = makeKv();
  const r2 = makeR2();
  const env = makeEnv({ BRIEFS: kv, BRIEF_FILES: r2, RESEND_API_KEY: FAKE_RESEND_KEY });
  const vague = makeFile('sketch.png', 'png', { type: 'application/octet-stream' });
  const { status } = await call(multipartRequest(goodFields(), vague), env);
  check('accepted on its bytes', status === 200, `status ${status}`);
  check('stored', r2.keys().length === 1);
}

group('U5. an empty file is rejected');
{
  resetOutbound({});
  const kv = makeKv();
  const r2 = makeR2();
  const env = makeEnv({ BRIEFS: kv, BRIEF_FILES: r2 });
  const empty = new File([new Uint8Array(0)], 'empty.pdf', { type: 'application/pdf' });
  const { status, body } = await call(multipartRequest(goodFields(), empty), env);
  check('rejected', status === 400, `status ${status}`);
  check('named as a file problem', body?.field === 'file', String(body?.field));
  check('nothing stored', r2.keys().length === 0 && kv.keys('brief:').length === 0);
}

group('U6. storage failure refuses the brief rather than half-accepting it');
{
  resetOutbound({ 'api.resend.com': resendOk });
  const kv = makeKv();
  const r2 = makeR2({ failPut: true });
  const env = makeEnv({ BRIEFS: kv, BRIEF_FILES: r2, RESEND_API_KEY: FAKE_RESEND_KEY });
  const { status, body } = await call(multipartRequest(goodFields(), makeFile('spec.pdf', 'pdf')), env);
  check('responds 502', status === 502, `status ${status}`);
  check('does NOT claim success', body?.ok === false);
  check('no reference handed out', body?.id === undefined);
  check('nothing persisted in KV — no brief claiming a missing file', kv.keys('brief:').length === 0);
  check('no email sent', outbound.length === 0);
  check('the message says nothing was lost', /Nothing you typed has been lost/i.test(String(body?.error)), String(body?.error));
}

group('U7. an attachment with no bucket bound is refused, not silently dropped');
{
  resetOutbound({});
  const kv = makeKv();
  const env = makeEnv({ BRIEFS: kv, RESEND_API_KEY: FAKE_RESEND_KEY });
  const { status, body } = await call(multipartRequest(goodFields(), makeFile('spec.pdf', 'pdf')), env);
  check('responds 503', status === 503, `status ${status}`);
  check('names the file field', body?.field === 'file', String(body?.field));
  check('nothing persisted', kv.keys('brief:').length === 0);
  check('no email claiming receipt', outbound.length === 0);
}

group('U8. filename sanitization');
{
  const cases = [
    ['../../etc/passwd.pdf', 'passwd.pdf', 'path traversal stripped'],
    ['..\\windows\\system32\\x.pdf', 'x.pdf', 'windows separators stripped'],
    ['  leading spaces.pdf', 'leading spaces.pdf', 'leading whitespace trimmed'],
    ['a"b<c>d|e.pdf', 'a_b_c_d_e.pdf', 'shell and markup characters neutralised'],
    /* Control characters are removed outright rather than substituted, so the
       newline simply disappears — which is what matters: nothing survives that
       could start a new line in the brief email. */
    ['tech\npack.pdf', 'techpack.pdf', 'newline removed — no email header injection'],
    ['résumé croquis.pdf', 'r_sum_ croquis.pdf', 'non-ASCII replaced, spacing kept'],
  ];
  for (const [raw, expected, why] of cases) {
    resetOutbound({ 'api.resend.com': resendOk });
    const kv = makeKv();
    const r2 = makeR2();
    const env = makeEnv({ BRIEFS: kv, BRIEF_FILES: r2, RESEND_API_KEY: FAKE_RESEND_KEY });
    const file = new File([new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37, 1, 2, 3])], raw, { type: 'application/pdf' });
    const { status, body } = await call(multipartRequest(goodFields(), file), env);
    check(`"${raw.replace(/\n/g, '\\n')}" accepted (${why})`, status === 200, `status ${status}`);
    check(`  stored as "${expected}"`, body?.file?.name === expected, String(body?.file?.name));
    check('  no newline or control character survives', !/[\u0000-\u001f]/.test(String(body?.file?.name)));
    check('  no path separator survives', !/[\\/]/.test(String(body?.file?.name)), String(body?.file?.name));
    const key = r2.keys()[0] ?? '';
    check('  key has no path segment from the name', key.split('/').length === 3, key);
  }
}

group('U6b. R2 succeeds but KV fails — the object is rolled back, not orphaned');
{
  resetOutbound({ 'api.resend.com': resendOk });
  /* The brief write fails; the rate-limit write must still succeed, or the
     request would never reach the persist step being tested. */
  const kv = makeKv({ failPut: (key) => key.startsWith('brief:') });
  const r2 = makeR2();
  const env = makeEnv({ BRIEFS: kv, BRIEF_FILES: r2, RESEND_API_KEY: FAKE_RESEND_KEY });
  const { status, body } = await call(multipartRequest(goodFields(), makeFile('spec.pdf', 'pdf')), env);

  check('the upload did reach R2', r2.puts.length === 1, `${r2.puts.length} puts`);
  check('responds 502', status === 502, `status ${status}`);
  check('does NOT claim success', body?.ok === false);
  check('no reference handed out', body?.id === undefined);
  check('nothing persisted in KV', kv.keys('brief:').length === 0);
  check('no email sent', outbound.length === 0);

  /* The point of the test: no object left behind that nothing references. */
  check('the object was deleted', r2.deletes.length === 1, `${r2.deletes.length} deletes`);
  check('the deleted key is the one just written', r2.deletes[0] === r2.puts[0].key, `${r2.deletes[0]} vs ${r2.puts[0].key}`);
  check('the bucket is empty afterwards', r2.keys().length === 0, JSON.stringify(r2.keys()));
}

group('U6c. a failed rollback still tells the sender the truth');
{
  /* If the cleanup also fails there is nothing more the request can do, and
     the lifecycle rule is the backstop. What must NOT happen is the response
     changing — the brief was not saved either way. */
  resetOutbound({ 'api.resend.com': resendOk });
  const kv = makeKv({ failPut: (key) => key.startsWith('brief:') });
  const r2 = makeR2({ failDelete: true });
  const env = makeEnv({ BRIEFS: kv, BRIEF_FILES: r2, RESEND_API_KEY: FAKE_RESEND_KEY });
  const { status, body } = await call(multipartRequest(goodFields(), makeFile('spec.pdf', 'pdf')), env);
  check('still responds 502', status === 502, `status ${status}`);
  check('still does not claim success', body?.ok === false);
  check('the rollback was attempted', r2.deletes.length === 1);
  check('the response does not claim the rollback worked', !/remov|delet|clean/i.test(String(body?.error)), String(body?.error));
  check('no email sent', outbound.length === 0);
  check('nothing persisted', kv.keys('brief:').length === 0);
}

group('U6d. nothing is deleted when there was no upload to roll back');
{
  resetOutbound({});
  const kv = makeKv({ failPut: (key) => key.startsWith('brief:') });
  const r2 = makeR2();
  const env = makeEnv({ BRIEFS: kv, BRIEF_FILES: r2, RESEND_API_KEY: FAKE_RESEND_KEY });
  const { status } = await call(multipartRequest(goodFields(), null), env);
  check('responds 502', status === 502, `status ${status}`);
  check('no put and no delete', r2.puts.length === 0 && r2.deletes.length === 0);
}

group('U6e. a successful brief never deletes its own upload');
{
  resetOutbound({ 'api.resend.com': resendOk });
  const kv = makeKv();
  const r2 = makeR2();
  const env = makeEnv({ BRIEFS: kv, BRIEF_FILES: r2, RESEND_API_KEY: FAKE_RESEND_KEY });
  const { status, body } = await call(multipartRequest(goodFields(), makeFile('spec.pdf', 'pdf')), env);
  check('responds 200', status === 200, `status ${status}`);
  check('no delete attempted', r2.deletes.length === 0, JSON.stringify(r2.deletes));
  check('the object is still there', r2.keys().length === 1);
  check('and the brief points at it', kv.read(`brief:${body.id}`)?.file?.key === r2.keys()[0]);
}

group('U3b. the launch allowlist is exactly the four verifiable formats');
{
  /* Read from the Worker source so the policy cannot drift from the UI without
     a test noticing. */
  const source = await readFile(new URL('../worker/index.ts', import.meta.url), 'utf8');
  const block = source.match(/const ACCEPTED_FILES: FileKind\[\] = \[([\s\S]*?)\];/)?.[1] ?? '';
  const exts = [...block.matchAll(/ext: '([a-z0-9]+)'/g)].map((m) => m[1]);
  check('exactly five entries (jpg and jpeg both map to JPEG)', exts.length === 5, JSON.stringify(exts));
  check('the set is pdf/jpg/jpeg/png/webp', JSON.stringify([...new Set(exts)].sort()) === JSON.stringify(['jpeg', 'jpg', 'pdf', 'png', 'webp']), JSON.stringify(exts));
  for (const gone of ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip']) {
    check(`${gone} is not accepted`, !exts.includes(gone));
  }

  /* And the form's accept attribute agrees with it. */
  const form = await readFile(new URL('../src/components/BriefForm.astro', import.meta.url), 'utf8');
  const accept = form.match(/accept="([^"]+)"/)?.[1] ?? '';
  check('the accept attribute lists the same four formats', ['.pdf', '.jpg', '.jpeg', '.png', '.webp'].every((e) => accept.includes(e)), accept);
  check('the accept attribute offers no Office format', !/docx?|xlsx?|pptx?/.test(accept), accept);
  check('the client-side list agrees', /ALLOWED_EXT = \['pdf', 'jpg', 'jpeg', 'png', 'webp'\]/.test(form));
}

group('U9. duplicate filenames do not collide');
{
  const keys = [];
  for (let i = 0; i < 3; i += 1) {
    resetOutbound({ 'api.resend.com': resendOk });
    const kv = makeKv();
    const r2 = makeR2();
    const env = makeEnv({ BRIEFS: kv, BRIEF_FILES: r2, RESEND_API_KEY: FAKE_RESEND_KEY });
    const { body } = await call(multipartRequest(goodFields(), makeFile('sketch.pdf', 'pdf')), env);
    keys.push(r2.keys()[0]);
    check(`submission ${i + 1} kept the display name`, body?.file?.name === 'sketch.pdf');
  }
  check('three identical filenames produced three distinct keys', new Set(keys).size === 3, JSON.stringify(keys));
}

group('U10. submitting without a file still works, both ways');
{
  /* multipart with no file part */
  resetOutbound({ 'api.resend.com': resendOk });
  let kv = makeKv();
  let r2 = makeR2();
  let env = makeEnv({ BRIEFS: kv, BRIEF_FILES: r2, RESEND_API_KEY: FAKE_RESEND_KEY });
  let res = await call(multipartRequest(goodFields(), null), env);
  check('multipart without a file responds 200', res.status === 200, `status ${res.status}`);
  check('no R2 object written', r2.keys().length === 0);
  check('KV records file: null', kv.read(`brief:${res.body.id}`)?.file === null);
  check('the response reports no file', res.body?.file === null);
  let mail = outbound.find((c) => c.url.includes('api.resend.com'));
  check('email shows File: —', JSON.parse(mail.init.body).text.includes('File:     —'));

  /* the original JSON path, untouched */
  resetOutbound({ 'api.resend.com': resendOk });
  kv = makeKv();
  env = makeEnv({ BRIEFS: kv, RESEND_API_KEY: FAKE_RESEND_KEY });
  res = await call(jsonRequest(goodFields()), env);
  check('JSON submission still responds 200', res.status === 200, `status ${res.status}`);
  check('JSON submission needs no bucket', kv.keys('brief:').length === 1);
}

group('U11. the optional reference link still works alongside uploads');
{
  resetOutbound({ 'api.resend.com': resendOk });
  const kv = makeKv();
  const r2 = makeR2();
  const env = makeEnv({ BRIEFS: kv, BRIEF_FILES: r2, RESEND_API_KEY: FAKE_RESEND_KEY });
  const fields = goodFields({ link: 'https://drive.example.com/folder/abc' });
  const { status, body } = await call(multipartRequest(fields, makeFile('spec.pdf', 'pdf')), env);
  check('link and file together are accepted', status === 200, `status ${status}`);
  const record = kv.read(`brief:${body.id}`);
  check('the link is recorded', record?.link === fields.link);
  check('the file is recorded', record?.file?.name === 'spec.pdf');
  const text = JSON.parse(outbound.find((c) => c.url.includes('api.resend.com')).init.body).text;
  check('the email shows both', text.includes(fields.link) && text.includes('spec.pdf'));

  /* link-only, no file — the pre-upload behaviour */
  resetOutbound({ 'api.resend.com': resendOk });
  const kv2 = makeKv();
  const env2 = makeEnv({ BRIEFS: kv2, RESEND_API_KEY: FAKE_RESEND_KEY });
  const linkOnly = await call(jsonRequest(goodFields({ link: 'https://example.com/ref' })), env2);
  check('link-only submission still works', linkOnly.status === 200, `status ${linkOnly.status}`);
}

group('U12. field validation still runs on a multipart submission');
{
  resetOutbound({});
  const kv = makeKv();
  const r2 = makeR2();
  const env = makeEnv({ BRIEFS: kv, BRIEF_FILES: r2 });
  const { status, body } = await call(multipartRequest(goodFields({ email: 'nope' }), makeFile('spec.pdf', 'pdf')), env);
  check('invalid email still rejected', status === 400, `status ${status}`);
  check('still names the email field', body?.field === 'email', String(body?.field));
  check('the file was NOT stored for an invalid brief', r2.keys().length === 0);
}

group('U13. Turnstile still governs a multipart submission');
{
  /* Nothing about attachments may become a way around the spam check. */
  resetOutbound({});
  const kv = makeKv();
  const r2 = makeR2();
  const env = makeEnv({ BRIEFS: kv, BRIEF_FILES: r2, TURNSTILE_SECRET: FAKE_TURNSTILE_SECRET, TURNSTILE_HOSTNAMES: ALLOWED_HOSTS });
  const noToken = await call(multipartRequest(goodFields(), makeFile('spec.pdf', 'pdf')), env);
  check('multipart with no token is rejected', noToken.status === 400, `status ${noToken.status}`);
  check('no file stored for an unverified submission', r2.keys().length === 0);
  check('siteverify not called without a token', outbound.length === 0);

  resetOutbound({ 'challenges.cloudflare.com': turnstileOk, 'api.resend.com': resendOk });
  const kv2 = makeKv();
  const r22 = makeR2();
  const env2 = makeEnv({ BRIEFS: kv2, BRIEF_FILES: r22, TURNSTILE_SECRET: FAKE_TURNSTILE_SECRET, TURNSTILE_HOSTNAMES: ALLOWED_HOSTS, RESEND_API_KEY: FAKE_RESEND_KEY });
  const withToken = await call(multipartRequest(goodFields({ 'cf-turnstile-response': 'a-good-token' }), makeFile('spec.pdf', 'pdf')), env2);
  check('a verified multipart submission is accepted', withToken.status === 200, `status ${withToken.status}`);
  check('and the file is stored', r22.keys().length === 1);

  resetOutbound({ 'challenges.cloudflare.com': turnstileBad });
  const kv3 = makeKv();
  const r23 = makeR2();
  const env3 = makeEnv({ BRIEFS: kv3, BRIEF_FILES: r23, TURNSTILE_SECRET: FAKE_TURNSTILE_SECRET, TURNSTILE_HOSTNAMES: ALLOWED_HOSTS });
  const bad = await call(multipartRequest(goodFields({ 'cf-turnstile-response': 'bogus' }), makeFile('spec.pdf', 'pdf')), env3);
  check('an invalid token still rejects a multipart submission', bad.status === 400, `status ${bad.status}`);
  check('nothing stored', r23.keys().length === 0);
}

group('U14. the spam screens still run on a multipart submission');
{
  resetOutbound({});
  const kv = makeKv();
  const r2 = makeR2();
  const env = makeEnv({ BRIEFS: kv, BRIEF_FILES: r2 });
  const honeypot = await call(multipartRequest(goodFields({ website: 'https://spam.example' }), makeFile('spec.pdf', 'pdf')), env);
  check('honeypot still rejects', honeypot.status === 400, `status ${honeypot.status}`);
  check('no file stored', r2.keys().length === 0);

  resetOutbound({});
  const r22 = makeR2();
  const env2 = makeEnv({ BRIEFS: makeKv(), BRIEF_FILES: r22 });
  const fast = await call(multipartRequest(goodFields({ t: String(Date.now()) }), makeFile('spec.pdf', 'pdf')), env2);
  check('timing screen still rejects', fast.status === 400, `status ${fast.status}`);
  check('no file stored', r22.keys().length === 0);
}

group('U15. an extra file part cannot smuggle a second upload');
{
  resetOutbound({ 'api.resend.com': resendOk });
  const kv = makeKv();
  const r2 = makeR2();
  const env = makeEnv({ BRIEFS: kv, BRIEF_FILES: r2, RESEND_API_KEY: FAKE_RESEND_KEY });
  const body = new FormData();
  Object.entries(goodFields()).forEach(([k, v]) => body.append(k, String(v)));
  body.append('file', makeFile('legit.pdf', 'pdf'), 'legit.pdf');
  body.append('extra', makeFile('payload.exe', 'exe'), 'payload.exe');
  const request = new Request(ENDPOINT, {
    method: 'POST',
    headers: { accept: 'application/json', origin: ORIGIN, 'CF-Connecting-IP': '203.0.113.9' },
    body,
  });
  const { status } = await call(request, env);
  check('accepted, on the one known field only', status === 200, `status ${status}`);
  check('exactly one object stored', r2.keys().length === 1, `${r2.keys().length}`);
  check('the stored object is the legitimate one', r2.keys()[0].endsWith('.pdf'), r2.keys()[0]);
}

group('U16. no upload route is exposed for reading files back');
{
  /* The bucket is private and the Worker must not become a way to read it.
     Anything other than POST /api/brief has to fall through to the static
     site or answer 405 — never serve an object. */
  resetOutbound({});
  assetsCalls = 0;
  const r2 = makeR2();
  const env = makeEnv({ BRIEFS: makeKv(), BRIEF_FILES: r2 });
  for (const path of ['/api/files/x', '/api/brief/file', '/briefs/abc/def.pdf', '/api/upload']) {
    const res = await worker.fetch(new Request(`${ORIGIN}${path}`, { method: 'GET' }), env);
    check(`GET ${path} does not serve a stored object`, res.status === 200 || res.status === 405, `status ${res.status}`);
    const text = await res.text();
    check(`GET ${path} returns no file bytes`, text === 'static asset' || text.includes('"ok":false'), text.slice(0, 40));
  }
}

/* ------------------------------------------------------ 14-15. method + faults */

group('14. GET /api/brief');
{
  resetOutbound({});
  const env = makeEnv({ BRIEFS: makeKv() });
  assetsCalls = 0;
  const { status, body, res } = await call(new Request(ENDPOINT, { method: 'GET' }), env);
  check('responds 405', status === 405, `status ${status}`);
  check('answers JSON, not the 404 page', body?.ok === false, String(body));
  check('405 is no-store', noStore(res));
  check('ASSETS was not consulted', assetsCalls === 0, `${assetsCalls} calls`);
}

group('15. unexpected API exception');
{
  resetOutbound({});
  const kv = makeKv();
  const env = makeEnv({ BRIEFS: kv, RESEND_API_KEY: FAKE_RESEND_KEY });
  assetsCalls = 0;

  /* Force a fault after validation and after the rate-limit check, in the one
     place the handler does not itself guard: reference-id generation. */
  const realCrypto = globalThis.crypto;
  Object.defineProperty(globalThis, 'crypto', {
    value: { subtle: realCrypto.subtle, getRandomValues: realCrypto.getRandomValues.bind(realCrypto), randomUUID() { throw new Error('synthetic fault'); } },
    configurable: true,
    writable: true,
  });
  let jsonCase, htmlCase;
  try {
    jsonCase = await call(jsonRequest(goodFields()), env);
    htmlCase = await call(formRequest(goodFields()), env);
  } finally {
    Object.defineProperty(globalThis, 'crypto', { value: realCrypto, configurable: true, writable: true });
  }

  check('JSON caller gets 500', jsonCase.status === 500, `status ${jsonCase.status}`);
  check('500 body is JSON and not ok', jsonCase.body?.ok === false);
  check('500 is no-store', noStore(jsonCase.res));
  check('500 says nothing was saved', /nothing was saved/i.test(String(jsonCase.body?.error)), String(jsonCase.body?.error));
  check('native caller gets an HTML 500', htmlCase.status === 500 && htmlCase.text.startsWith('<!doctype html'), `status ${htmlCase.status}`);
  check('HTML 500 is no-store', noStore(htmlCase.res));
  check('exception NEVER becomes a static asset response', assetsCalls === 0, `${assetsCalls} calls`);
  check('nothing persisted by a faulted request', kv.keys('brief:').length === 0);
  check('crypto restored for later assertions', typeof globalThis.crypto.randomUUID === 'function');
}

group('non-API routes still reach the static site');
{
  resetOutbound({});
  assetsCalls = 0;
  const env = makeEnv({ BRIEFS: makeKv() });
  const { status, text } = await call(new Request(`${ORIGIN}/contact/`, { method: 'GET' }), env);
  check('served by ASSETS', assetsCalls === 1 && status === 200, `${assetsCalls} calls, status ${status}`);
  check('asset body returned', text === 'static asset');
}

/* ------------------------------------------------------------------- report */

globalThis.fetch = realFetch;
console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) {
  failures.forEach((f) => console.log(`  - ${f}`));
  process.exit(1);
}
