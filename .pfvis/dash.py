import os, json
from playwright.sync_api import sync_playwright
BASE = os.environ.get("PF_BASE", "http://127.0.0.1:4339")
with sync_playwright() as p:
    b = p.chromium.launch(headless=True, executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
    pg = b.new_context(viewport={"width":1440,"height":900}).new_page()
    pg.goto(BASE + "/portfolio/#3d-simulation")
    pg.wait_for_timeout(900)
    pg.evaluate("(v)=>{const w=document.querySelector('[data-world][data-open]'); w.scrollTop=v;}", 500)
    pg.wait_for_timeout(700)
    print(json.dumps(pg.evaluate("""() => {
      const make = document.querySelector('[data-make]');
      return {
        q: getComputedStyle(make).getPropertyValue('--q'),
        paths: [...make.querySelectorAll('[data-panel-p]')].map(p => ({
          len: p.getTotalLength().toFixed(1),
          arr: p.style.strokeDasharray,
          off: p.style.strokeDashoffset,
          d: p.getAttribute('d').slice(0, 90),
          g: p.parentElement.getAttribute('transform'),
        })),
      };
    }"""), indent=1))
    b.close()
