import json
from playwright.sync_api import sync_playwright
res={}; errs=[]
with sync_playwright() as pw:
    b=pw.chromium.launch()
    p=b.new_page(viewport={"width":1440,"height":900})
    p.on("pageerror", lambda e: errs.append(str(e)))
    p.goto("http://localhost:8099/index.html", wait_until="networkidle")
    # tilt: hover center then corner, read computed transform + --rx
    p.evaluate("document.getElementById('projects').scrollIntoView()")
    p.wait_for_timeout(1500)
    card=p.query_selector(".project-card[data-tilt]")
    bb=card.bounding_box()
    p.mouse.move(bb["x"]+bb["width"]*0.25, bb["y"]+bb["height"]*0.3)
    p.wait_for_timeout(150)
    res["tilt_rx"]=card.evaluate("el=>getComputedStyle(el).getPropertyValue('--rx')")
    res["tilt_mx"]=card.evaluate("el=>getComputedStyle(el).getPropertyValue('--mx')")
    res["transform"]=card.evaluate("el=>getComputedStyle(el).transform.slice(0,60)")
    p.mouse.move(10,10); p.wait_for_timeout(700)
    res["tilt_reset"]=card.evaluate("el=>getComputedStyle(el).getPropertyValue('--rx')")
    # lightbox focus + trap + image src
    p.evaluate("document.getElementById('gallery').scrollIntoView()"); p.wait_for_timeout(1000)
    p.focus(".gallery-item >> nth=1"); p.keyboard.press("Enter"); p.wait_for_timeout(500)
    res["lb_focus_close"]=p.evaluate("document.activeElement.className")
    res["lb_img"]=p.evaluate("document.getElementById('lightbox-img').src.includes('field4')")
    res["lb_cap"]=p.evaluate("document.getElementById('lightbox-caption').textContent.slice(0,8)")
    p.keyboard.press("Tab"); p.wait_for_timeout(100)
    res["trap_tab"]=p.evaluate("document.activeElement.className")  # should stay on close btn
    p.keyboard.press("Escape"); p.wait_for_timeout(500)
    res["focus_restored"]=p.evaluate("document.activeElement.className.includes('gallery-item')")
    # scrollspy after settle
    p.evaluate("window.scrollTo(0,0)"); p.wait_for_timeout(300)
    p.evaluate("document.getElementById('testimonials').scrollIntoView({block:'center'})")
    p.wait_for_timeout(1500)
    res["spy"]=p.evaluate("(document.querySelector('.primary-nav a.is-active')||{}).getAttribute?.('href')||'NONE'")
    # keyboard tab order sanity: skip link first
    p.evaluate("window.scrollTo(0,0)"); p.wait_for_timeout(400)
    p.keyboard.press("Tab")
    res["first_tab"]=p.evaluate("document.activeElement.className")
    # hidden reveals check viewport-relative again
    res["hidden_in_view"]=p.evaluate("[...document.querySelectorAll('.reveal:not(.is-visible)')].filter(e=>{const r=e.getBoundingClientRect();return r.top<innerHeight-50&&r.bottom>50}).length")
    # map popup opens on marker click
    p.evaluate("document.getElementById('fieldmap').scrollIntoView()"); p.wait_for_timeout(2000)
    res["marker_focusable"]=p.evaluate("!!document.querySelector('#geo-map .leaflet-marker-icon[tabindex]')")
    p.evaluate("document.querySelector('#geo-map .leaflet-marker-icon[tabindex]').focus()")
    p.keyboard.press("Enter"); p.wait_for_timeout(700)
    res["popup"]=p.evaluate("!!document.querySelector('#geo-map .leaflet-popup-content b')")
    # overview flyTo
    p.click(".legend-btn[data-target='overview']"); p.wait_for_timeout(2500)
    res["overview_track"]=p.evaluate("document.getElementById('trackName').textContent")
    b.close()
print(json.dumps(res,indent=1)); print("ERRORS:",errs[:8])
