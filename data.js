/* KORVA — catalogue and content. Everything on the site and the checkout reads from here.
   Prices are in New Zealand dollars, GST inclusive. */
window.CURRENCY = 'NZD';
const PROD = (n) => `assets/products/${n}.webp`;
const IMG = (n) => `assets/img/${n}.jpg`;
const LOOK = (n) => `assets/looks/${n}.jpg`;

/* 20 products: 5 per category. `rail` items hang on the rack, the rest sit on its shelf.
   `hanger: true` means the photo has no hanger of its own, so the rack draws one. */
window.PRODUCTS = {
  // AFTERHOURS — Drop 001 (listed first so it leads the rack)
  ah1: { name: 'Eclipse Box Tee', cat: 'tees', price: 89, img: PROD('ah1'), color: '#2a2a2e', rail: true, hanger: true, drop: true, sku: 'KORVA-AH-001', desc: 'A boxy, oversized tee in washed charcoal. Acid-yellow eclipse artwork brings the energy; a small KORVA chest mark keeps it grounded.' },
  ah2: { name: 'Nightshift Cargo', cat: 'pants', price: 179, img: PROD('ah2'), color: '#151518', rail: true, hanger: true, drop: true, sku: 'KORVA-AH-002', desc: 'A wide-leg cargo with sculpted utility pockets, hanging straps and a sharp acid-yellow signature tab.' },
  ah3: { name: 'Chrome Crescent', cat: 'acc', price: 119, img: PROD('ah3'), color: '#b9bcc4', drop: true, sku: 'KORVA-AH-003', desc: 'A curved crossbody in liquid silver with a bold black strap and an acid-yellow KORVA tab.' },
  ah4: { name: 'Last Light Cap', cat: 'acc', price: 49, img: PROD('ah4'), color: '#2b2b2f', drop: true, sku: 'KORVA-AH-004', desc: 'A washed-black six-panel cap with acid-yellow KORVA embroidery. Low-key from a distance, recognisable up close.' },
  // T-shirts
  t1: { name: 'White Essential Tee', cat: 'tees', price: 49, img: PROD('t1'), color: '#f1f1f1', rail: true, desc: '200 GSM combed cotton with a clean crew neck. The everyday white tee.' },
  t2: { name: 'Black Crest Tee', cat: 'tees', price: 59, img: PROD('t2'), back: PROD('t2-back'), color: '#16161a', rail: true, desc: 'Heavyweight black cotton, small crest on the chest and a large print on the back.' },
  t3: { name: 'Teal Pocket Tee', cat: 'tees', price: 55, img: PROD('t3'), color: '#1f7f7a', rail: true, hanger: true, desc: 'Garment-dyed teal with a chest pocket and a woven tab.' },
  t4: { name: 'Lucky Cat Print Tee', cat: 'tees', price: 65, img: PROD('t4'), color: '#e9e1d2', rail: true, hanger: true, desc: 'Bone cotton with a cobalt screen print, cut slightly boxy.' },
  t5: { name: 'Mustard Heavyweight Tee', cat: 'tees', price: 52, img: PROD('t5'), color: '#d4a915', rail: false, desc: '240 GSM cotton that holds its shape, folded and ready to go.' },
  // Pants
  p1: { name: 'Black Slim Jean', cat: 'pants', price: 119, img: PROD('p1'), color: '#1d2230', rail: true, hanger: true, desc: 'Stretch denim in a slim, straight leg. Washed black.' },
  p2: { name: 'Khaki Chino Jogger', cat: 'pants', price: 99, img: PROD('p2'), color: '#b49b6c', rail: true, hanger: true, desc: 'Soft cotton twill with a tapered, cuffed leg.' },
  p3: { name: 'Light Wash Straight Jean', cat: 'pants', price: 129, img: PROD('p3'), color: '#9fc1dc', rail: true, desc: 'Rigid 12oz denim, bleached light, with a relaxed straight leg.' },
  p4: { name: 'Mid Blue Skinny Jean', cat: 'pants', price: 115, img: PROD('p4'), color: '#4f7bb0', rail: true, hanger: true, desc: 'A close-fitting jean in faded mid blue with whiskered thighs.' },
  p5: { name: 'Blush Cargo Jogger', cat: 'pants', price: 95, img: PROD('p5'), color: '#e6b3a3', rail: true, hanger: true, desc: 'Lightweight cargo jogger with an elastic waist and cuffs.' },
  // Shoes
  s1: { name: 'White Court Sneaker', cat: 'shoes', price: 159, img: PROD('s1'), color: '#f3f3f0', desc: 'Perforated leather upper on a cupsole. Goes with everything.' },
  s2: { name: 'Crimson Knit Runner', cat: 'shoes', price: 219, img: PROD('s2'), color: '#c8202b', desc: 'One-piece knit upper on a soft, flexible foam sole.' },
  s3: { name: 'Cherry Canvas High-Top', cat: 'shoes', price: 119, img: PROD('s3'), color: '#b3192e', desc: 'Classic canvas high-top with a rubber toe cap.' },
  s4: { name: 'Tan Canvas Court', cat: 'shoes', price: 229, img: PROD('s4'), color: '#b47a3c', desc: 'Duck canvas and wool in tan, on a chunky court sole.' },
  s5: { name: 'Maroon Skate Low', cat: 'shoes', price: 129, img: PROD('s5'), color: '#6e1b2c', desc: 'Suede and canvas skate shoe on a grippy waffle sole.' },
  // Accessories
  a1: { name: 'Black Wayfarer Sunglasses', cat: 'acc', price: 189, img: PROD('a1'), color: '#141414', desc: 'Polarised lenses in a glossy black acetate frame.' },
  a2: { name: 'Midnight Sport Watch', cat: 'acc', price: 399, img: PROD('a2'), color: '#2a2a2e', desc: 'A black smart sport watch with a soft-touch band.' },
  a3: { name: 'White Trucker Cap', cat: 'acc', price: 45, img: PROD('a3'), color: '#efefef', desc: 'Foam front, mesh back, snap closure.' },
  a4: { name: 'Round Gold Sunglasses', cat: 'acc', price: 169, img: PROD('a4'), color: '#c9a050', desc: 'Thin gold wire frame with green-grey lenses.' },
  a5: { name: 'Navy Day Backpack', cat: 'acc', price: 139, img: PROD('a5'), color: '#26324f', desc: 'Water-resistant canvas, padded laptop sleeve, room for the day.' },
};
window.CATS = [
  { key: 'all', label: 'All pieces' },
  { key: 'tees', label: 'T-Shirts' },
  { key: 'pants', label: 'Pants' },
  { key: 'shoes', label: 'Shoes' },
  { key: 'acc', label: 'Accessories' },
];
window.CAT_LABEL = { tees: 'T-SHIRT', pants: 'PANTS', shoes: 'SHOES', acc: 'ACCESSORY' };
window.SIZES = { tees: ['S', 'M', 'L', 'XL'], pants: ['28', '30', '32', '34', '36'], shoes: ['US 7', 'US 8', 'US 9', 'US 10', 'US 11'], acc: ['One size'] };

