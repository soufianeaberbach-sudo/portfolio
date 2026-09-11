# Contact form configuration

The Contact page posts to the Cloudflare Worker at `/api/brief`. Before production use:

1. Create a Workers KV namespace and bind it as `BRIEFS`. Add its namespace ID to the `BRIEFS` entry in `wrangler.jsonc` when deploying with Wrangler, or configure the binding in the Cloudflare dashboard.
2. Verify a sending domain with the transactional email provider, including SPF and DKIM.
3. Add `RESEND_API_KEY`, `BRIEF_TO`, and `BRIEF_FROM` as Worker secrets or variables. `BRIEF_FROM` must use the verified sending domain; visitor addresses are used only as `reply_to`.
4. To enable Turnstile, configure `TURNSTILE_SECRET` for the Worker and `PUBLIC_TURNSTILE_SITE_KEY` in the Astro build environment. Configure both together.
5. Submit one real brief in production and confirm that its KV record exists and its email arrives before describing the form as production-ready.

`.dev.vars.example` contains placeholders only. Do not commit `.dev.vars` or real credentials.
