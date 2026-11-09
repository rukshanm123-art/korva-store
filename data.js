/* KORVA — catalogue data. Images live in assets/img (Unsplash licence). */
window.CUR = '₹';
const IMG = (n) => `assets/img/${n}.jpg`;

window.PRODUCTS = {
  // T-shirts
  t1: { name: 'Ivory Essential Tee', cat: 'tees', price: 1890, img: IMG('p-tee-white') },
  t2: { name: 'Neko Print Tee', cat: 'tees', price: 2290, img: IMG('p-tee-print') },
  t3: { name: 'Midnight Script Tee', cat: 'tees', price: 2190, img: IMG('p-tee-black') },
  t4: { name: 'Studio Logo Tee', cat: 'tees', price: 2090, img: IMG('p-tee-hanger') },
  t5: { name: 'Chalk Heavyweight Tee', cat: 'tees', price: 2490, img: IMG('p-tee-grey') },
  t6: { name: 'Hotel Club Tee', cat: 'tees', price: 2390, img: IMG('p-tee-hotel') },
  // Pants
  pa1: { name: 'Desert Chino Jogger', cat: 'pants', price: 3490, img: IMG('p-chino') },
  pa2: { name: 'Indigo Selvedge Denim', cat: 'pants', price: 4890, img: IMG('p-jeans') },
  pa3: { name: 'Raw Black Straight', cat: 'pants', price: 4290, img: IMG('p-jeans-flat') },
  pa4: { name: 'Washed Denim Classic', cat: 'pants', price: 3990, img: IMG('p-denim-pile') },
  pa5: { name: 'Sage Track Pant', cat: 'pants', price: 2990, img: IMG('p-track') },
  pa6: { name: 'Blush Cargo Jogger', cat: 'pants', price: 3290, img: IMG('l-2') },
  // Shoes
  s1: { name: 'Crimson Knit Runner', cat: 'shoes', price: 7990, img: IMG('s-red') },
  s2: { name: 'Maroon Skate Low', cat: 'shoes', price: 4990, img: IMG('s-maroon') },
  s3: { name: 'Tan Court Classic', cat: 'shoes', price: 8490, img: IMG('s-tan') },
  s4: { name: 'Volt Trainer', cat: 'shoes', price: 6990, img: IMG('s-volt') },
  s5: { name: 'Cherry High-Top', cat: 'shoes', price: 4490, img: IMG('s-hightop') },
  s6: { name: 'Pastel Court Low', cat: 'shoes', price: 7490, img: IMG('s-pastel') },
  s7: { name: 'Olive Mesh Runner', cat: 'shoes', price: 6490, img: IMG('s-olive') },
  s8: { name: 'Sunset Low', cat: 'shoes', price: 5490, img: IMG('s-orange') },
  s9: { name: 'Coral Air Runner', cat: 'shoes', price: 8990, img: IMG('s-runner') },
  s10: { name: 'Cognac Derby', cat: 'shoes', price: 9490, img: IMG('s-derby') },
  s11: { name: 'White Court Sneaker', cat: 'shoes', price: 5990, img: IMG('s-court') },
  // Accessories
  a1: { name: 'Round Gold Shades', cat: 'acc', price: 2990, img: IMG('a-round') },
  a2: { name: 'Black Wayfarer', cat: 'acc', price: 3490, img: IMG('a-wayfarer') },
  a3: { name: 'Fawn Leather Watch', cat: 'acc', price: 6990, img: IMG('a-watch') },
  a4: { name: 'Arctic Smartwatch', cat: 'acc', price: 12990, img: IMG('a-smartwatch') },
  a5: { name: 'Chalk Trucker Cap', cat: 'acc', price: 1490, img: IMG('a-cap') },
  a6: { name: 'Navy Day Backpack', cat: 'acc', price: 4990, img: IMG('a-backpack') },
  a7: { name: 'Saddle Bifold Wallet', cat: 'acc', price: 2490, img: IMG('a-wallet') },
  a8: { name: 'Wicker Top-Handle', cat: 'acc', price: 5490, img: IMG('a-basket') },
  a9: { name: 'Gold Knot Studs', cat: 'acc', price: 1990, img: IMG('a-earrings') },
};

