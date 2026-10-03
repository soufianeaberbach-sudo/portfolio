/** Opt-in public diagnostics. GET and DNS only; no credentials or form posts.
 * Not a CI prerequisite: dashboard activation is deliberately pending. */
import { lookup } from 'node:dns/promises';
import { pathToFileURL } from 'node:url';
import { indexableRoutes } from '../src/data/site-routes.mjs';

const ORIGIN = 'https://aberbach.co';
const PERMANENT = new Set([301, 308]);
const REDIRECTS = new Set([301, 302, 303, 307, 308]);
const challenge = (text) => /cf-chl-|challenge-platform|just a moment|error code:\s*1010/i.test(text);

export async function verifyProduction({ fetchImpl = fetch, lookupImpl = lookup, agents = false, log = console.log } = {}) {
  const results = [];
  const check = async (name, action) => {
    try {
      const detail = await action();
      results.push({ name, ok: true, detail });
      log(`PASS ${name}: ${detail}`);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      results.push({ name, ok: false, detail });
      log(`FAIL ${name}: ${detail}`);
    }
  };
  const require = (ok, message) => { if (!ok) throw new Error(message); };
  const get = async (url, agent = 'Aberbach-Production-Check/1.0') => fetchImpl(url, {
    method: 'GET',
    redirect: 'manual',
    signal: AbortSignal.timeout(15_000),
    headers: { 'user-agent': agent },
  });
  const page = async (path, agent) => {
    const response = await get(`${ORIGIN}${path}`, agent);
    const text = await response.text();
    require(response.status === 200, `HTTP ${response.status}${challenge(text) ? ' / Cloudflare challenge or 1010' : ''}`);
    require(/text\/html/i.test(response.headers.get('content-type') ?? ''), 'Expected HTML');
    require(!challenge(text), 'Challenge returned instead of public HTML');
    require(/<html\b/i.test(text), 'No HTML document returned');
    require(!/<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(text) &&
      !/noindex/i.test(response.headers.get('x-robots-tag') ?? ''), 'Unexpected noindex');
    const canonical = text.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)/i)?.[1];
    require(canonical === `${ORIGIN}${path}`, `Canonical differs: ${canonical ?? 'missing'}`);
    return '200, indexable HTML, canonical matches';
  };
  const redirect = async (source, target) => {
    let current = source;
    const seen = new Set();
    let hops = 0;
    for (let i = 0; i < 6; i++) {
      require(!seen.has(current), 'Redirect loop');
      seen.add(current);
      const response = await get(current);
      if (!REDIRECTS.has(response.status)) {
        require(hops > 0, `No redirect: HTTP ${response.status}`);
        require(current === target, `Path, query or canonical target differs: ${current}`);
        require(response.status === 200, `Final HTTP ${response.status}`);
        require(!challenge(await response.text()), 'Final response is a challenge');
        return `${hops} permanent redirect(s), path/query preserved`;
      }
      require(PERMANENT.has(response.status), `Expected permanent redirect, got ${response.status}`);
      const location = response.headers.get('location');
      require(location, 'Redirect has no Location');
      const next = new URL(location, current);
      require(['aberbach.co', 'www.aberbach.co'].includes(next.hostname), 'Redirect leaves expected hosts');
      require(next.protocol === 'https:', 'Redirect target must use HTTPS');
      current = next.href;
      hops++;
    }
    throw new Error('Too many redirects');
  };

  for (const { path } of indexableRoutes) await check(`HTTPS ${path}`, () => page(path));
  await check('www DNS', async () => {
    const addresses = await lookupImpl('www.aberbach.co', { all: true });
    require(addresses.length > 0, 'No public address resolved');
    return addresses.map(({ address }) => address).join(', ');
  });
  const pathQuery = '/portfolio/?verify=production&source=read-only';
  const target = `${ORIGIN}${pathQuery}`;
  await check('HTTP apex → HTTPS', () => redirect(`http://aberbach.co${pathQuery}`, target));
  await check('HTTPS www → apex', () => redirect(`https://www.aberbach.co${pathQuery}`, target));
  await check('HTTP www → HTTPS apex', () => redirect(`http://www.aberbach.co${pathQuery}`, target));
  await check('robots.txt', async () => {
    const response = await get(`${ORIGIN}/robots.txt`);
    const text = await response.text();
    require(response.status === 200 && /text\/plain/i.test(response.headers.get('content-type') ?? ''), `Expected 200 text/plain, got ${response.status}`);
    require(/^User-agent:\s*\*\s*$/im.test(text) && /^Allow:\s*\/\s*$/im.test(text), 'Broad discovery permission missing');
    require(!/^Disallow:\s*\/\s*$/im.test(text), 'Site-wide disallow requires review');
    require(text.includes(`Sitemap: ${ORIGIN}/sitemap.xml`), 'Canonical sitemap declaration missing');
    return 'Readable, wildcard allows discovery, sitemap declared';
  });
  await check('sitemap.xml', async () => {
    const response = await get(`${ORIGIN}/sitemap.xml`);
    const text = await response.text();
    require(response.status === 200 && /(?:application|text)\/xml/i.test(response.headers.get('content-type') ?? ''), `Expected 200 XML, got ${response.status}`);
    const urls = [...text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const expected = indexableRoutes.map(({ path }) => `${ORIGIN}${path}`);
    require(urls.length === expected.length && new Set(urls).size === urls.length && expected.every((url) => urls.includes(url)), 'Sitemap does not match indexable-route manifest');
    return `${urls.length} canonical URLs`;
  });
  await check('GET /api/brief', async () => {
    const response = await get(`${ORIGIN}/api/brief`);
    require(response.status === 405, `Expected 405, got ${response.status}`);
    const body = await response.json();
    require(body.ok === false && body.error === 'Use POST.', 'Unexpected API response');
    require(/no-store/i.test(response.headers.get('cache-control') ?? ''), 'API response must not be cached');
    return '405 JSON, no-store; no submission made';
  });
  if (agents) {
    for (const agent of ['Googlebot', 'bingbot', 'OAI-SearchBot', 'ChatGPT-User', 'GPTBot', 'Claude-SearchBot', 'Claude-User', 'ClaudeBot', 'Python-urllib/3.12']) {
      await check(`GET user-agent ${agent}`, () => page('/', agent));
    }
    log('User-agent probes do not simulate crawler IPs or browser/TLS fingerprints.');
  }
  log(`${results.filter((result) => result.ok).length} passed, ${results.filter((result) => !result.ok).length} failed. Public checks do not prove bindings, secrets, inbox delivery or account verification.`);
  return results;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== '--agents')) {
    console.error('Usage: npm run verify:production -- [--agents]');
    process.exitCode = 1;
  } else {
    const results = await verifyProduction({ agents: args.includes('--agents') });
    process.exitCode = results.some((result) => !result.ok) ? 1 : 0;
  }
}
