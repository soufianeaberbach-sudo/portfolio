from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(headless=True, executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
    pg = b.new_page(viewport={"width": 1440, "height": 900})
    pg.goto("http://127.0.0.1:4339/portfolio/")
    pg.wait_for_load_state("networkidle")
    pg.evaluate("window.scrollTo({top:1000,behavior:'instant'})"); pg.wait_for_timeout(500)
    base = pg.evaluate("() => [...document.querySelectorAll('.pf-piece')].map(e=>Math.round(e.getBoundingClientRect().width))")
    print("at rest:", base, "equal:", len(set(base)) == 1)
    for ch in ["womenswear", "menswear", "tech-packs", "3d-simulation"]:
        pg.locator(f'[data-chapter="{ch}"]').hover(); pg.wait_for_timeout(800)
        w = pg.evaluate("() => [...document.querySelectorAll('.pf-piece')].map(e=>({c:e.dataset.chapter,w:Math.round(e.getBoundingClientRect().width),clip:e.querySelector('.pf-piece__name').scrollWidth > e.querySelector('.pf-piece__name').clientWidth+1}))")
        widest = max(w, key=lambda x: x["w"])
        print(f'hover {ch:15s} -> widest={widest["c"]:15s} correct={widest["c"]==ch}  clipped={[x["c"] for x in w if x["clip"]]}')
    b.close()
