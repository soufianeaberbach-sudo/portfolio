import os
from playwright.sync_api import sync_playwright
BASE = os.environ.get("PF_BASE", "http://127.0.0.1:4339")
with sync_playwright() as p:
    b = p.chromium.launch(headless=True, executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
    pg = b.new_context(viewport={"width":1440,"height":900}).new_page()
    pg.goto(BASE + "/portfolio/#womenswear")
    pg.wait_for_timeout(1200)
    print(pg.evaluate("""() => {
      const pts = [[150,700],[150,760],[150,860],[300,760],[520,600]];
      const hit = pts.map(([x,y]) => {
        const e = document.elementFromPoint(x,y);
        return [x, y, e && (e.className.baseVal ?? e.className), e && e.closest('.pf-lay__piece')?.dataset.category];
      });
      const clips = [...document.querySelectorAll('[data-world][data-open] .pf-lay__piece')]
        .map(el => [el.dataset.category, getComputedStyle(el).clipPath]);
      return {hit, clips};
    }"""))
    b.close()
