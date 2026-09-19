"""Render the Portfolio and capture the states the art direction is judged on.

Native Playwright, per the webapp-testing skill. Fonts are served from a local
mirror so the type in a screenshot is the type a visitor sees; the proxy blocks
fonts.gstatic.com from the browser.
"""
import json, os, pathlib, sys
from playwright.sync_api import sync_playwright

SCRATCH = "/tmp/claude-0/-home-user-portfolio/21056ab9-c753-597a-ab6b-de83e2eb4534/scratchpad"
BASE = os.environ.get("PF_BASE", "http://127.0.0.1:4339")
OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else ".pfvis/out")
OUT.mkdir(parents=True, exist_ok=True)
JOBS = json.loads(sys.argv[2]) if len(sys.argv) > 2 else None

font_map = {}
for line in open(f"{SCRATCH}/fonts/map.txt").read().strip().split("\n"):
    url, rest = line.split(" -> ")
    font_map[url.strip()] = f"{SCRATCH}/fonts/" + rest.split(" ")[0]
gf_css = open(f"{SCRATCH}/fonts/gf.css", "rb").read()

DEFAULT_JOBS = [
    # name, hash, viewport, scroll (px in the open world, or window), hover selector
    ["opening",        "",                  [1440, 900], 0,    None],
    ["cut-mid",        "",                  [1440, 900], 420,  None],
    ["lay",            "",                  [1440, 900], 980,  None],
    ["lay-open",       "",                  [1440, 900], 980,  ".pf-piece[data-chapter='tech-packs']"],
    ["womenswear",     "#womenswear",       [1440, 900], 0,    None],
    ["viewer",         "#womenswear/rtw",   [1440, 900], 0,    None],
    ["techpacks",      "#tech-packs",       [1440, 900], 0,    None],
    ["pattern",        "#3d-simulation",    [1440, 900], 0,    None],
    ["tablet-lay",     "",                  [834, 1112], 900,  None],
    ["m-opening",      "",                  [390, 844],  0,    None],
    ["m-lay",          "",                  [390, 844],  760,  None],
    ["m-womenswear",   "#womenswear",       [390, 844],  0,    None],
    ["m-viewer",       "#womenswear/rtw",   [390, 844],  0,    None],
]

errors = []
with sync_playwright() as p:
    # The Python package and the preinstalled browser build are different
    # versions, so point at the browser this image already ships rather than
    # downloading a second one.
    browser = p.chromium.launch(
        headless=True,
        executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
    )
    for name, hash_, (w, h), scroll, hover in (JOBS or DEFAULT_JOBS):
        ctx = browser.new_context(viewport={"width": w, "height": h},
                                  is_mobile=w < 768, has_touch=w < 768)
        ctx.route("https://fonts.googleapis.com/**",
                  lambda r: r.fulfill(status=200, content_type="text/css", body=gf_css))
        def font(route):
            f = font_map.get(route.request.url)
            route.fulfill(status=200, content_type="font/woff2", body=open(f, "rb").read()) if f else route.abort()
        ctx.route("https://fonts.gstatic.com/**", font)
        page = ctx.new_page()
        page.on("pageerror", lambda e: errors.append(f"{name}: {e}"))
        page.goto(BASE + "/portfolio/" + hash_)
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(900)
        if scroll:
            page.evaluate("""(v) => {
                const w = document.querySelector('[data-world][data-open]');
                if (w) w.scrollTop = v; else window.scrollTo({top: v, behavior: 'instant'});
            }""", scroll)
            page.wait_for_timeout(900)
        if hover:
            page.locator(hover).first.hover()
            page.wait_for_timeout(800)
        page.screenshot(path=str(OUT / f"{name}.png"))
        ctx.close()
    browser.close()
print("errors:", errors or "none")
print("wrote", len(list(OUT.glob('*.png'))), "shots to", OUT)
