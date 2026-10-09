/* ==========================================================================
   GEO//SYS — High-Tech Geospatial & Subterranean Interface Controller
   Sujan Paudyal Portfolio · Vanilla ES6 · No frameworks
   Modules: Particles · Cursor · Typing/Glitch · Decode Titles · Reveals
            3D Tilt · Gallery/Lightbox · Leaflet Field Map · Nav · Theme
   All heavy motion is gated behind prefers-reduced-motion for WCAG 2.1 AA.
   ========================================================================== */
(function () {
  'use strict';

  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = motionQuery.matches;
  motionQuery.addEventListener && motionQuery.addEventListener('change', function (e) { reduced = e.matches; });

  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ------------------------------------------------------------------------
     0. SAFETY NETS — content must never be hidden if JS/CSS fails
     ------------------------------------------------------------------------ */
  if (!('IntersectionObserver' in window)) {
    document.documentElement.classList.add('no-io');
  }

  // If stylesheets fail to load (offline/blocked), inject a minimal fallback so
  // the page stays readable instead of unstyled-but-hidden.
  window.addEventListener('load', function () {
    if (document.body && document.body.scrollHeight === 0) {
      document.documentElement.classList.add('no-io');
    }
  });

  /* ------------------------------------------------------------------------
     1. PARTICLE FIELD — geological strata network on canvas (60fps target)
     ------------------------------------------------------------------------ */
  (function particleField() {
    var canvas = $('#particle-field');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    if (reduced) { canvas.style.display = 'none'; return; }

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, particles = [], rafId = null, running = true;
    var mouse = { x: -9999, y: -9999 };

    var STRATA = [ // soil / rock / node palette + rough depth bands (strata)
      { c: '16,224,168', band: 0.0 },  // neon topsoil nodes
      { c: '34,211,238', band: 0.33 }, // cyan mid-strata
      { c: '148,163,184', band: 0.66 } // slate deep substrate
    ];

    function size() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    function build() {
      // Density scales with area, capped for performance on ultra-wide screens
      var count = Math.max(28, Math.min(90, Math.floor((W * H) / 24000)));
      particles = [];
      for (var i = 0; i < count; i++) {
        var s = STRATA[i % STRATA.length];
        particles.push({
          x: Math.random() * W,
          // Bias each class toward its stratum band but allow drift mixing
          y: Math.random() * H * 0.55 + H * s.band * 0.45,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.14,
          r: Math.random() * 1.7 + 0.7,
          c: s.c,
          pulse: Math.random() * Math.PI * 2
        });
      }
    }

    var LINK_DIST = 128, MOUSE_DIST = 170;

    function step(t) {
      ctx.clearRect(0, 0, W, H);
      var i, j, p, q, dx, dy, d2;

      for (i = 0; i < particles.length; i++) {
        p = particles[i];
        p.x += p.vx; p.y += p.vy; p.pulse += 0.015;
        if (p.x < -20) p.x = W + 20; else if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20; else if (p.y > H + 20) p.y = -20;

        // gentle repulsion from cursor — "seismic disturbance"
        dx = p.x - mouse.x; dy = p.y - mouse.y;
        d2 = dx * dx + dy * dy;
        if (d2 < MOUSE_DIST * MOUSE_DIST && d2 > 0.01) {
          var f = (1 - Math.sqrt(d2) / MOUSE_DIST) * 0.35;
          var inv = 1 / Math.sqrt(d2);
          p.x += dx * inv * f; p.y += dy * inv * f;
        }
      }

      // proximity links (network nodes / fracture lines)
      ctx.lineWidth = 1;
      for (i = 0; i < particles.length; i++) {
        p = particles[i];
        for (j = i + 1; j < particles.length; j++) {
          q = particles[j];
          dx = p.x - q.x; dy = p.y - q.y;
          d2 = dx * dx + dy * dy;
          if (d2 < LINK_DIST * LINK_DIST) {
            var a = (1 - Math.sqrt(d2) / LINK_DIST) * 0.28;
            ctx.strokeStyle = 'rgba(' + p.c + ',' + a.toFixed(3) + ')';
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }

      // nodes
      for (i = 0; i < particles.length; i++) {
        p = particles[i];
        var glow = 0.5 + Math.sin(p.pulse) * 0.28;
        ctx.fillStyle = 'rgba(' + p.c + ',' + glow.toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      fps.tick();
      if (running) rafId = requestAnimationFrame(step);
    }

    // FPS telemetry -> header tag
    var fps = { frames: 0, last: performance.now(), el: $('#fpsTag') };
    fps.tick = function () {
      this.frames++;
      var now = performance.now();
      if (now - this.last >= 1000) {
        if (this.el) this.el.textContent = 'RENDER: ' + Math.min(this.frames, 120) + 'FPS';
        this.frames = 0; this.last = now;
      }
    };

    window.addEventListener('resize', debounce(size, 200));
    window.addEventListener('mousemove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    window.addEventListener('mouseout', function () { mouse.x = -9999; mouse.y = -9999; });

    // Pause when tab hidden (battery / perf)
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { running = false; cancelAnimationFrame(rafId); }
      else if (!running) { running = true; rafId = requestAnimationFrame(step); }
    });

    size();
    rafId = requestAnimationFrame(step);
  })();

  /* ------------------------------------------------------------------------
     2. DUAL-RING CUSTOM CURSOR — spring trailing mechanics (desktop only)
     ------------------------------------------------------------------------ */
  (function cursor() {
    var ring = $('.cursor--ring'), dot = $('.cursor--dot');
    if (!ring || !dot) return;
    if (reduced || !finePointer || 'ontouchstart' in window) return;

    document.body.classList.add('has-cursor');

    var mx = innerWidth / 2, my = innerHeight / 2;
    var rx = mx, ry = my; // ring lags behind via spring

    window.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
    }, { passive: true });

    (function spring() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      requestAnimationFrame(spring);
    })();

    // Active state over interactive elements
    var INTERACTIVE = 'a, button, .gallery-item, .skill-list li, [role="button"], input, [tabindex]:not([tabindex="-1"])';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest && e.target.closest(INTERACTIVE)) document.body.classList.add('cursor-active');
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest && e.target.closest(INTERACTIVE)) document.body.classList.remove('cursor-active');
    });
    document.addEventListener('mousedown', function () { document.body.classList.add('cursor-down'); });
    document.addEventListener('mouseup', function () { document.body.classList.remove('cursor-down'); });
    document.addEventListener('mouseleave', function () { ring.style.opacity = dot.style.opacity = '0'; });
    document.addEventListener('mouseenter', function () { ring.style.opacity = dot.style.opacity = ''; });
  })();

  /* ------------------------------------------------------------------------
     3. HERO — cyber typing reveal, then holographic glitch idle state
     ------------------------------------------------------------------------ */
  (function heroTyping() {
    var h1 = $('.hero h1.glitch');
    var target = $('#typing-text');
    if (!h1 || !target) return;
    var full = h1.getAttribute('data-text') || target.textContent;

    if (reduced) { // instant decode, no glitch loop
      target.textContent = full;
      h1.classList.add('is-glitching'); // static layers are opacity-0 without animation
      h1.classList.remove('is-glitching');
      return;
    }

    var i = 0;
    function type() {
      if (i <= full.length) {
        target.textContent = full.slice(0, i);
        i++;
        setTimeout(type, 26 + Math.random() * 46);
      } else {
        h1.classList.add('is-glitching');
      }
    }
    setTimeout(type, 500);
  })();

  /* ------------------------------------------------------------------------
     4. DECODE TITLES — section headers scramble-resolve on scroll-in
     ------------------------------------------------------------------------ */
  (function decodeTitles() {
    var glyphs = '#$%&*+/<>?01ΞΔΩ▚▞█';
    function decode(el) {
      var final = el.getAttribute('data-decode') || el.textContent;
      if (reduced) { el.textContent = final; el.classList.add('is-decoded'); return; }
      var frame = 0, total = final.length;
      var id = setInterval(function () {
        var out = '';
        for (var k = 0; k < total; k++) {
          if (k < frame) out += final[k];
          else if (final[k] === ' ') out += ' ';
          else out += glyphs[(Math.random() * glyphs.length) | 0];
        }
        el.textContent = out;
        frame += 1.6;
        if (frame >= total) { clearInterval(id); el.textContent = final; el.classList.add('is-decoded'); }
      }, 28);
    }

    var titles = $$('.sec-title[data-decode]');
    if (!('IntersectionObserver' in window)) {
      titles.forEach(function (t) { t.classList.add('is-decoded'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { decode(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    titles.forEach(function (t) { io.observe(t); });
  })();

  /* ------------------------------------------------------------------------
     5. SCROLL REVEALS — staggered IntersectionObserver entrances
     ------------------------------------------------------------------------ */
  (function reveals() {
    var groups = [
      '.section-intro', '.about-text', '.about-side', '.subsection',
      '.timeline-item', '.exp-item', '.exp-card', '.project-card',
      '.testimonial-card', '.gallery-item', '.contact-card',
      '.volunteer-list li', '.mentor-photo', '.map-shell', '.hero-visual'
    ];
    var els = $$(groups.join(','));
    if (!els.length) return;

    if (!('IntersectionObserver' in window) || reduced) {
      document.documentElement.classList.add('no-io');
      return;
    }

    // Group siblings so stagger delay resets per container
    var seen = {};
    els.forEach(function (el) {
      var parent = el.parentElement;
      var key = parent ? (parent.dataset.revKey || (parent.dataset.revKey = String(Object.keys(seen).length))) : 'root';
      seen[key] = (seen[key] || 0);
      el.classList.add('reveal');
      el.style.setProperty('--reveal-delay', (seen[key]++ % 8) * 90 + 'ms');
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    els.forEach(function (el) { io.observe(el); });
  })();

  /* ------------------------------------------------------------------------
     6. 3D TILT + MAGNETIC BORDER GLOW (pointer-fine, non-reduced only)
     ------------------------------------------------------------------------ */
  (function tiltCards() {
    var cards = $$('.tilt-card[data-tilt]');
    if (!cards.length || reduced || !finePointer) return;
    var MAX = 7; // degrees — subtle, not nauseating

    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;   // 0..1
        var py = (e.clientY - r.top) / r.height;
        card.classList.add('is-tilting');
        card.style.setProperty('--rx', ((0.5 - py) * MAX * 2).toFixed(2) + 'deg');
        card.style.setProperty('--ry', ((px - 0.5) * MAX * 2).toFixed(2) + 'deg');
        card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      });
      card.addEventListener('mouseleave', function () {
        card.classList.remove('is-tilting');
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  })();

  /* ------------------------------------------------------------------------
     7. SKILL MATRIX → PROJECT CROSS-REFERENCE
     ------------------------------------------------------------------------ */
  (function skillLink() {
    var skills = $$('.skill-list li');
    var cards = $$('.project-card, .exp-card, .exp-item');
    if (!skills.length) return;

    function norm(s) { return (s || '').toLowerCase().trim(); }

    function match(skillName) {
      var n = norm(skillName);
      cards.forEach(function (card) {
        var hay = norm(card.textContent);
        var hit = hay.indexOf(n) !== -1 ||
          (n === 'surveying' && (hay.indexOf('leveling') !== -1 || hay.indexOf('topographic') !== -1)) ||
          (n === 'terrain analysis' && hay.indexOf('terrain') !== -1) ||
          (n === 'foundation construction' && hay.indexOf('foundation') !== -1) ||
          (n === 'soil testing' && hay.indexOf('soil') !== -1) ||
          (n === 'geological mapping' && hay.indexOf('mapping') !== -1);
        card.classList.toggle('is-linked', hit);
      });
    }

    function clear() {
      skills.forEach(function (s) { s.classList.remove('is-linked'); s.setAttribute('aria-pressed', 'false'); });
      cards.forEach(function (c) { c.classList.remove('is-linked'); });
      document.body.classList.remove('has-skill-filter');
    }

    function toggle(li) {
      var wasOn = li.getAttribute('aria-pressed') === 'true';
      clear();
      if (!wasOn) {
        li.classList.add('is-linked');
        li.setAttribute('aria-pressed', 'true');
        match(li.textContent);
        document.body.classList.add('has-skill-filter');
        var first = $('.project-card.is-linked, .exp-card.is-linked, .exp-item.is-linked');
        if (first) first.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      }
    }

    skills.forEach(function (li) {
      li.addEventListener('click', function () { toggle(li); });
      li.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(li); }
      });
    });
  })();

  /* ------------------------------------------------------------------------
     8. GALLERY — focal highlight + accessible lightbox with focus trap
     ------------------------------------------------------------------------ */
  (function gallery() {
    var items = $$('.gallery-item');
    var box = $('#lightbox');
    if (!items.length || !box) return;
    var img = $('#lightbox-img'), cap = $('#lightbox-caption'), closeBtn = $('.lightbox-close', box);
    var lastFocus = null;

    // Focal highlight follows pointer inside each frame
    if (finePointer && !reduced) {
      items.forEach(function (item) {
        item.addEventListener('mousemove', function (e) {
          var r = item.getBoundingClientRect();
          item.style.setProperty('--fx', (((e.clientX - r.left) / r.width) * 100).toFixed(1) + '%');
          item.style.setProperty('--fy', (((e.clientY - r.top) / r.height) * 100).toFixed(1) + '%');
        });
      });
    }

    function open(item) {
      var src = $('img', item), caption = $('figcaption', item);
      if (!src) return;
      lastFocus = document.activeElement;
      img.src = src.currentSrc || src.src; // native-res image; browser scales crisply in lightbox
      img.alt = src.alt;
      cap.textContent = caption ? caption.textContent : '';
      box.hidden = false;
      requestAnimationFrame(function () { box.classList.add('is-open'); });
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }

    function close() {
      box.classList.remove('is-open');
      document.body.style.overflow = '';
      setTimeout(function () { box.hidden = true; img.src = ''; }, reduced ? 0 : 360);
      if (lastFocus) lastFocus.focus();
    }

    items.forEach(function (item) {
      item.addEventListener('click', function () { open(item); });
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(item); }
      });
    });

    closeBtn.addEventListener('click', close);
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'Tab') { // simple focus trap (only two focusables exist)
        var focusables = $$('button', box);
        var idx = focusables.indexOf(document.activeElement);
        if (e.shiftKey && idx <= 0) { e.preventDefault(); focusables[focusables.length - 1].focus(); }
        else if (!e.shiftKey && idx === focusables.length - 1) { e.preventDefault(); focusables[0].focus(); }
      }
    });
  })();

  /* ------------------------------------------------------------------------
     9. LEAFLET FIELD MAP — dark orbital tiles + radar-pulse markers + flyTo
     ------------------------------------------------------------------------ */
  (function fieldMap() {
    var el = $('#geo-map');
    if (!el) return;

    function init() {
      if (typeof L === 'undefined') { // CDN blocked → graceful readout fallback
        var rn = $('#trackName'); if (rn) rn.textContent = 'OFFLINE — SEE LIST BELOW';
        return;
      }

      var SITES = {
        taplejung:  { name: 'MEWA-CHANGHE CORRIDOR', ll: [27.2900, 87.7200], zoom: 11, alt: 'ALT 2,410 m', desc: '132 kV transmission-line foundation supervision — active deployment.' },
        rasuwagadhi:{ name: 'RASUWAGADHI-KERUNG CORRIDOR', ll: [28.1930, 85.3910], zoom: 12, alt: 'ALT 1,520 m', desc: 'Published flood-dynamics & transboundary hazard research site.' },
        phung:      { name: 'PHUNG HYDRO SECTOR', ll: [27.2080, 87.5890], zoom: 12, alt: 'ALT 1,150 m', desc: 'Madhyaphawa Khola run-of-river intake & headworks investigation.' },
        jajarkot:   { name: 'JAJARKOT SEISMIC ZONE', ll: [28.7280, 82.1910], zoom: 11, alt: 'ALT 1,910 m', desc: 'Seismic micro-zonation study — in progress.' }
      };
      var OVERVIEW = { ll: [28.05, 85.9], zoom: 6 };

      var map = L.map(el, {
        center: OVERVIEW.ll, zoom: OVERVIEW.zoom,
        zoomControl: true, scrollWheelZoom: false, attributionControl: true
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19, subdomains: 'abcd',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      }).addTo(map);

      function radarIcon(color) {
        return L.divIcon({
          className: '',
          iconSize: [34, 34], iconAnchor: [17, 17],
          html: '<span class="radar-marker"><svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">' +
                '<circle class="radar-ring" cx="17" cy="17" r="13" fill="none" stroke="' + color + '" stroke-width="1.6"/>' +
                '<circle class="radar-ring radar-ring--b" cx="17" cy="17" r="13" fill="none" stroke="' + color + '" stroke-width="1.2"/>' +
                '<circle class="radar-core" cx="17" cy="17" r="4" fill="' + color + '"/>' +
                '<path d="M17 1v6M17 27v6M1 17h6M27 17h6" stroke="' + color + '" stroke-width="1.4"/></svg></span>'
        });
      }

      Object.keys(SITES).forEach(function (key) {
        var s = SITES[key];
        L.marker(s.ll, {
          icon: radarIcon(key === 'taplejung' ? '#fbbf24' : '#10e0a8'),
          title: s.name, keyboard: true, alt: s.name
        }).addTo(map).bindPopup('<b>' + s.name + '</b><br>' + s.desc + '<br><small>' +
          s.ll[0].toFixed(4) + '&deg; N &middot; ' + s.ll[1].toFixed(4) + '&deg; E &middot; ' + s.alt + '</small>');
      });

      var trackName = $('#trackName'), trackCoords = $('#trackCoords');

      function setTrack(name, ll, altTxt) {
        if (trackName) trackName.textContent = name;
        if (trackCoords) trackCoords.textContent = ll[0].toFixed(4) + '\u00B0 N \u00B7 ' + ll[1].toFixed(4) + '\u00B0 E \u00B7 ' + altTxt;
      }

      $$('.legend-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          $$('.legend-btn').forEach(function (b) { b.classList.remove('is-active'); });
          btn.classList.add('is-active');
          var key = btn.getAttribute('data-target');
          if (key === 'overview') {
            map.flyTo(OVERVIEW.ll, OVERVIEW.zoom, { duration: reduced ? 0 : 1.8, easeLinearity: 0.18 });
            setTrack('FULL THEATER VIEW', OVERVIEW.ll, 'NTS');
          } else if (SITES[key]) {
            var s = SITES[key];
            map.flyTo(s.ll, s.zoom, { duration: reduced ? 0 : 1.6, easeLinearity: 0.2 });
            setTrack(s.name, s.ll, s.alt);
          }
        });
      });

      // Fluid invalidation when the section scrolls into view
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) { map.invalidateSize({ animate: !reduced }); io.unobserve(el); }
          });
        }, { threshold: 0.2 });
        io.observe(el);
      }
      window.addEventListener('resize', debounce(function () { map.invalidateSize(); }, 250));
    }

    // Leaflet loads deferred; wait for it before DOMContentLoaded-dependent init
    if (document.readyState === 'complete') init();
    else window.addEventListener('load', init);
  })();

  /* ------------------------------------------------------------------------
     10. NAVIGATION — hamburger, smooth anchors, scrollspy, skip link
     ------------------------------------------------------------------------ */
  (function navigation() {
    var toggle = $('.nav-toggle'), nav = $('#primary-nav');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        var open = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(open));
      });
      $$('#primary-nav a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function () {
          nav.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
        });
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && nav.classList.contains('is-open')) {
          nav.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
          toggle.focus();
        }
      });
    }

    // Scrollspy with .is-active (CSS already styles it)
    var sections = $$('main section[id]');
    var links = $$('.primary-nav a[href^="#"]');
    if ('IntersectionObserver' in window && sections.length) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          links.forEach(function (l) {
            l.classList.toggle('is-active', l.getAttribute('href') === '#' + en.target.id);
          });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      sections.forEach(function (s) { spy.observe(s); });
    }

    // Skip-link returns focus properly
    var skip = $('.skip-link');
    if (skip) skip.addEventListener('click', function () {
      var t = $(skip.getAttribute('href'));
      if (t) { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: false }); }
    });
  })();

  /* ------------------------------------------------------------------------
     11. LIVE TELEMETRY — drifting LAT/LON readout in the header
     ------------------------------------------------------------------------ */
  (function telemetry() {
    var el = $('#liveCoords');
    if (!el || reduced) return;
    var baseLat = 27.7106, baseLon = 85.3201, t = 0;
    setInterval(function () {
      t += 0.7;
      var lat = baseLat + Math.sin(t * 0.11) * 0.0009;
      var lon = baseLon + Math.cos(t * 0.09) * 0.0011;
      el.innerHTML = 'LAT ' + lat.toFixed(4) + '&deg; N &middot; LON ' + lon.toFixed(4) + '&deg; E';
    }, 700);
  })();

  /* ------------------------------------------------------------------------
     12. THEME TOGGLE — persisted, icon swaps
     ------------------------------------------------------------------------ */
  (function theme() {
    var btn = $('#themeToggle'), icon = $('#themeIcon');
    if (!btn) return;
    function paint(mode) {
      if (icon) icon.textContent = mode === 'light' ? '\u2600\uFE0F' : '\uD83C\uDF19';
      btn.setAttribute('aria-label', mode === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
    }
    paint(document.documentElement.getAttribute('data-theme') || 'dark');
    btn.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      paint(next);
    });
  })();

  /* ------------------------------------------------------------------------
     UTIL
     ------------------------------------------------------------------------ */
  function debounce(fn, wait) {
    var id;
    return function () {
      var args = arguments, self = this;
      clearTimeout(id);
      id = setTimeout(function () { fn.apply(self, args); }, wait);
    };
  }
})();
