# KORVA — storefront

A static, single-page fashion storefront for T-shirts, pants, shoes and accessories.

Live site: https://rukshanm123-art.github.io/korva-store/

![Preview](docs/preview.jpg)

## Run

No build step. Serve the folder and open it in a browser:

```bash
python3 -m http.server 8080   # then open http://localhost:8080
```

## Sections

1. Intro curtain that parts to reveal the store
2. Hero slideshow with a floating pill nav, letter-by-letter titles and progress bars
3. Six Moods: arched lookbook frames
4. Try the Look: a coverflow of eight outfits, each with numbered hotspots and a piece list
5. Pick a Fit: a drifting 3D card deck with tilt, press and add-to-bag
6. The Rack: drawn garments on a clothes rail, with filters, swing, focus view, front/back toggle and sizes
7. Built for the block: draggable product cards and marquee lines
8. Feel the fit: a Ken Burns "film" between two drifting photo columns
9. Style, in motion: a reels coverflow and a full-screen story viewer
10. The Signature Collection: a fan of arched cards
11. Three pieces, one fit: pick three fabrics and they weave into a braid on a canvas (10% bundle discount)
12. Footer card, a bottom ticker and a bag drawer

## Files

- `index.html`: markup
- `styles.css`: all styling and animation
- `data.js`: products, looks, reels and other content. Edit this file to change the catalogue, prices or currency (`window.CUR`).
- `garments.js`: SVG drawings for the rack (tees, pants, shoes, caps, bags)
- `weave.js`: the fabric-ribbon canvas
- `app.js`: interactions
- `assets/img`: photography from Unsplash (Unsplash License)

## Deploy

`.github/workflows/pages.yml` publishes the site to GitHub Pages on every push to `main` (or on demand from the Actions tab). Pages must be enabled once: Settings → Pages → Source: **GitHub Actions**.