window.HERO = [
  { img: IMG('afterhours'), eyebrow: 'NEW · AFTERHOURS DROP 001', title: 'Good taste. Bad hours.', text: 'For the hours that are yours. Four pieces for the last train and the long way home: oversized black, a hit of acid yellow and a flash of silver.', main: true, drop: true },
  { img: IMG('hero1'), eyebrow: '02 · T-SHIRTS · PANTS · SHOES · ACCESSORIES', title: 'Worn for the Streets.', text: 'Heavyweight tees, honest denim and sneakers built to walk. Shipped free across New Zealand on orders over $150.' },
  { img: IMG('hero2'), eyebrow: '03 · THE TEES', title: 'Cotton that holds its shape.', text: 'From the White Essential to the Lucky Cat print.' },
  { img: IMG('hero3'), eyebrow: '04 · THE DENIM', title: 'Denim that learns your stride.', text: 'Slim black, light wash straight and mid blue skinny.' },
  { img: IMG('hero4'), eyebrow: '05 · THE SOLES', title: 'A sneaker for every step.', text: 'Court, runner, high-top and skate. Laced for years.' },
];

window.MOODS = [
  { name: 'Street Edit', img: IMG('m-street') },
  { name: 'Denim Days', img: IMG('m-denim') },
  { name: 'Smart Casual', img: IMG('m-tailored') },
  { name: 'Athleisure', img: IMG('m-athleisure') },
  { name: 'Summer Shades', img: IMG('m-summer') },
  { name: 'Monochrome', img: IMG('m-mono') },
];

/* Try the Look. Spot coordinates are percentages of the photo (x from the left, y from the top),
   placed on the actual item, and listed in the same order as `pieces`. */
