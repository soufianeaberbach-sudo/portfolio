from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(headless=True, executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
    pg = b.new_page(viewport={"width": 1440, "height": 900})
    pg.goto("http://127.0.0.1:4339/portfolio/#tech-packs")
    pg.wait_for_load_state("networkidle"); pg.wait_for_timeout(700)
    print(pg.evaluate("""() => {
        const links = [...document.querySelectorAll('[data-world="tech-packs"] .pf-doc__page')];
        return links.map((a, i) => {
            const r = a.getBoundingClientRect();
            const el = document.elementFromPoint(r.left + r.width * 0.25, r.top + r.height / 2);
            const sheet = a.querySelector('.pf-doc__sheet').getBoundingClientRect();
            const mid = document.elementFromPoint(sheet.left + sheet.width / 2, sheet.top + sheet.height / 2);
            return { i, ownsCentre: mid ? mid.closest('.pf-doc__page') === a : false,
                     ownsQuarter: el ? el.closest('.pf-doc__page') === a : false };
        });
    }"""))
    print("world overflow:", pg.evaluate("""() => {
        const w = document.querySelector('[data-world="tech-packs"]');
        return w.scrollWidth - w.clientWidth;
    }"""))
    b.close()
