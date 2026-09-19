import os, sys
from playwright.sync_api import sync_playwright
BASE = os.environ.get("PF_BASE", "http://127.0.0.1:4339")
sc = int(sys.argv[1]); x=int(sys.argv[2]); y=int(sys.argv[3]); w=int(sys.argv[4]); h=int(sys.argv[5])
with sync_playwright() as p:
    b = p.chromium.launch(headless=True, executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
    pg = b.new_context(viewport={"width":1440,"height":900}).new_page()
    pg.goto(BASE + "/portfolio/#3d-simulation")
    pg.wait_for_timeout(900)
    pg.evaluate("(v)=>{const w=document.querySelector('[data-world][data-open]'); w.scrollTop=v;}", sc)
    pg.wait_for_timeout(700)
    pg.screenshot(path=".pfvis/c4/zoom.png", clip={"x":x,"y":y,"width":w,"height":h})
    b.close()