window.LOOKS = [
  { name: 'City Walk', img: LOOK('city'), pieces: ['a1', 't1', 'p1', 's1'], spots: [[49, 20], [49, 40], [46, 62], [52, 84]] },
  { name: 'Khaki Day', img: LOOK('khaki'), pieces: ['t1', 'p2', 's1'], spots: [[45, 21], [39, 50], [43, 88]] },
  { name: 'Blackout', img: LOOK('black'), pieces: ['a1', 't2', 'a2', 'p1'], spots: [[64, 15], [52, 46], [82, 81], [55, 95]] },
  { name: 'Weekend White', img: LOOK('white'), pieces: ['a3', 't1', 'a2', 'p1'], spots: [[70, 11], [52, 50], [88, 82], [38, 94]] },
];

/* Pick a Fit — tilt cards (every product appears once). */
window.DECK = [
  { id: 'ah1', title: ['ECLIPSE', 'BOX TEE'], bg: '#1c1c21' },
  { id: 'ah2', title: ['NIGHT', 'SHIFT'], bg: '#d7ff1f' },
  { id: 'ah3', title: ['CHROME', 'CRESCENT'], bg: '#c7cad1' },
  { id: 'ah4', title: ['LAST', 'LIGHT'], bg: '#2b2b31' },
  { id: 's2', title: ['CRIMSON', 'RUNNER'], bg: '#ff5a36' },
  { id: 't4', title: ['LUCKY', 'CAT TEE'], bg: '#3a2cff' },
  { id: 'p3', title: ['LIGHT', 'WASH'], bg: '#ffc93c' },
  { id: 'a1', title: ['BLACK', 'WAYFARER'], bg: '#c6ff3d' },
  { id: 't3', title: ['TEAL', 'POCKET'], bg: '#ff4fa3' },
  { id: 's5', title: ['MAROON', 'SKATE'], bg: '#4cc9ff' },
  { id: 'p2', title: ['KHAKI', 'JOGGER'], bg: '#7b2cff' },
  { id: 'a2', title: ['SPORT', 'WATCH'], bg: '#ff8a1f' },
  { id: 't2', title: ['BLACK', 'CREST'], bg: '#3ce6b0' },
  { id: 's3', title: ['CHERRY', 'HIGH-TOP'], bg: '#1a1a24' },
  { id: 'p5', title: ['BLUSH', 'CARGO'], bg: '#2f6bff' },
  { id: 'a3', title: ['TRUCKER', 'CAP'], bg: '#ff5a36' },
  { id: 't1', title: ['WHITE', 'ESSENTIAL'], bg: '#9b3cff' },
  { id: 's1', title: ['WHITE', 'COURT'], bg: '#ffc93c' },
  { id: 'p1', title: ['BLACK', 'SLIM'], bg: '#c6ff3d' },
  { id: 'a4', title: ['ROUND', 'GOLD'], bg: '#ff4fa3' },
  { id: 't5', title: ['MUSTARD', 'HEAVY'], bg: '#3a2cff' },
  { id: 's4', title: ['TAN', 'COURT'], bg: '#3ce6b0' },
  { id: 'p4', title: ['MID BLUE', 'SKINNY'], bg: '#ff8a1f' },
  { id: 'a5', title: ['NAVY', 'DAY PACK'], bg: '#7b2cff' },
];

/* Built for the block — product cards */
window.DEVOTE = ['ah1', 'ah3', 't2', 's2', 'p3', 'a1', 't4', 's4', 'p2', 'a2', 's5', 'a5'];

/* Feel the fit */
window.FILM = [LOOK('city'), IMG('m-street'), LOOK('white'), IMG('x-circle'), LOOK('tan'), IMG('m-summer')];
window.FEEL_L = [IMG('m-denim'), LOOK('khaki'), IMG('x-beach'), LOOK('black'), IMG('x-smile')];
window.FEEL_R = [IMG('m-mono'), LOOK('white'), IMG('m-athleisure'), LOOK('city'), IMG('x-yellow')];

/* Reels — each one features a product from the catalogue that is visible in the photo. */
window.REELS = [
  { name: 'City Walk', id: 't1', place: 'Bridge crossing, Wellington', img: LOOK('city'), dur: '0:22', tint: '#24305e' },
  { name: 'Khaki Day', id: 'p2', place: 'Park path, Auckland', img: LOOK('khaki'), dur: '0:18', tint: '#5a4a1e' },
  { name: 'Blackout', id: 't2', place: 'Old warehouse, Christchurch', img: LOOK('black'), dur: '0:31', tint: '#1a2d48' },
  { name: 'Weekend White', id: 'a3', place: 'Back garden, Hamilton', img: LOOK('white'), dur: '0:16', tint: '#1d4a2c' },
  { name: 'Desert Layer', id: 'p4', place: 'Terrace, Queenstown', img: LOOK('tan'), dur: '0:24', tint: '#6b3f1e' },
  { name: 'Full Circle', id: 's1', place: 'The round window, Dunedin', img: IMG('x-circle'), dur: '0:19', tint: '#3d4f6a' },
];

