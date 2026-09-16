# Overview — Earth, from orbit

Scroll-driven landing page: one WebGL globe (React Three Fiber) behind the page, scrolled through five framings. Built for the Scroll Sites marketplace and designed to be embedded in an iframe.

- `npm run dev` — local dev
- `npm run build` — production build to `dist/` (set `BASE=/repo-name/` for GitHub Pages)
## Live URLs
- **Primary (Vercel):** https://overview-scroll-site.vercel.app — this is the URL the marketplace embeds in its iframe.
- Mirror (GitHub Pages): https://husnainkhushid.github.io/overview-scroll-site/

Both deploy automatically on push to `main`. Vercel builds with `BASE=/` (default); the Pages workflow sets `BASE=/overview-scroll-site/`.

## For the coding agent
Section-by-section resources (component + CSS + asset prompt + agent prompt + preview) live in the marketplace workspace under `02-sections/overview/`. Section ids in this site: `00-navbar 01-hero 02-about 03-night 04-enroll 05-footer` (`data-section` attributes). Deep-link a section with `https://overview-scroll-site.vercel.app/#<dom-id>` (`#top #modules #preview #enroll #footer`) or send `{ type: 'scrollTo', id: '03-night' }` via postMessage when embedded.

## Iframe API
The page posts `{ source: 'scroll-site', type: 'sections', ids }` on load and `{ type: 'section', id }` as each `[data-section]` crosses the viewport centre. Send `{ type: 'scrollTo', id }` to drive it.
