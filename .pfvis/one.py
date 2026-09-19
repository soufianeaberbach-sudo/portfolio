import os, sys
from playwright.sync_api import sync_playwright
BASE = os.environ.get("PF_BASE", "http://127.0.0.1:4339")
hide = sys.argv[1] if len(sys.argv) > 1 else ""
with sync_playwright() as p:
    b = p.chromium.launch(headless=True, executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
    pg = b.new_context(viewport={"width":1440,"height":900}).new_page()
    pg.goto(BASE + "/portfolio/#womenswear")
    pg.wait_for_timeout(1200)
    if hide:
        pg.evaluate("(s) => document.querySelectorAll(s).forEach(e => e.style.visibility='hidden')", hide)
    pg.screenshot(path=".pfvis/c3/one.png", clip={"x":46,"y":313,"width":600,"height":800})
    b.close()
