# Security preparation — not active

This branch installs no security response headers, HSTS or CSP. DNS, HTTPS
redirects, minimum TLS, Browser Integrity Check, WAF/bot settings and Cloudflare
header rules remain external tasks for Soufiane at home.

Useful later headers are nosniff, a sensible referrer policy and frame protection.
Do not add policies merely to improve a scanner score. HSTS must wait for working
HTTPS/redirects on the required hosts; do not preload or include subdomains
without verifying their scope.

## Candidate CSP report-only inventory

This is a starting point for **Content-Security-Policy-Report-Only**, not an
approved/enforced policy. Reconcile it with the deployed network requests and
Cloudflare settings first. It intentionally allows current inline scripts/styles;
a future stricter policy needs hashes/nonces rather than blindly removing them.

```text
default-src 'self'; base-uri 'self'; object-src 'none'; form-action 'self'; frame-ancestors 'none'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://i.ytimg.com; media-src 'self' blob:; connect-src 'self' https://challenges.cloudflare.com https://cloudflareinsights.com; frame-src https://challenges.cloudflare.com https://www.youtube-nocookie.com
```

No report collector or `report-to` endpoint is provisioned. Console diagnostics
can help initial testing; a collector would need separate approval and privacy
review. Test inline Astro scripts, menus/forms, Google Fonts, a real Turnstile
widget, click-to-load video and any hosting-injected beacon before enforcement.
Cloudflare documents the automatically injected beacon using a same-origin
`/cdn-cgi/rum/` endpoint; manual embedding can use cloudflareinsights.com.

Keep the policy report-only during assessment. Response headers added only inside
the Worker do not cover matching static assets with the current asset-first
routing, so do not describe them as a site-wide solution.