window.HERO = [
  { img: IMG('hero1'), eyebrow: 'T-SHIRTS · PANTS · SHOES · ACCESSORIES', title: 'Worn for the Streets.', text: 'KORVA brings the studio floor to your street: heavyweight cotton, honest denim and soles built to walk — cut in small batches and finished by hand.', main: true },
  { img: IMG('hero2'), eyebrow: '02 · THE COTTON', title: 'Cotton that holds its shape.', text: '240 GSM, garment-dyed, so the collar never lets go.' },
  { img: IMG('hero3'), eyebrow: '03 · THE DENIM', title: 'Denim that learns your stride.', text: 'Selvedge and rigid washes that break in, not down.' },
  { img: IMG('hero4'), eyebrow: '04 · THE SOLE', title: 'A sole for every step after.', text: 'Bought once, laced for years.' },
];

window.MOODS = [
  { name: 'Street Edit', img: IMG('m-street'), tint: '#f2c14e' },
  { name: 'Denim Days', img: IMG('m-denim'), tint: '#7fb3d5' },
  { name: 'Tailored Icons', img: IMG('m-tailored'), tint: '#c9a27e' },
  { name: 'Athleisure', img: IMG('m-athleisure'), tint: '#f5b041' },
  { name: 'Summer Shades', img: IMG('m-summer'), tint: '#48c9b0' },
  { name: 'Monochrome', img: IMG('m-mono'), tint: '#c0392b' },
];

window.LOOKS = [
  { name: 'Ivory Street', img: IMG('l-1'), pieces: ['a3', 't1', 'pa3', 's11'], spots: [[46, 44], [52, 30], [50, 62], [40, 90]] },
  { name: 'Blush Hour', img: IMG('l-2'), pieces: ['a8', 't5', 'pa6', 's6'], spots: [[30, 14], [50, 10], [48, 52], [52, 92]] },
  { name: 'Camel Studio', img: IMG('l-3'), pieces: ['a1', 't1', 'pa1', 's3'], spots: [[52, 14], [50, 34], [44, 62], [36, 92]] },
  { name: 'Neon Stripe', img: IMG('l-4'), pieces: ['a9', 't3', 'pa3', 's5'], spots: [[56, 16], [54, 34], [46, 64], [44, 92]] },
  { name: 'Peace Sign', img: IMG('l-5'), pieces: ['a5', 't3', 'pa5', 's11'], spots: [[50, 12], [50, 38], [50, 74], [52, 94]] },
  { name: 'Weekend White', img: IMG('l-6'), pieces: ['a5', 't1', 'pa2', 's9'], spots: [[50, 22], [50, 52], [46, 86], [50, 96]] },
  { name: 'Milan Blue', img: IMG('l-7'), pieces: ['a8', 't5', 'pa4', 's11'], spots: [[54, 30], [46, 40], [50, 66], [48, 92]] },
  { name: 'Arcade Rose', img: IMG('l-8'), pieces: ['a2', 't6', 'pa3', 's2'], spots: [[54, 20], [50, 42], [50, 70], [48, 94]] },
];

/* Pick a Fit — colourful tilt cards */
window.DECK = [
  { id: 's1', title: ['CRIMSON', 'RUNNER'], bg: '#e3121b' },
  { id: 't2', title: ['NEKO', 'PRINT'], bg: '#1f8ef1' },
  { id: 'pa2', title: ['INDIGO', 'DENIM'], bg: '#f39c12' },
  { id: 's4', title: ['VOLT', 'TRAINER'], bg: '#6c2bd9' },
  { id: 'a2', title: ['BLACK', 'WAYFARER'], bg: '#f5b800' },
  { id: 's2', title: ['MAROON', 'SKATE'], bg: '#10b3a3' },
  { id: 't1', title: ['IVORY', 'ESSENTIAL'], bg: '#e0144c' },
  { id: 'a5', title: ['TRUCKER', 'CAP'], bg: '#ff2d87' },
  { id: 's6', title: ['PASTEL', 'COURT'], bg: '#18c63a' },
  { id: 'a3', title: ['FAWN', 'WATCH'], bg: '#ff6a00' },
  { id: 'pa5', title: ['SAGE', 'TRACK'], bg: '#3b5bff' },
];

