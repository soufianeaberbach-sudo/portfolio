import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyProduction } from '../scripts/verify-production.mjs';
import { indexableRoutes } from '../src/data/site-routes.mjs';

const ORIGIN = 'https://aberbach.co';
function fixtures(override = () => undefined) {
  const requests = [];
  const fetchImpl = async (input, options) => {
    assert.equal(options.method, 'GET', 'Diagnostics must never submit anything');
    assert.equal(options.redirect, 'manual');
    assert.equal(options.body, undefined);
    assert.equal(options.headers.authorization, undefined);
    requests.push({ url: String(input), ...options });
    const url = new URL(input);
    const custom = override(url, options);
    if (custom) return custom;
    if (url.protocol === 'http:' || url.hostname === 'www.aberbach.co') {
      return new Response(null, { status: 301, headers: { location: `${ORIGIN}${url.pathname}${url.search}` } });
    }
    if (url.pathname === '/robots.txt') return new Response(`User-agent: *\nAllow: /\nSitemap: ${ORIGIN}/sitemap.xml\n`, { headers: { 'content-type': 'text/plain' } });
    if (url.pathname === '/sitemap.xml') return new Response(`<urlset>${indexableRoutes.map(({ path }) => `<url><loc>${ORIGIN}${path}</loc></url>`).join('')}</urlset>`, { headers: { 'content-type': 'application/xml' } });
    if (url.pathname === '/api/brief') return Response.json({ ok: false, error: 'Use POST.' }, { status: 405, headers: { 'cache-control': 'no-store' } });
    return new Response(`<html><head><link rel="canonical" href="${ORIGIN}${url.pathname}"></head><body>Public page</body></html>`, { headers: { 'content-type': 'text/html' } });
  };
  return { requests, fetchImpl, lookupImpl: async (host) => {
    assert.equal(host, 'www.aberbach.co');
    return [{ address: '192.0.2.1', family: 4 }];
  }, log: () => {} };
}

test('diagnostics use only GET/DNS, cover all public routes and preserve queries', async () => {
  const f = fixtures();
  const results = await verifyProduction({ ...f, agents: true });
  assert.ok(results.every((result) => result.ok), JSON.stringify(results.filter((result) => !result.ok)));
  for (const { path } of indexableRoutes) assert.ok(f.requests.some((request) => request.url === `${ORIGIN}${path}`));
  assert.ok(f.requests.some((request) => request.url.includes('?verify=production&source=read-only')));
  assert.ok(f.requests.some((request) => request.headers['user-agent'] === 'Python-urllib/3.12'));
  assert.ok(f.requests.every((request) => new URL(request.url).pathname !== '/admin'));
});

test('pending HTTP behavior is reported as a failure', async () => {
  const results = await verifyProduction(fixtures((url) => url.protocol === 'http:' ? new Response('HTML', { status: 200 }) : undefined));
  assert.equal(results.find((result) => result.name === 'HTTP apex → HTTPS').ok, false);
});

test('DNS failure is visible without aborting remaining checks', async () => {
  const results = await verifyProduction({ ...fixtures(), lookupImpl: async () => { throw new Error('ENOTFOUND'); } });
  assert.match(results.find((result) => result.name === 'www DNS').detail, /ENOTFOUND/);
  assert.equal(results.find((result) => result.name === 'GET /api/brief').ok, true);
});

test('lost paths/queries and redirect loops fail clearly', async () => {
  for (const mode of ['lost-query', 'loop']) {
    const results = await verifyProduction(fixtures((url) => url.protocol === 'http:' ?
      new Response(null, { status: 301, headers: { location: mode === 'loop' ? url.href : `${ORIGIN}/` } }) : undefined));
    const result = results.find((result) => result.name === 'HTTP apex → HTTPS');
    assert.equal(result.ok, false);
    // An HTTP self-loop also correctly violates the HTTPS-target requirement.
    assert.match(result.detail, /query|loop|HTTPS/);
  }
  const results = await verifyProduction(fixtures((url) => url.hostname === 'www.aberbach.co' && url.protocol === 'https:' ?
    new Response(null, { status: 301, headers: { location: url.href } }) : undefined));
  assert.match(results.find((result) => result.name === 'HTTPS www → apex').detail, /Redirect loop/);
});

test('challenge HTML, accidental noindex, API routing and incomplete sitemap fail', async () => {
  const cases = [
    ['/contact/', () => new Response('<html>Just a moment cf-chl-test</html>', { headers: { 'content-type': 'text/html' } }), 'HTTPS /contact/'],
    ['/privacy/', () => new Response(`<html><meta name="robots" content="noindex"><link rel="canonical" href="${ORIGIN}/privacy/"></html>`, { headers: { 'content-type': 'text/html' } }), 'HTTPS /privacy/'],
    ['/api/brief', () => new Response('Not found', { status: 404 }), 'GET /api/brief'],
    ['/sitemap.xml', () => new Response('<urlset/>', { headers: { 'content-type': 'application/xml' } }), 'sitemap.xml'],
  ];
  for (const [path, response, name] of cases) {
    const results = await verifyProduction(fixtures((url) => url.pathname === path ? response() : undefined));
    assert.equal(results.find((result) => result.name === name).ok, false, name);
  }
});

test('Cloudflare 1010 is reported for representative automated agents', async () => {
  const results = await verifyProduction({ ...fixtures((url, options) => options.headers['user-agent'].startsWith('Python-urllib') ?
    new Response('error code: 1010', { status: 403 }) : undefined), agents: true });
  const result = results.find((result) => result.name === 'GET user-agent Python-urllib/3.12');
  assert.equal(result.ok, false);
  assert.match(result.detail, /403.*1010/);
});
