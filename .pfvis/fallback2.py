"""The two fallbacks this route promises: reduced motion resolves every
transformation to its finished state, and with no script nothing is parked at
zero. Read the values rather than trusting the CSS."""
import os, json
from playwright.sync_api import sync_playwright
BASE = os.environ.get("PF_BASE", "http://127.0.0.1:4339")
PROBE = """() => {
  const cut = document.querySelector('[data-cut]');
  const pieces = [...document.querySelectorAll('.pf-piece')];
  return {
    p: getComputedStyle(cut).getPropertyValue('--p').trim(),
    clips: pieces.map(e => getComputedStyle(e).clipPath.slice(0, 22)),
    typeVisible: pieces.filter(e => Number(getComputedStyle(e.querySelector('.pf-piece__type')).opacity) > .5).length,
    links: pieces.filter(e => e.tagName === 'A' && e.getAttribute('href')).length,
  };
}"""
MAKE = """() => {
  const m = document.querySelector('[data-make]');
  const v = document.querySelector('[data-make-clip]');
  return {
    q: getComputedStyle(m).getPropertyValue('--q').trim(),
    word: document.querySelector('[data-make-word]').textContent.trim(),
    drawOpacity: getComputedStyle(document.querySelector('.pf-make__draw')).opacity,
    clipOpacity: getComputedStyle(v).opacity,
    currentTime: v.currentTime, readyState: v.readyState,
  };
}"""
with sync_playwright() as p:
    b = p.chromium.launch(headless=True, executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
    for name, kw in [("reduced", {"reduced_motion": "reduce"}), ("nojs", {"java_script_enabled": False})]:
        ctx = b.new_context(viewport={"width": 1440, "height": 900}, **kw)
        pg = ctx.new_page()
        pg.goto(BASE + "/portfolio/")
        pg.wait_for_timeout(1200)
        print(name, "landing:", json.dumps(pg.evaluate(PROBE) if kw.get("java_script_enabled") is not False else "no-js: reading CSS only"))
        if kw.get("java_script_enabled") is not False:
            pg.goto(BASE + "/portfolio/#3d-simulation"); pg.wait_for_timeout(1400)
            print(name, "make:", json.dumps(pg.evaluate(MAKE)))
        ctx.close()
    # no-JS: the fallback page is plain markup, so measure it as a document
    ctx = b.new_context(viewport={"width": 1440, "height": 900}, java_script_enabled=False)
    pg = ctx.new_page(); pg.goto(BASE + "/portfolio/"); pg.wait_for_timeout(600)
    pg.screenshot(path=".pfvis/c6/nojs.png", full_page=False)
    print("nojs sizes:", pg.evaluate("""() => ({
      pieces: [...document.querySelectorAll('.pf-piece')].map(e => Math.round(e.getBoundingClientRect().width)),
      lay: document.querySelectorAll('.pf-lay__piece').length,
      makeWord: document.querySelector('[data-make-word]')?.textContent.trim(),
      videoSrc: [...document.querySelectorAll('video')].map(v => v.currentSrc || 'none'),
    })"""))
    ctx.close(); b.close()