/* The Rack — drawn garments (see garments.js) */
window.RACK = [
  { cat: 'tees', type: 'tee', name: 'Ivory Essential Tee', price: 1890, c: '#f3ecdf', c2: '#d9cdb6', pat: 'solid' },
  { cat: 'tees', type: 'tee', name: 'Crimson Ringer Tee', price: 2090, c: '#c8102e', c2: '#f3ecdf', pat: 'ringer' },
  { cat: 'tees', type: 'tee', name: 'Midnight Graphic Tee', price: 2290, c: '#1c1d29', c2: '#f5b800', pat: 'graphic' },
  { cat: 'tees', type: 'tee', name: 'Breton Stripe Tee', price: 2190, c: '#f6f2ea', c2: '#1d3c8f', pat: 'stripe' },
  { cat: 'tees', type: 'tee', name: 'Mustard Pocket Tee', price: 1990, c: '#e2a523', c2: '#b9821a', pat: 'pocket' },
  { cat: 'tees', type: 'longsleeve', name: 'Forest Waffle Long-Sleeve', price: 2690, c: '#1f6f4a', c2: '#174f36', pat: 'solid' },
  { cat: 'tees', type: 'tee', name: 'Sky Madras Tee', price: 2390, c: '#7fc3f0', c2: '#ff6a8a', pat: 'check' },
  { cat: 'tees', type: 'longsleeve', name: 'Rani Pink Long-Sleeve', price: 2590, c: '#e0146c', c2: '#a50e50', pat: 'solid' },
  { cat: 'pants', type: 'pants', name: 'Indigo Selvedge Denim', price: 4890, c: '#27407a', c2: '#e39b3a', pat: 'denim' },
  { cat: 'pants', type: 'pants', name: 'Raw Black Straight', price: 4290, c: '#1d1f24', c2: '#5a5d66', pat: 'denim' },
  { cat: 'pants', type: 'pants', name: 'Desert Chino', price: 3490, c: '#cfb48a', c2: '#a88e63', pat: 'solid' },
  { cat: 'pants', type: 'cargo', name: 'Olive Camo Cargo', price: 3790, c: '#5f6b3a', c2: '#3c4426', pat: 'camo' },
  { cat: 'pants', type: 'jogger', name: 'Heather Grey Jogger', price: 2990, c: '#9aa0a8', c2: '#7d838b', pat: 'solid' },
  { cat: 'pants', type: 'shorts', name: 'Madras Check Shorts', price: 2490, c: '#f2c14e', c2: '#d0103a', pat: 'check' },
  { cat: 'shoes', type: 'sneaker', name: 'Crimson Court Low', price: 6990, c: '#d0103a', c2: '#ffffff', pat: 'solid' },
  { cat: 'shoes', type: 'sneaker', name: 'Chalk Everyday Sneaker', price: 5990, c: '#f4f4f0', c2: '#1f8ef1', pat: 'solid' },
  { cat: 'shoes', type: 'hightop', name: 'Night High-Top', price: 5490, c: '#1c1d29', c2: '#f4f4f0', pat: 'solid' },
  { cat: 'shoes', type: 'sneaker', name: 'Volt Runner', price: 6490, c: '#b6e62e', c2: '#1c1d29', pat: 'solid' },
  { cat: 'shoes', type: 'hightop', name: 'Mustard Canvas High', price: 4290, c: '#e2a523', c2: '#f4f4f0', pat: 'solid' },
  { cat: 'acc', type: 'cap', name: 'Navy Six-Panel Cap', price: 1490, c: '#1d3c8f', c2: '#f4f4f0', pat: 'solid' },
  { cat: 'acc', type: 'cap', name: 'Cherry Dad Cap', price: 1390, c: '#c8102e', c2: '#f4f4f0', pat: 'solid' },
  { cat: 'acc', type: 'tote', name: 'Canvas Market Tote', price: 1890, c: '#efe4cc', c2: '#c8102e', pat: 'stripe' },
  { cat: 'acc', type: 'beanie', name: 'Saffron Rib Beanie', price: 1290, c: '#f39c12', c2: '#c8102e', pat: 'solid' },
  { cat: 'acc', type: 'backpack', name: 'Teal Day Pack', price: 4590, c: '#10b3a3', c2: '#0b7e73', pat: 'solid' },
];
window.RACK_CATS = [
  { key: 'all', label: 'All pieces' },
  { key: 'tees', label: 'T-Shirts' },
  { key: 'pants', label: 'Pants' },
  { key: 'shoes', label: 'Shoes' },
  { key: 'acc', label: 'Accessories' },
];

