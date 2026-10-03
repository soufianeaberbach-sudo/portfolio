# Existing browser workflow

Run commands from the repository root. Reuse the existing stack; do not add a
second browser package, runner or MCP configuration for routine visual work.

## Browser and preview

- `.mcp.json` launches `npx -y @playwright/mcp@latest`, with
  `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers` and
  `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`. Use it when the session exposes its tools;
  a repository configuration alone does not make tools available in Codex.
- The npm dependency is `playwright` 1.56.1. If MCP is unavailable, use this
  dependency in a small task-scoped script, keeping review output in `/tmp` or
  ignored `.qa-director/`. No new stack is needed.
- Install dependencies with `npm ci` when absent. The configured browser path is
  environment-specific: verify Chromium is available there before reusing it.
  If missing, install Chromium for the existing dependency with
  `PLAYWRIGHT_BROWSERS_PATH=/tmp/aberbach-pw-browsers npx playwright install chromium`,
  and use that same browser path for subsequent review commands. Do not silently
  download a mismatched browser or change repository config to suit one machine.
- During work: `npm run dev -- --host 127.0.0.1` (default port 4321).
- Built review: `npm run build`, then
  `npm run preview -- --host 127.0.0.1 --port 4339`.
  Visit `http://127.0.0.1:4339/portfolio/` for Portfolio work; use the relevant
  route for other tasks. Use the actual port printed if a port is occupied.

## Screenshots and fonts

Primary sizes: **1440×900, 768×1024, 390×844**.
Sanity/regression sizes: **1024×768, 430×932**.
Set both viewport dimensions explicitly; enable touch/mobile context for phone
interaction checks. Browser emulation does not prove real-device Safari,
keyboard, safe-area or browser-chrome behavior; state relevant unverified limits.

Use the browser as needed while working. After the coherent pass and refinement,
capture one disciplined final set, covering the whole relevant chapter and
important interaction states. For meaningful motion, inspect start, midpoint and
payoff. Let assets and reveals settle. Fixed overlays with their own scroll
containers need captures through that container; `fullPage` alone can capture
the landing behind the chapter. Inspect the images, not just their existence.

For local Node Playwright review, reuse `installFonts(context)` from
`tests/fixtures/fonts.mjs` before opening the page, then `fontsReady(page)` after
navigation. It supplies the committed Latin subsets of Archivo (variable width),
Inter and JetBrains Mono. In MCP, verify intended font loading; where fonts fall
back, use the existing fixture workflow for precise type comparison.

Legacy helper: `npm run build`, then `node .devtools/qa-shots.mjs /tmp/pf-qa`
(`QA_PORT` defaults to 4399; it starts/stops preview itself). It requires
resolvable `playwright` and `sharp`, stitches fixed chapter layers, uses five
widths but a fixed **900px height**, and aborts Google Fonts without installing
fixtures. Its hardcoded journey/selectors and broad captures must fit the current
surface before use. It does not satisfy the exact viewport matrix or reliable
typography review. Keep it; prefer targeted existing-Playwright captures for the
final set rather than modifying or replacing it as part of unrelated work.

## Functional regression after visual stabilization

- `npm run build` then `npm run test:smoke`: the smoke script starts/stops its own
  preview on `127.0.0.1:4321` (`SMOKE_PORT` overrides it).
- `npm run test:opening`: requires an already running built preview, defaults to
  `http://127.0.0.1:4339` (`PORTFOLIO_QA_URL` overrides it), and writes to
  `.qa-director/opening`. Run when changes affect the opening or its handoffs.
- Other Portfolio scripts are direct Node scripts, not npm scripts. Read only
  the relevant one's assumptions before selecting it; historic composition
  assertions do not constitute approval of new art direction.

Select checks for the affected behavior; green tests do not replace critique.
Documentation/skill-only changes need metadata, links and Git-scope validation,
not builds or the expensive visual suite. Never deploy as part of visual QA.
