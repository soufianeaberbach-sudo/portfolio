from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(headless=True, executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
    pg = b.new_page(viewport={"width": 1440, "height": 900})
    pg.goto("http://127.0.0.1:4339/portfolio/#3d-simulation")
    pg.wait_for_load_state("networkidle")
    pg.wait_for_timeout(3500)
    print("chapter clip:", pg.evaluate("""() => {
        const v = document.querySelector('[data-change-clip]');
        return v ? {paused: v.paused, t: +v.currentTime.toFixed(2), preload: v.preload, w: v.videoWidth} : 'missing';
    }"""))
    pg.goto("http://127.0.0.1:4339/portfolio/")
    pg.wait_for_load_state("networkidle")
    pg.evaluate("window.scrollTo({top: 1000, behavior:'instant'})")
    pg.wait_for_timeout(3500)
    print("landing piece:", pg.evaluate("""() => {
        const v = document.querySelector('[data-piece-motion]');
        return v ? {paused: v.paused, t: +v.currentTime.toFixed(2), preload: v.preload, w: v.videoWidth} : 'missing';
    }"""))
    b.close()