/* Built for the block — dark product cards */
window.DEVOTE = [
  { cat: 'HEAVYWEIGHT TEE', name: 'Chalk Heavyweight', desc: 'Boxy 240 GSM cotton with a rib collar that keeps its shape.', price: 2490, img: IMG('x-hood') },
  { cat: 'RUNNER', name: 'Crimson Knit Runner', desc: 'A one-piece knit upper on a foam sole made for long days.', price: 7990, img: IMG('s-red') },
  { cat: 'SELVEDGE DENIM', name: 'Indigo Selvedge', desc: 'Rigid 13oz denim that fades to your own story.', price: 4890, img: IMG('p-jeans') },
  { cat: 'STATEMENT TEE', name: 'Neon Street Tee', desc: 'Screen-printed by hand, cut long for layering.', price: 2290, img: IMG('m-street') },
  { cat: 'COURT SHOE', name: 'Tan Court Classic', desc: 'Nubuck upper, gum-tone stitching, built to crease well.', price: 8490, img: IMG('s-tan') },
  { cat: 'EYEWEAR', name: 'Round Gold Shades', desc: 'Thin gold wire, smoke lenses, made for golden hour.', price: 2990, img: IMG('a-round') },
  { cat: 'CHINO JOGGER', name: 'Desert Chino', desc: 'Garment-washed twill with a tapered, cuffed leg.', price: 3490, img: IMG('p-chino') },
  { cat: 'TIMEPIECE', name: 'Fawn Leather Watch', desc: 'A quiet dial on a strap that softens with every wear.', price: 6990, img: IMG('a-watch') },
  { cat: 'SKATE SHOE', name: 'Maroon Skate Low', desc: 'Suede and canvas on a waffle sole that grips.', price: 4990, img: IMG('s-maroon') },
  { cat: 'BACKPACK', name: 'Navy Day Pack', desc: 'Water-resistant canvas with room for the whole day.', price: 4990, img: IMG('a-backpack') },
];

window.FILM = [IMG('x-yellow'), IMG('m-street'), IMG('x-hood'), IMG('x-circle'), IMG('m-summer'), IMG('x-shopper')];
window.FEEL_L = [IMG('m-denim'), IMG('l-4'), IMG('x-beach'), IMG('l-7'), IMG('x-smile'), IMG('s-hightop')];
window.FEEL_R = [IMG('m-mono'), IMG('l-8'), IMG('x-suit2'), IMG('m-athleisure'), IMG('x-flatlay'), IMG('a-wayfarer')];

