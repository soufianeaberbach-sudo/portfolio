from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(headless=True, executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
    pg = b.new_page(viewport={"width": 1440, "height": 900})
    pg.goto("http://127.0.0.1:4339/portfolio/#womenswear/rtw")
    pg.wait_for_load_state("networkidle"); pg.wait_for_timeout(900)
    print(pg.evaluate("""() => {
        const active = document.querySelector('[data-screen="category"]:not([hidden])');
        const layers = [...active.querySelectorAll('.pf-dev')];
        const shown = layers.filter(l => !l.hidden);
        const first = layers[0];
        first.open = true;
        const btns = [...active.querySelectorAll('[data-evidence-open]')];
        const vis = btns.filter(x => x.getBoundingClientRect().width > 0);
        return { layers: layers.length, shown: shown.length, firstHidden: first.hidden,
                 firstOpen: first.open, buttons: btns.length, visibleButtons: vis.length,
                 firstBtnBox: btns[0] ? btns[0].getBoundingClientRect().width : null,
                 firstVisibleBox: vis[0] ? [Math.round(vis[0].getBoundingClientRect().width), Math.round(vis[0].getBoundingClientRect().top)] : null };
    }"""))
    b.close()