/* The Signature Collection — best sellers across every category */
window.SIGNATURE = [
  { id: 'ah1', tint: '#f3ffc2' }, { id: 's1', tint: '#e8e4ff' }, { id: 't2', tint: '#d9ffe9' }, { id: 'p3', tint: '#ffe9d6' },
  { id: 'a2', tint: '#e0f3ff' }, { id: 't4', tint: '#ffe1ee' }, { id: 's2', tint: '#f4ffd1' }, { id: 'a5', tint: '#efe6ff' },
];

/* Three pieces, one fit — each swatch is a tee or pant from the catalogue */
window.FABRICS = [
  { id: 't1', kind: 'jersey', cols: ['#f4f4f2', '#e2e2de'] },
  { id: 't2', kind: 'jersey', cols: ['#1a1a1f', '#2c2c33'] },
  { id: 't3', kind: 'jersey', cols: ['#1f7f7a', '#186661'] },
  { id: 't4', kind: 'print', cols: ['#ece5d6', '#2342b8'] },
  { id: 't5', kind: 'jersey', cols: ['#d4a915', '#b88f0c'] },
  { id: 'p1', kind: 'denim', cols: ['#1d2230', '#3a4256'] },
  { id: 'p2', kind: 'twill', cols: ['#b49b6c', '#957f55'] },
  { id: 'p3', kind: 'denim', cols: ['#9fc1dc', '#c6dbea'] },
  { id: 'p4', kind: 'denim', cols: ['#4f7bb0', '#7099c8'] },
  { id: 'p5', kind: 'twill', cols: ['#e6b3a3', '#d39b8a'] },
];

window.TICKER = [
  ['NEW DROP', 'AFTERHOURS 001: Eclipse Box Tee, Nightshift Cargo, Chrome Crescent, Last Light Cap'],
  ['FREE SHIPPING', 'Free NZ delivery on orders over $150'],
  ['TRY THE LOOK', 'Four looks, styled head to toe'],
  ['PAY YOUR WAY', 'Apple Pay, Google Pay, Visa, Mastercard, Afterpay, Klarna and Gem'],
  ['THE RACK', '24 pieces: tees, pants, shoes and accessories'],
  ['EASY RETURNS', '30-day returns across New Zealand'],
];

/* The AFTERHOURS drop section */
window.DROP = { name: 'AFTERHOURS', no: 'Drop 001', line: 'Good taste. Bad hours.', tag: 'For the hours that are yours.', img: IMG('afterhours'), ids: ['ah1', 'ah2', 'ah3', 'ah4'] };

/* Shared helpers used by the store and the checkout */
window.fmtNZD = (n, cents) => 'NZ$' + Number(n).toLocaleString('en-NZ', { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 });
window.Bag = (function () {
  const KEY = 'korva-bag-v1';
  let items = [];
  try { items = JSON.parse(localStorage.getItem(KEY) || '[]').filter((i) => window.PRODUCTS[i.id]); } catch (e) { items = []; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { /* storage unavailable */ } };
  const line = (i) => { const p = window.PRODUCTS[i.id]; const unit = Math.round(p.price * (1 - (i.disc || 0)) * 100) / 100; return { ...i, p, unit, total: unit * i.qty }; };
  return {
    items: () => items.map(line),
    count: () => items.reduce((a, i) => a + i.qty, 0),
    subtotal: () => items.map(line).reduce((a, l) => a + l.total, 0),
    add(id, size, disc = 0) {
      const sz = window.SIZES[window.PRODUCTS[id].cat];
      size = size || sz[Math.min(1, sz.length - 1)];
      const ex = items.find((i) => i.id === id && i.size === size && (i.disc || 0) === disc);
      if (ex) ex.qty++; else items.push({ id, size, qty: 1, disc });
      save();
    },
    setQty(k, q) { if (q <= 0) items.splice(k, 1); else items[k].qty = q; save(); },
    clear() { items = []; save(); },
  };
})();
