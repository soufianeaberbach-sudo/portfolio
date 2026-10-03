# Discovery activation — home/dashboard runbook

**Pending external work.** Nothing below was activated by the trust-foundation
branch. See [PRODUCTION-STATE.md](PRODUCTION-STATE.md) for 3 Oct 2026 evidence.

## Prerequisites

Confirm HTTPS apex, HTTP-to-HTTPS and www-to-apex redirects, preserving deep paths
and queries. Review Cloudflare 1010/Browser Integrity Check using security-event
evidence; do not infer crawler access from robots alone. No code workaround is
implemented for 1010.

Run `npm run verify:production` and optionally
`npm run verify:production -- --agents` after dashboard fixes. This makes only
public GET requests and DNS lookups, submits nothing and uses no secrets. It
returns a nonzero exit code on failures. It is not a required CI check.

## Google Search Console — requires Soufiane's login

1. Create or inspect the **Domain property** for `aberbach.co`.
2. Verify using the exact DNS TXT record provided by Google. Do not invent it.
3. Submit `https://aberbach.co/sitemap.xml`.
4. Inspect the homepage and important service/contact/trust URLs. Confirm the
   Google-selected canonical, live fetch and indexing status; request indexing
   where appropriate. A sitemap submission is not a guarantee of indexing.

Domain verification is not implemented by a meta tag here. No current apex TXT
record was observed in the audit, but historic verification remains unknown.

## Bing Webmaster Tools — requires Soufiane's login

Inspect/import the verified Search Console property or verify independently
using Bing's supplied instructions. Submit the same sitemap and inspect fetch
and index status. IndexNow remains deliberately deferred for this stable site.

## AI fetching and policy

After Cloudflare fixes, verify OAI-SearchBot, ChatGPT-User, Claude-SearchBot and
Claude-User retrieval, and inspect actual security events where failures remain.
A user-agent test is not a simulation of published crawler IPs or verified-bot
classification. Avoid a broad bypass of security based only on spoofable names.

The current `User-agent: *` / `Allow: /` policy remains unchanged. Search and
training are independent policy decisions; no training crawler is blocked in
this branch. Before a later policy change, re-check the current official sources:

- [OpenAI crawler roles](https://platform.openai.com/docs/bots): OAI-SearchBot
  for search, GPTBot for potential training, ChatGPT-User for user retrieval.
- [Anthropic crawler roles](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler):
  Claude-SearchBot, Claude-User and ClaudeBot have different uses.
- [Google crawlers](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers#google-extended):
  Google-Extended is a product-control token, not a separate HTTP user agent;
  its specified Gemini training/grounding uses do not control Google Search
  inclusion. Grounding implications need a deliberate business choice.

No `llms.txt` is added. It is unnecessary for the current small route set;
robots, sitemap, readable HTML and crawlable links remain the foundation.

## Portfolio limitation — separate later architecture task

Project/category states such as `#womenswear/rtw/rtw-ref-01` are URL fragments.
They are not sent to the server and are **not independent crawlable project
URLs**. Some evidence exists in the page HTML, but a fragment has no independent
canonical, title, description or sitemap entry. Real project/category URLs are
a separate later SEO architecture task. Portfolio/Womenswear design is untouched
by this branch.

`src/data/site-routes.mjs` is the small indexable-route manifest shared by the
sitemap, domain guard and public diagnostics. Flow endpoints and fragments do
not belong there. New trust pages are indexable, with normal SiteLayout metadata.