window.REELS = [
  { name: 'Neon Stripe', cat: 'WIDE-LEG TROUSER', place: 'Mint wall, Old Town', desc: 'Black and white stripes that walk louder than you do.', price: 4290, img: IMG('l-4'), dur: '0:22', tint: '#0f6b5c' },
  { name: 'Red Letter', cat: 'GRAPHIC TEE', place: 'Teal alley, Midtown', desc: 'A red graphic tee under a long black coat — loud and quiet at once.', price: 2290, img: IMG('m-street'), dur: '0:18', tint: '#7a0f1a' },
  { name: 'Blue Hour', cat: 'HOODED DENIM', place: 'Harbour steps', desc: 'Washed denim over a soft grey hood, made for cold mornings.', price: 5490, img: IMG('x-hood'), dur: '0:31', tint: '#13405e' },
  { name: 'Mono Rooftop', cat: 'LEATHER & BLACK', place: 'Brick rooftop', desc: 'Black on black, a leather layer and nowhere to be.', price: 9990, img: IMG('m-mono'), dur: '0:16', tint: '#5a2318' },
  { name: 'Sunny Side', cat: 'SUMMER SHADES', place: 'Yellow wall, Market Rd', desc: 'Round frames and a warm wall at noon.', price: 2990, img: IMG('x-yellow'), dur: '0:24', tint: '#8a6a00' },
  { name: 'Full Circle', cat: 'UTILITY LAYER', place: 'The round window', desc: 'Ochre chinos, a dark jacket, white sneakers.', price: 6890, img: IMG('x-circle'), dur: '0:19', tint: '#6b4a2b' },
  { name: 'Easy Smile', cat: 'RINGER TEE', place: 'Studio, Grey Room', desc: 'A navy ringer tee and the easiest denim.', price: 2090, img: IMG('x-smile'), dur: '0:14', tint: '#2a2e3a' },
];

window.SIGNATURE = [
  { name: 'Midnight Two-Piece', sub: 'Wool blend · Peak lapel', price: 18990, img: IMG('x-suit') },
  { name: 'Cobalt Commuter', sub: 'Stretch suiting · Slim cut', price: 15990, img: IMG('m-tailored') },
  { name: 'Ivory Poplin & Tie', sub: 'Cotton poplin · Silk tie', price: 5490, img: IMG('x-shirt') },
  { name: 'Charcoal Night Suit', sub: 'Wool · Double vent', price: 19990, img: IMG('x-suit2') },
  { name: 'Camel Overcoat', sub: 'Brushed wool · Relaxed', price: 14990, img: IMG('l-3') },
  { name: 'After-Hours Blazer', sub: 'Matte twill · Unlined', price: 11990, img: IMG('x-watchwrist') },
  { name: 'Powder Trench', sub: 'Gabardine · Belted', price: 13490, img: IMG('l-7') },
];

/* Three pieces, one fit — fabrics */
window.FABRICS = [
  { name: 'Madras Check Shorts', price: 2490, kind: 'plaid', cols: ['#f2c14e', '#d0103a', '#1d3c8f', '#1f9e5a'] },
  { name: 'Indigo Selvedge Denim', price: 4890, kind: 'denim', cols: ['#1f3a7a', '#3557a6'] },
  { name: 'Ivory Logo Tee', price: 1890, kind: 'print', cols: ['#f3ecdf', '#d98a2b'] },
  { name: 'Desert Chino', price: 3490, kind: 'twill', cols: ['#cfb48a', '#a88e63'] },
  { name: 'Rani Pink Track Pant', price: 2990, kind: 'stripe', cols: ['#e0146c', '#f5b800', '#ffffff'] },
  { name: 'Mustard Pocket Tee', price: 1990, kind: 'twill', cols: ['#e2a523', '#b9821a'] },
  { name: 'Saffron Stripe Tee', price: 2190, kind: 'stripe', cols: ['#f39c12', '#c8102e', '#f3ecdf'] },
  { name: 'Olive Camo Cargo', price: 3790, kind: 'camo', cols: ['#5f6b3a', '#3c4426', '#8a8f55', '#2a2d1c'] },
  { name: 'Sunset Madras Shirt', price: 2690, kind: 'plaid', cols: ['#e0146c', '#1f9e5a', '#f39c12', '#6c2bd9'] },
];

window.TICKER = [
  ['TRY THE LOOK', 'Eight looks, styled head to toe'],
  ['PURE COTTON', '240 GSM cotton cut and sewn in small batches'],
  ['THE RACK', 'Browse the full rail of tees, pants, shoes and accessories'],
  ['SIGNATURE', 'Tailored pieces for the night that matters'],
  ['THE STUDIO', 'Designed in our studio, finished by hand, one drop at a time'],
];
