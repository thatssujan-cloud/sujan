# Alex Rivera — Portfolio Website

A four-page portfolio site (Home, Projects, About, Contact) built with plain HTML, CSS, and JavaScript — no build step, no framework, no dependencies beyond two Google Fonts.

## Design direction

The visual system is deliberately not the generic "warm cream + serif" portfolio look. It's built around an **"engineering pad"** concept: a pale, cool-toned paper background, ink-dark text, and one precision-blue accent. Monospace (IBM Plex Mono) carries the structural voice — headings, section labels, tags, meta text — while a humanist sans (Public Sans) handles body copy so long-form reading stays comfortable. Section labels use a `//` comment-style prefix as a small, consistent wayfinding device. The footer includes a "design tokens" strip showing the actual palette the site is built from. All of it lives as CSS custom properties at the top of `css/styles.css`, so the whole look can be retuned from one place without hunting through the markup.

## File structure

```
portfolio/
├── index.html         Home — hero intro, featured work, toolkit snapshot, about teaser
├── projects.html       Projects — 3 detailed case studies + 3 additional project cards
├── about.html           About — story, skills, experience timeline
├── contact.html          Contact — validated contact form + direct contact info
├── favicon.svg            Simple monogram favicon
├── css/
│   └── styles.css        Design tokens + all component and page styles (organized by section)
├── js/
│   └── main.js            Mobile nav toggle, footer year, contact form validation
└── README.md
```

## Before you launch: customize these

- [ ] **Name & branding** — find/replace "Alex Rivera" and the "AR" logo mark across all 4 HTML files.
- [ ] **Colors & type** — every design token lives at the top of `css/styles.css` under `:root`. Change a value once and every page updates, including the footer's token-strip swatches.
- [ ] **Project content** — replace the 6 example projects in `index.html` and `projects.html` with your own. Each has a matching `id` (e.g. `#northwind-dashboard`) linking the homepage card to its full case study on the projects page — keep the ids in sync if you rename a project.
- [ ] **Images** — every project and the About photo use a placeholder `<div class="media-placeholder">`. Search for `media-placeholder` and swap each one for a real `<img src="images/your-file.jpg" alt="Describe what's in the image">`.
- [ ] **Live demo / repo links** — search for `href="#"` in `projects.html` and point each to your real links.
- [ ] **Social & email links** — update the GitHub/LinkedIn URLs and the `mailto:` address in every footer and on `contact.html`.
- [ ] **Contact form backend** — see below; this is the one piece that needs a real connection before it can actually send you messages.

## Connecting the contact form

Static HTML can't send email on its own, so right now the form validates input correctly and shows a success message, but only *simulates* sending. Open `js/main.js` and find the comment block inside `initContactForm()` — swap in a real endpoint from a form backend service (Formspree, Getform, and Netlify Forms all have free tiers that need no server code), or point it at your own API route if you're hosting somewhere with server support.

## Previewing locally

Opening `index.html` directly in a browser works for a quick look. For the most accurate preview, serve the folder locally:

```bash
# Python (built in on most systems)
python3 -m http.server 8000

# or Node
npx serve
```

Then visit `http://localhost:8000`.

## Deploying

Any static host works well here since there's no build step:

- **GitHub Pages** — push this folder to a repo and enable Pages in the repo settings.
- **Netlify / Vercel** — drag-and-drop the folder in their dashboard, or connect the repo for automatic deploys on every push.

## What's already handled

- **Responsive layout** — fluid type sizing, CSS Grid cards that reflow automatically, and a mobile nav menu below 720px wide.
- **Accessibility** — skip-to-content link, semantic landmarks, a keyboard-operable nav toggle, labeled and validated form fields with announced errors, visible focus states, and a `prefers-reduced-motion` fallback.
- **Performance** — no JS framework, two efficiently-loaded fonts (`font-display: swap`), and CSS/SVG placeholders instead of image weight until you add real photos.

## Next steps if you outgrow this

The header and footer are repeated across all 4 pages since this is plain HTML with no templating layer. If that becomes annoying to maintain, moving to a static site generator (Astro, Eleventy) or a lightweight framework would let you share that markup from one file — everything here is written in a way that would port over cleanly.
