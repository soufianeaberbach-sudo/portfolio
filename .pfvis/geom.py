from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(headless=True, executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
    for w, h in [(390, 844), (834, 1112), (1440, 900)]:
        pg = b.new_page(viewport={"width": w, "height": h}, is_mobile=w < 768, has_touch=w < 768)
        pg.goto("http://127.0.0.1:4339/portfolio/")
        pg.wait_for_load_state("networkidle")
        pg.wait_for_timeout(600)
        print(w, pg.evaluate("""() => {
            const lay = document.querySelector('.pf-lay');
            const cs = getComputedStyle(lay);
            const pieces = [...lay.querySelectorAll('.pf-piece')].map(e => {
                const r = e.getBoundingClientRect();
                return {t: Math.round(r.top), b: Math.round(r.bottom), l: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height)};
            });
            const gaps = pieces.slice(1).map((q, i) => (w => w)(q.t - pieces[i].b));
            return { cols: cs.gridTemplateColumns, rowGap: cs.rowGap, colGap: cs.columnGap,
                     pieces, gaps, srPos: getComputedStyle(lay.querySelector('.pf-sr')).position };
        }"""))
        pg.close()
    b.close()
