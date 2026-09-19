from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(headless=True, executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
    pg = b.new_page(viewport={"width": 1440, "height": 900})
    logs = []
    pg.on("console", lambda m: logs.append(f"{m.type}: {m.text}"))
    pg.on("requestfailed", lambda r: logs.append(f"FAILED {r.url} {r.failure}"))
    pg.on("response", lambda r: logs.append(f"{r.status} {r.url.split('/')[-1]}") if ".mp4" in r.url else None)
    pg.goto("http://127.0.0.1:4339/portfolio/#3d-simulation")
    pg.wait_for_load_state("networkidle")
    pg.wait_for_timeout(1500)
    print(pg.evaluate("""() => {
        const v = document.querySelector('[data-change-clip]');
        if (!v) return 'missing';
        const r = v.getBoundingClientRect();
        return { readyState: v.readyState, networkState: v.networkState, err: v.error && v.error.code,
                 rect: [Math.round(r.width), Math.round(r.height), Math.round(r.top)],
                 src: v.currentSrc || v.src };
    }"""))
    print(pg.evaluate("""async () => {
        const v = document.querySelector('[data-change-clip]');
        v.preload = 'auto'; v.load();
        try { await v.play(); return {ok: true, paused: v.paused, readyState: v.readyState}; }
        catch (e) { return {ok: false, error: String(e)}; }
    }"""))
    pg.wait_for_timeout(1500)
    print(pg.evaluate("() => { const v = document.querySelector('[data-change-clip]'); return {paused: v.paused, t: v.currentTime, rs: v.readyState}; }"))
    print("\n".join(logs[-8:]) or "no logs")
    b.close()
