"""Read the lay's computed geometry out of the page, instead of guessing at it
from a screenshot."""
import json, os
from playwright.sync_api import sync_playwright
BASE = os.environ.get("PF_BASE", "http://127.0.0.1:4339")
with sync_playwright() as p:
    b = p.chromium.launch(headless=True, executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
    pg = b.new_context(viewport={"width":1440,"height":900}).new_page()
    pg.goto(BASE + "/portfolio/#womenswear")
    pg.wait_for_timeout(1200)
    print(json.dumps(pg.evaluate("""() => {
      const cloth = document.querySelector('[data-world][data-open] .pf-lay__cloth');
      const out = {cloth: cloth.getBoundingClientRect().toJSON()};
      out.pieces = [...document.querySelectorAll('[data-world][data-open] .pf-lay__piece')].map(el => {
        const cs = getComputedStyle(el);
        const img = el.querySelector('img');
        const med = el.querySelector('.pf-lay__media');
        return {
          cat: el.dataset.category,
          clip: cs.clipPath.slice(0, 120),
          bg: cs.backgroundColor,
          media: med && med.getBoundingClientRect().toJSON(),
          img: img && img.getBoundingClientRect().toJSON(),
          imgFit: img && getComputedStyle(img).objectFit,
          nat: img && [img.naturalWidth, img.naturalHeight],
        };
      });
      return out;
    }"""), indent=1))
    b.close()
