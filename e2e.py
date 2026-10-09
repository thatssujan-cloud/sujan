import json, sys
from playwright.sync_api import sync_playwright

results = {}
errors = []
with sync_playwright() as pw:
    try:
        browser = pw.chromium.launch()
    except Exception as e:
        print("NO_BROWSER:", str(e)[:200]); sys.exit(2)
    page = browser.new_page(viewport={"width":1440,"height":900})
    page.on("console", lambda m: errors.append(m.text) if m.type=="error" else None)
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.goto("http://localhost:8099/index.html", wait_until="networkidle")
    page.wait_for_timeout(3500)

    # 1. typing effect populated h1
    results["typed_len"] = page.evaluate("document.getElementById('typing-text').textContent.length")
    # 2. particles canvas running
    results["fps_tag"] = page.evaluate("document.getElementById('fpsTag').textContent")
    # 3. cursor enabled on desktop
    results["has_cursor"] = page.evaluate("document.body.classList.contains('has-cursor')")
    # 4. scrollspy active link
    page.click(".primary-nav a[href='#projects']")
    page.wait_for_timeout(1600)
    results["active_nav"] = page.evaluate("(document.querySelector('.primary-nav a.is-active')||{}).textContent || 'NONE'")
    # 5. reveal visible in projects
    results["revealed"] = page.evaluate("document.querySelectorAll('.reveal.is-visible').length")
    results["hidden_reveals"] = page.evaluate("[...document.querySelectorAll('.reveal')].filter(e=>getComputedStyle(e).opacity==='0'&&e.getBoundingClientRect().top<innerHeight&&e.getBoundingClientRect().bottom>0).length")
    # 6. tilt sets vars
    card = page.query_selector(".project-card[data-tilt]")
    bb = card.bounding_box(); page.mouse.move(bb["x"]+bb["width"]/2, bb["y"]+bb["height"]/2)
    page.wait_for_timeout(200)
    results["tilt_rx"] = card.evaluate("el=>getComputedStyle(el).getPropertyValue('--rx')")
    # 7. skill cross-reference
    page.evaluate("document.getElementById('about').scrollIntoView()")
    page.wait_for_timeout(900)
    page.click(".skill-list li >> nth=0")
    page.wait_for_timeout(1200)
    results["linked_cards"] = page.evaluate("document.querySelectorAll('.project-card.is-linked,.exp-card.is-linked,.exp-item.is-linked').length")
    page.click(".skill-list li >> nth=0")  # toggle off
    page.wait_for_timeout(400)
    results["filter_off"] = page.evaluate("!document.body.classList.contains('has-skill-filter')")
    # 8. decode title ran
    results["decoded_titles"] = page.evaluate("document.querySelectorAll('.sec-title.is-decoded').length")
    # 9. lightbox open/close via keyboard
    page.evaluate("document.getElementById('gallery').scrollIntoView()")
    page.wait_for_timeout(900)
    page.focus(".gallery-item >> nth=0")
    page.keyboard.press("Enter")
    page.wait_for_timeout(600)
    results["lightbox_open"] = page.evaluate("!document.getElementById('lightbox').hidden && document.getElementById('lightbox').classList.contains('is-open')")
    results["lightbox_focus"] = page.evaluate("document.activeElement.className")
    page.keyboard.press("Escape")
    page.wait_for_timeout(600)
    results["lightbox_closed"] = page.evaluate("document.getElementById('lightbox').hidden")
    # 10. Leaflet map + flyTo legend
    page.evaluate("document.getElementById('fieldmap').scrollIntoView()")
    page.wait_for_timeout(2500)
    results["leaflet_tiles"] = page.evaluate("document.querySelectorAll('#geo-map img.leaflet-tile, #geo-map .leaflet-tile-loaded').length")
    results["radar_markers"] = page.evaluate("document.querySelectorAll('#geo-map .radar-marker').length")
    page.click(".legend-btn[data-target='rasuwagadhi']")
    page.wait_for_timeout(2600)
    results["track_name"] = page.evaluate("document.getElementById('trackName').textContent")
    results["track_coords"] = page.evaluate("document.getElementById('trackCoords').textContent")
    # 11. theme toggle persists
    page.click("#themeToggle"); page.wait_for_timeout(300)
    results["theme_after"] = page.evaluate("document.documentElement.getAttribute('data-theme')+'|'+localStorage.getItem('theme')")
    page.click("#themeToggle"); page.wait_for_timeout(300)
    # 12. mobile: hamburger + no custom cursor
    m = browser.new_page(viewport={"width":390,"height":844}, has_touch=True, is_mobile=True)
    m.on("pageerror", lambda e: errors.append("MOBILE:"+str(e)))
    m.goto("http://localhost:8099/index.html", wait_until="networkidle")
    m.wait_for_timeout(2500)
    results["mobile_no_cursor"] = m.evaluate("!document.body.classList.contains('has-cursor')")
    m.tap(".nav-toggle"); m.wait_for_timeout(600)
    results["mobile_nav_open"] = m.evaluate("document.getElementById('primary-nav').classList.contains('is-open')")
    results["mobile_hscroll"] = m.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2")
    # 13. reduced motion pass
    r = browser.new_page(viewport={"width":1280,"height":800}, reduced_motion="reduce")
    r.on("pageerror", lambda e: errors.append("RM:"+str(e)))
    r.goto("http://localhost:8099/index.html", wait_until="networkidle")
    r.wait_for_timeout(1500)
    results["rm_title_full"] = r.evaluate("document.getElementById('typing-text').textContent.length > 40")
    results["rm_particles_hidden"] = r.evaluate("getComputedStyle(document.getElementById('particle-field')).display === 'none'")
    results["rm_content_visible"] = r.evaluate("[...document.querySelectorAll('.section-intro,.project-card')].every(e=>getComputedStyle(e).opacity==='1')")
    browser.close()

print(json.dumps(results, indent=1))
print("PAGE_ERRORS:", json.dumps(errors[:12], indent=1))
