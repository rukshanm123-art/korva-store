# KORVA — storefront

A static fashion store for T-shirts, pants, shoes and accessories, priced in New Zealand dollars, with a checkout page.

Live site: https://rukshanm123-art.github.io/korva-store/

![Preview](docs/preview.jpg)

## Run locally

No build step. Serve the folder and open it in a browser:

```bash
python3 -m http.server 8080   # then open http://localhost:8080
```

## The catalogue

20 products, 5 per category, all defined in `data.js`. Every section of the site reads from that one list, so a product's name, photo and price match everywhere: the looks, the cards, the rack, the reels, the bag and the checkout.

| Category | Products |
| --- | --- |
| T-shirts | White Essential, Black Crest (front and back), Teal Pocket, Lucky Cat Print, Mustard Heavyweight |
| Pants | Black Slim Jean, Khaki Chino Jogger, Light Wash Straight Jean, Mid Blue Skinny Jean, Blush Cargo Jogger |
| Shoes | White Court Sneaker, Crimson Knit Runner, Cherry Canvas High-Top, Tan Canvas Court, Maroon Skate Low |
| Accessories | Black Wayfarer Sunglasses, Midnight Sport Watch, White Trucker Cap, Round Gold Sunglasses, Navy Day Backpack |

Product images are cut-outs (transparent WebP) in `assets/products`. Prices are NZD and include GST.

## Sections

1. Intro: product cut-outs float in, the wordmark rises, a counter reaches 100 and colour panels wipe away to reveal the store
2. Hero slideshow with a floating glass nav
3. Six Moods lookbook
4. Try the Look: four outfits. Tap one to see numbered hotspots placed on the actual items, linked to the piece list and "Add full look to bag"
5. Pick a Fit: a 3D card deck with all 20 products
6. The Rack: tees and pants hang on a rail, shoes and accessories sit on a shelf. Filter by category, tap a piece for sizes and Add to bag (the Black Crest Tee also has a back view)
7. Built for the block: product cards
8. Feel the fit: photo film between scrolling columns
9. Style, in motion: reels and a story viewer, each selling a product visible in the photo
10. The Signature Collection
11. Three pieces, one fit: pick any three tees or pants, watch them weave together, get 10% off
12. Footer with accepted payment methods; bag drawer with quantities, free-shipping progress and Afterpay pricing

## Checkout (`checkout.html`)

- NZ contact and delivery details (regions, 4-digit postcodes, NZ mobile numbers)
- Shipping: NZ Post standard (free over NZ$150, otherwise NZ$8), express courier NZ$15, Click & Collect free
- Payment: Apple Pay, Google Pay, Visa and Mastercard (number formatting, card-type detection, Luhn and expiry checks), Afterpay (4 payments, up to NZ$2,000), Klarna (pay in 4 or in 30 days), Gem Interest Free (6 months, orders over NZ$250)
- Discount codes `KORVA10` (10% off) and `KIAORA` (15% off), GST shown, order confirmation

**Test mode:** the checkout is a working front end only. No money is taken and card details never leave the browser. To take real payments, connect providers where `completeOrder` is called in `checkout.js`. For example, Stripe can handle cards, Apple Pay and Google Pay. Afterpay, Klarna and Gem each need their own merchant account. Then remove the test-mode banner.

## Files

- `index.html`, `styles.css`, `app.js`: the store
- `checkout.html`, `checkout.css`, `checkout.js`: the checkout
- `data.js`: products, looks, content and the shared bag (saved in the browser's local storage)
- `weave.js`: the fabric-weave canvas
- `assets/products`: product cut-outs; `assets/looks` and `assets/img`: photography from Unsplash (Unsplash License)

## Deploy

`.github/workflows/pages.yml` publishes the site to GitHub Pages on every push to `main`, or on demand from the Actions tab.
