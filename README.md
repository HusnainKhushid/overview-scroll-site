# Overview — Earth, from orbit

Scroll-driven landing page: one WebGL globe (React Three Fiber) behind the page, scrolled through five framings. Built for the Scroll Sites marketplace and designed to be embedded in an iframe.

- `npm run dev` — local dev
- `npm run build` — production build to `dist/` (set `BASE=/repo-name/` for GitHub Pages)
- Deploys automatically to GitHub Pages on push to `main`.

## Iframe API
The page posts `{ source: 'scroll-site', type: 'sections', ids }` on load and `{ type: 'section', id }` as each `[data-section]` crosses the viewport centre. Send `{ type: 'scrollTo', id }` to drive it.
