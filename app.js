/* =====================================================================
   KORVA / AFTERHOURS — storefront interactions
   ===================================================================== */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const P = window.PRODUCTS;
  const money = (n) => window.fmtNZD(n);
  const wrap = (v, n) => ((v % n) + n) % n;
  const nearest = (o, n) => { o = wrap(o, n); return o > n / 2 ? o - n : o; };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FREE_SHIP = 150;
  const thumb = (p) => `<span class="thumb"><img src="${p.img}" alt="" loading="lazy"></span>`;
  const isLight = (hex) => { const n = parseInt(hex.slice(1), 16); const r = n >> 16, g = (n >> 8) & 255, b = n & 255; return (r * 299 + g * 587 + b * 114) / 1000 > 150; };
  const flash = (el) => { if (!el || reduce) return; el.classList.remove('go'); void el.offsetWidth; el.classList.add('go'); };

  /* ------------------------------------------------------------------ smooth scroll */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new window.Lenis({ lerp: 0.085 });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    lenis.stop();
  }
  const scrollToEl = (el) => { if (!el) return; if (lenis) lenis.scrollTo(el, { offset: el.id === 'home' ? 0 : -20, duration: 1.6 }); else el.scrollIntoView({ behavior: 'smooth' }); };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    const el = document.getElementById(a.getAttribute('href').slice(1)); if (!el) return;
    e.preventDefault(); $('#nav').classList.remove('is-menu'); openDrawer(false); scrollToEl(el);
  });
  const lockScroll = (on) => { document.body.classList.toggle('is-locked', on); if (lenis) on ? lenis.stop() : lenis.start(); };

  /* ------------------------------------------------------------------ split text */
  function splitInto(el) {
    const nodes = [...el.childNodes]; el.textContent = '';
    nodes.forEach((n) => {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach((w) => {
          if (!w) return;
          if (/^\s+$/.test(w)) { el.appendChild(document.createTextNode(' ')); return; }
          const ws = document.createElement('span'); ws.className = 'w';
          [...w].forEach((c) => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; ws.appendChild(s); });
          el.appendChild(ws);
        });
      } else if (n.nodeType === 1 && n.tagName === 'BR') el.appendChild(n);
      else if (n.nodeType === 1) { splitInto(n); el.appendChild(n); }
    });
  }
  $$('[data-split]').forEach((el) => { splitInto(el); $$('.ch', el).forEach((c, i) => { c.style.transitionDelay = (i * 0.02) + 's'; }); });
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); revealIO.unobserve(e.target); } });
  }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });

  /* ------------------------------------------------------------------ NZ clocks */
  const nzTime = (secs) => new Intl.DateTimeFormat('en-NZ', { timeZone: 'Pacific/Auckland', hour: '2-digit', minute: '2-digit', second: secs ? '2-digit' : undefined, hour12: false }).format(new Date());
  function tickClocks() { $('#navClock').textContent = `AKL ${nzTime(false)}`; $('#footClock').textContent = nzTime(true); }
  tickClocks(); setInterval(tickClocks, 1000);

  /* ------------------------------------------------------------------ bag */
  const bagBtn = $('#bagBtn');
  function toast(html) {
    const t = $('#toast'); t.innerHTML = html; t.classList.add('is-on');
    clearTimeout(toast.tm); toast.tm = setTimeout(() => t.classList.remove('is-on'), 2400);
  }
  function fly(fromEl, src) {
    if (!fromEl || reduce || !src) return;
    const r = fromEl.getBoundingClientRect(), b = bagBtn.getBoundingClientRect();
    const im = document.createElement('img'); im.className = 'flyer'; im.src = src;
    const s = Math.min(110, Math.max(60, r.width * 0.6));
    Object.assign(im.style, { left: (r.left + r.width / 2 - s / 2) + 'px', top: (r.top + r.height / 2 - s / 2) + 'px', width: s + 'px', height: s + 'px' });
    document.body.appendChild(im);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      im.style.transform = `translate(${b.left + b.width / 2 - (r.left + r.width / 2)}px, ${b.top + b.height / 2 - (r.top + r.height / 2)}px) scale(.18) rotate(25deg)`;
      im.style.opacity = '.5';
    }));
    setTimeout(() => im.remove(), 950);
  }
  function syncCounts(bump) {
    const n = window.Bag.count(), c = $('#bagCount');
    c.textContent = n; c.classList.toggle('is-zero', !n); $('#viewCartCount').textContent = n;
    if (bump) { c.classList.add('bump'); setTimeout(() => c.classList.remove('bump'), 300); }
  }
  function addToBag(id, fromEl, opts = {}) {
    window.Bag.add(id, opts.size, opts.disc || 0);
    fly(fromEl, P[id].img);
    setTimeout(() => syncCounts(true), reduce ? 0 : 800);
    if (!opts.quiet) toast(`<b>${P[id].name}</b> added · ${money(P[id].price * (1 - (opts.disc || 0)))}`);
    renderDrawer();
  }
  function renderDrawer() {
    const ul = $('#drawerList'), lines = window.Bag.items();
    ul.innerHTML = lines.length ? '' : '<li class="drawer__empty">Nothing here yet. The night is young.</li>';
    lines.forEach((l, k) => {
      const li = document.createElement('li');
      li.innerHTML = `${thumb(l.p)}<div><b>${l.p.name}</b><small>${l.size}${l.disc ? ' · Capsule −10%' : ''}</small><span class="qty"><button data-d="-1" aria-label="Less">−</button><span>${l.qty}</span><button data-d="1" aria-label="More">+</button></span></div><div class="drawer__line">${window.fmtNZD(l.total, true)}</div>`;
      $$('.qty button', li).forEach((b) => (b.onclick = () => { window.Bag.setQty(k, l.qty + +b.dataset.d); syncCounts(); renderDrawer(); }));
      ul.appendChild(li);
    });
    const sub = window.Bag.subtotal();
    $('#drawerTotal').textContent = window.fmtNZD(sub, true);
    const left = Math.max(0, FREE_SHIP - sub);
    $('#drawerShip').innerHTML = (left > 0 ? `Add <b>${window.fmtNZD(left, true)}</b> for free NZ shipping` : '<b>Free NZ shipping</b> unlocked') + `<i><b style="width:${Math.min(100, (sub / FREE_SHIP) * 100)}%"></b></i>`;
    $('#drawerAfterpay').innerHTML = sub ? `or 4 interest-free payments of <b>${window.fmtNZD(sub / 4, true)}</b> with Afterpay` : '';
  }
  renderDrawer(); syncCounts();
  function openDrawer(on) { if ($('#drawer').classList.contains('is-open') === on) return; $('#drawer').classList.toggle('is-open', on); lockScroll(on); }
  bagBtn.onclick = () => openDrawer(true);
  $('#viewCart').onclick = () => openDrawer(true);
  $$('#drawer [data-close]').forEach((b) => (b.onclick = () => openDrawer(false)));

  /* ------------------------------------------------------------------ nav */
  const nav = $('#nav');
  $('#burger').onclick = () => nav.classList.toggle('is-menu');
  const sections = $$('[data-section]');
  function updateActive() {
    const y = window.innerHeight * 0.4; let key = 'home';
    sections.forEach((s) => { if (s.getBoundingClientRect().top <= y) key = s.dataset.section || s.id; });
    $$('#navLinks a').forEach((a) => a.classList.toggle('is-active', a.dataset.sec === key));
  }

  /* ------------------------------------------------------------------ intro: the night shift */
  const intro = $('#intro'), shots = $$('#introShots img');
  let introDone = false;
  const INTRO_MS = reduce ? 200 : 2600, CLOCK_FROM = 23 * 3600 + 57 * 60;
  const t0 = performance.now();
  const pad = (n) => String(n).padStart(2, '0');
  const flashAt = [0.1, 0.32, 0.54, 0.76]; let flashed = 0;
  setTimeout(() => $('#introWord').classList.add('is-in'), 150);
  (function run(now) {
    if (introDone) return;
    const p = Math.min(1, (now - t0) / INTRO_MS);
    const secs = Math.round(CLOCK_FROM + p * 180);
    const h = Math.floor(secs / 3600) % 24, m = Math.floor(secs / 60) % 60, s = secs % 60;
    $('#introClock').textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
    if (flashed < flashAt.length && p >= flashAt[flashed]) {
      flash($('#introFlash'));
      shots.forEach((im, k) => { im.classList.toggle('is-on', k === flashed); im.classList.toggle('is-past', k < flashed); });
      flashed++;
    }
    if (p < 1) requestAnimationFrame(run);
    else {
      $('#introClock').textContent = '00:00:00';
      flash($('#introFlash'));
      shots.forEach((im) => { im.classList.remove('is-on'); im.classList.add('is-past'); });
      $('#introWord').classList.add('is-lit'); $('#introLine').classList.add('is-in');
      setTimeout(openIntro, 750);
    }
  })(t0);
  function openIntro() {
    if (introDone) return; introDone = true;
    intro.classList.add('is-open');
    setTimeout(() => { document.body.classList.remove('is-intro'); if (lenis) lenis.start(); startHero(); }, 560);
    setTimeout(() => intro.classList.add('is-gone'), 1500);
  }
  $('#introSkip').onclick = openIntro;
  window.addEventListener('wheel', () => { if (performance.now() - t0 > 900) openIntro(); }, { passive: true });

  /* ------------------------------------------------------------------ hero */
  const H = window.HERO, slidesEl = $('#heroSlides'), contentEl = $('#heroContent'), barsEl = $('#heroBars');
  const HERO_MS = 6500; let hi = 0, heroTimer = null;
  $('#heroTotal').textContent = pad(H.length);
  H.forEach((s, i) => {
    slidesEl.insertAdjacentHTML('beforeend', `<div class="hero__slide${i ? '' : ' is-on'}${s.drop ? ' is-drop' : ''}"><img src="${s.img}" alt="" ${i ? 'loading="lazy"' : ''}></div>`);
    const b = document.createElement('div'); b.className = 'hero__bar'; b.innerHTML = '<i></i>';
    b.style.setProperty('--dur', HERO_MS + 'ms'); b.onclick = () => showHero(i); barsEl.appendChild(b);
  });
  const ARROW = '<span class="pill__dot"><svg viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8"/></svg></span>';
  function showHero(i) {
    hi = wrap(i, H.length);
    $('#heroIndex').textContent = pad(hi + 1);
    $$('.hero__slide', slidesEl).forEach((s, k) => s.classList.toggle('is-on', k === hi));
    $$('.hero__bar', barsEl).forEach((b, k) => { b.classList.remove('is-on'); b.classList.toggle('is-done', k < hi); void b.offsetWidth; if (k === hi) b.classList.add('is-on'); });
    const s = H[hi];
    let n = 0, second = false;
    const words = s.title.split(' ').map((w, wi, arr) => {
      const html = `<span class="w${second ? ' is-acid' : ''}" style="display:inline-block;white-space:nowrap">${[...w].map((c) => `<span class="ch" style="animation-delay:${(n++ * 0.03).toFixed(2)}s">${c}</span>`).join('')}</span>`;
      const brk = !second && /\.$/.test(w) && wi < arr.length - 1;
      if (brk) second = true;
      return html + (brk ? '<br>' : '');
    }).join(' ');
    contentEl.innerHTML = (s.main ? `<div class="hero__chip">${s.eyebrow}</div>` : `<div class="hero__eyebrow">${s.eyebrow}</div>`) +
      `<h1 class="hero__title">${words}</h1><p class="hero__text">${s.text}</p>` +
      (s.drop ? `<div class="hero__cta"><a class="pill pill--acid" href="#drop">Shop the drop ${ARROW}</a><a class="pill pill--ghost" href="#rack">Browse the Rack ${ARROW}</a></div>` : `<div class="hero__cta"><a class="pill pill--ghost" href="#look">Try the Look ${ARROW}</a></div>`);
    clearTimeout(heroTimer); heroTimer = setTimeout(() => showHero(hi + 1), HERO_MS);
  }
  function startHero() { showHero(0); }

  /* ------------------------------------------------------------------ ribbon + ticker */
  const rib = ['Good taste', 'Bad hours', 'Drop 001 out now', 'Free NZ shipping over $150', 'Afterpay · Klarna · Gem'].map((t) => `<span>${t}</span><i>✦</i>`).join('');
  $('#ribbon').innerHTML = rib + rib + rib;
  const tk = window.TICKER.map(([a, b]) => `<span><b>${a}</b>${b}<i>✦</i></span>`).join('');
  $('#ticker').innerHTML = tk + tk + tk;

  /* ------------------------------------------------------------------ AFTERHOURS drop */
  const DR = window.DROP;
  $('#dropImg').src = DR.img;
  $('#dropGrid').innerHTML = DR.ids.map((id, i) => `<div class="dtile" style="--d:${(0.15 + i * 0.08).toFixed(2)}s"><div class="dtile__img"><img src="${P[id].img}" alt="${P[id].name}" loading="lazy"></div><div class="dtile__name">${P[id].name}</div><div class="dtile__price">${money(P[id].price)}</div><button class="dtile__add" data-id="${id}" aria-label="Add ${P[id].name}">+</button></div>`).join('');
  $('#dropTotal').textContent = `4 pieces · ${money(DR.ids.reduce((a, id) => a + P[id].price, 0))}`;
  $('#dropGrid').onclick = (e) => { const b = e.target.closest('.dtile__add'); if (b) addToBag(b.dataset.id, b.closest('.dtile').querySelector('img')); };
  $('#dropAll').onclick = () => {
    DR.ids.forEach((id, k) => setTimeout(() => addToBag(id, $$('#dropGrid img')[k], { quiet: true }), k * 120));
    toast(`<b>AFTERHOURS ${DR.no}</b> all 4 pieces added`);
  };
  revealIO.observe($('#drop'));

  /* ------------------------------------------------------------------ six hours, six moods */
  $('#moodRow').innerHTML = window.MOODS.map((m, i) => `
    <div class="hour" style="--d:${(0.1 + i * 0.1).toFixed(2)}s">
      <div class="hour__time"><span>${m.time}</span></div>
      <div class="hour__frame"><img src="${m.img}" alt="${m.name}" loading="lazy"></div>
      <div class="hour__name">${m.name}</div>
      <div class="hour__note">${m.note}</div>
    </div>`).join('');
  $$('.hour').forEach((h) => (h.onclick = () => scrollToEl($('#look'))));
  revealIO.observe($('#timeline'));

  /* ------------------------------------------------------------------ try the look: contact sheet */
  const L = window.LOOKS; let li = 0;
  $('#lookSheet').innerHTML = L.map((lk, i) => `<li><button data-i="${i}" aria-label="${lk.name}"><img src="${lk.img}" alt="" loading="lazy"><span><b>${pad(i + 1)}A</b>${lk.name.toUpperCase()}</span></button></li>`).join('');
  $('#lookSheet').onclick = (e) => { const b = e.target.closest('button'); if (b) showLook(+b.dataset.i); };
  function hot(k, on) {
    const pc = $$('.piece')[k]; if (pc) pc.classList.toggle('is-hot', on);
    const s = $$('#lookSpots .spot')[k]; if (s) s.classList.toggle('is-hot', on);
  }
  function showLook(i, first) {
    li = wrap(i, L.length); const lk = L[li];
    if (!first) flash($('#lookFlash'));
    $('#lookImg').src = lk.img; $('#lookImg').alt = lk.name;
    $('#lookMeta').textContent = `LOOK ${pad(li + 1)}/${pad(L.length)} · ${lk.name.toUpperCase()}`;
    $$('#lookSheet button').forEach((b, k) => b.classList.toggle('is-on', k === li));
    $('#lookSpots').innerHTML = lk.spots.map((p, k) => `<button class="spot" data-k="${k}" style="left:${p[0]}%;top:${p[1]}%;--d:${(0.15 + k * 0.08).toFixed(2)}s" aria-label="${P[lk.pieces[k]].name}">${k + 1}<span class="spot__tip">${P[lk.pieces[k]].name}<b>${money(P[lk.pieces[k]].price)}</b></span></button>`).join('');
    requestAnimationFrame(() => requestAnimationFrame(() => $$('#lookSpots .spot').forEach((s) => s.classList.add('is-in'))));
    $('#lookTitle').innerHTML = `<small>LOOK ${pad(li + 1)} · ${lk.pieces.length} PIECES</small>${lk.name}`;
    $('#lookPieces').innerHTML = lk.pieces.map((id, k) => `<li class="piece" data-k="${k}" style="--d:${k * 0.07}s">${thumb(P[id])}<div><div class="piece__name">${P[id].name}</div><div class="piece__price">${money(P[id].price)}</div></div><span class="piece__n">${k + 1}</span></li>`).join('');
    $('#lookTotal').textContent = money(lk.pieces.reduce((a, id) => a + P[id].price, 0));
    $$('.piece').forEach((p) => { p.onmouseenter = () => hot(+p.dataset.k, true); p.onmouseleave = () => hot(+p.dataset.k, false); });
  }
  $('#lookSpots').addEventListener('mouseover', (e) => { const s = e.target.closest('.spot'); if (s) hot(+s.dataset.k, true); });
  $('#lookSpots').addEventListener('mouseout', (e) => { const s = e.target.closest('.spot'); if (s) hot(+s.dataset.k, false); });
  $('#lookSpots').addEventListener('click', (e) => { const s = e.target.closest('.spot'); if (!s) return; $$('#lookSpots .spot').forEach((x, k) => hot(k, x === s)); });
  $('#lookPrev').onclick = () => showLook(li - 1);
  $('#lookNext').onclick = () => showLook(li + 1);
  $('#lookAdd').onclick = () => {
    L[li].pieces.forEach((id, k) => setTimeout(() => addToBag(id, $$('.piece .thumb')[k], { quiet: true }), k * 120));
    toast(`<b>${L[li].name}</b> ${L[li].pieces.length} pieces added`);
  };
  let lx = null;
  $('#lookFrame').addEventListener('pointerdown', (e) => { lx = e.clientX; });
  $('#lookFrame').addEventListener('pointerup', (e) => { if (lx !== null && Math.abs(e.clientX - lx) > 50) showLook(li + (e.clientX < lx ? 1 : -1)); lx = null; });
  showLook(0, true);

  /* ------------------------------------------------------------------ pick a fit */
  const deck = $('#deck'), deckTrack = $('#deckTrack');
  window.DECK.forEach((d) => {
    const p = P[d.id], c = document.createElement('div'), light = isLight(d.bg);
    c.className = 'card'; c.style.setProperty('--bg-c', d.bg); c.style.setProperty('--fg-c', light ? '#0b0b0d' : '#f2f2ee');
    if (light) c.dataset.acid = '';
    c.innerHTML = `<div class="card__inner">${p.drop ? '<span class="badge-new">NEW · DROP 001</span>' : ''}<div class="card__title">${d.title[0]}<br>${d.title[1]}</div><div class="card__img"><img src="${p.img}" alt="${p.name}" draggable="false" loading="lazy"></div>
      <button class="card__fav" aria-label="Save ${p.name}"><svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg></button>
      <div class="card__meta"><div class="card__name">${p.name}</div><div class="card__price">${money(p.price)}</div></div><button class="card__add" aria-label="Add ${p.name}">+</button><div class="card__shine"></div></div>`;
    c.dataset.id = d.id; deckTrack.appendChild(c);
  });
  const cards = $$('.card', deckTrack);
  let dpos = 0, dvel = 0, dragging = false, dragMoved = 0, hoverDeck = false, dLast = 0, deckVisible = true;
  new IntersectionObserver((e) => { deckVisible = e[0].isIntersecting; }).observe(deck);
  (function deckFrame() {
    requestAnimationFrame(deckFrame);
    if (!deckVisible) return;
    const W = deck.clientWidth, cw = cards[0].offsetWidth, sp = cw + 20, total = sp * cards.length;
    if (!dragging) { dvel *= 0.94; dpos += dvel + (hoverDeck ? 0.08 : 0.55); }
    cards.forEach((c, i) => {
      const rel = nearest(i * sp - dpos, total), d = Math.max(-1.6, Math.min(1.6, rel / (W / 2))), a = Math.abs(d);
      c.style.transform = `translate3d(${W / 2 + rel - cw / 2}px, ${a * a * 26}px, ${-a * 150}px) rotateY(${-d * 26}deg) rotateZ(${d * 2.5}deg) scale(${1 - a * 0.04})`;
      c.style.zIndex = 100 - Math.round(a * 10);
      c.style.opacity = a > 1.45 ? Math.max(0, (1.6 - a) / 0.15) : 1;
    });
  })();
  deck.addEventListener('pointerenter', () => (hoverDeck = true));
  deck.addEventListener('pointerleave', () => { hoverDeck = false; cards.forEach((c) => { c.querySelector('.card__inner').style.transform = ''; c.classList.remove('is-press'); }); });
  deck.addEventListener('pointerdown', (e) => { dragging = true; dragMoved = 0; dLast = e.clientX; deck.classList.add('is-drag'); const c = e.target.closest('.card'); if (c) c.classList.add('is-press'); });
  window.addEventListener('pointermove', (e) => {
    if (dragging) { const dx = e.clientX - dLast; dLast = e.clientX; dpos -= dx; dvel = -dx; dragMoved += Math.abs(dx); }
    const c = e.target.closest && e.target.closest('.card');
    if (c && !dragging) {
      const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      c.querySelector('.card__inner').style.transform = `rotateX(${(0.5 - y) * 16}deg) rotateY(${(x - 0.5) * 18}deg)`;
      c.style.setProperty('--mx', x * 100 + '%'); c.style.setProperty('--my', y * 100 + '%');
    }
  });
  deck.addEventListener('pointerout', (e) => { const c = e.target.closest('.card'); if (c && !c.contains(e.relatedTarget)) { c.querySelector('.card__inner').style.transform = ''; c.classList.remove('is-press'); } });
  window.addEventListener('pointerup', () => { if (!dragging) return; dragging = false; deck.classList.remove('is-drag'); cards.forEach((c) => c.classList.remove('is-press')); });
  deck.addEventListener('click', (e) => {
    if (dragMoved > 6) return;
    const c = e.target.closest('.card'); if (!c) return;
    if (e.target.closest('.card__add')) addToBag(c.dataset.id, c.querySelector('.card__img img'));
    else if (e.target.closest('.card__fav')) { e.target.closest('.card__fav').classList.toggle('is-on'); toast('Saved to your wishlist'); }
  });

  /* ------------------------------------------------------------------ the rack */
  const rackSec = $('#rack'), stage = $('#rackStage'), fixture = $('#fixture'), railItems = $('#railItems'), shelfItems = $('#shelfItems');
  const ids = Object.keys(P);
  const RAIL_H = { t1: 222, t2: 232, p3: 236, tees: 182, pants: 238 };
  const SHELF_H = { ah3: 112, ah4: 78, shoes: 92, a1: 44, a2: 116, a3: 84, a4: 34, a5: 128, t5: 106 };
  const HANGER = `<svg class="piece-r__hanger" viewBox="0 0 120 44"><path d="M60 2c6 0 9 4 9 8 0 5-9 7-9 13v4" fill="none" stroke="#b9bcc4" stroke-width="3" stroke-linecap="round"/><path d="M60 27 L10 40 c-5 2-3 4 1 4 h98 c4 0 6-2 1-4 Z" fill="#2c2c33" stroke="#55565d" stroke-width="2" stroke-linejoin="round"/></svg>`;
  const CLIPS = `<svg class="piece-r__hanger" viewBox="0 0 120 44"><path d="M60 2c6 0 9 4 9 8 0 5-9 7-9 13v6" fill="none" stroke="#b9bcc4" stroke-width="3" stroke-linecap="round"/><path d="M20 30 H100" stroke="#b9bcc4" stroke-width="4" stroke-linecap="round"/><rect x="24" y="28" width="10" height="16" rx="2" fill="#8d8f97"/><rect x="86" y="28" width="10" height="16" rx="2" fill="#8d8f97"/></svg>`;
  let rcat = 'all', railList = [], shelfList = [], rfocus = null;
  $('#chips').innerHTML = window.CATS.map((c) => `<button class="chip ${c.key === 'all' ? 'is-on' : ''}" data-k="${c.key}">${c.label} <i>${c.key === 'all' ? ids.length : ids.filter((id) => P[id].cat === c.key).length}</i></button>`).join('');
  $('#chips').onclick = (e) => { const b = e.target.closest('.chip'); if (!b || b.dataset.k === rcat) return; $$('.chip').forEach((c) => c.classList.toggle('is-on', c === b)); setRack(b.dataset.k); };
  const scaleK = () => Math.max(0.5, Math.min(1, stage.clientWidth / 1250));
  function buildPiece(id, i, onShelf) {
    const p = P[id], el = document.createElement('div');
    el.className = 'piece-r is-enter'; el.dataset.id = id;
    el.style.setProperty('--d', (i * 0.05).toFixed(2) + 's');
    const k = scaleK(), shelfOnly = !railList.length;
    const h = onShelf ? (SHELF_H[id] || SHELF_H[p.cat]) * k * (shelfOnly ? 1.55 : 1) : (RAIL_H[id] || RAIL_H[p.cat]) * k * (!shelfList.length ? 1.12 : 1);
    el.style.setProperty('--h', h + 'px');
    const hang = !onShelf && p.hanger ? (p.cat === 'pants' ? CLIPS : HANGER) : '';
    el.innerHTML = `<div class="piece-r__swing" style="--sw:${(3 + Math.random() * 1.6).toFixed(2)}s;--sd:${(-Math.random() * 3).toFixed(2)}s">${hang}<img class="piece-r__img piece-r__front" src="${p.img}" alt="${p.name}" draggable="false">${p.back ? `<img class="piece-r__img piece-r__back" src="${p.back}" alt="" draggable="false">` : ''}<span class="piece-r__price">${money(p.price)}</span></div>${p.drop ? '<span class="badge-new">NEW</span>' : ''}`;
    if (hang) el.querySelector('.piece-r__hanger').style.width = Math.max(70, 120 * k) + 'px';
    el.onclick = (e) => { e.stopPropagation(); focusRack(id); };
    el.addEventListener('animationend', (e) => { if (e.animationName === 'garmentIn' || e.animationName === 'shelfIn') el.classList.remove('is-enter'); });
    return el;
  }
  function layoutRow(cont, list) {
    const W = cont.clientWidth, n = list.length;
    const step = Math.min(W / Math.max(n, 1), 260 * scaleK());
    const start = (W - step * n) / 2;
    $$('.piece-r:not(.is-leave)', cont).forEach((el, i) => { el.style.left = (start + step * (i + 0.5)) + 'px'; el.dataset.x = start + step * (i + 0.5); });
  }
  function layoutRack() {
    layoutRow(railItems, railList); layoutRow(shelfItems, shelfList);
    $$('.piece-r', fixture).forEach((el) => { if (!el.classList.contains('is-focus')) el.style.transform = ''; el.style.width = '0'; el.style.display = 'flex'; el.style.justifyContent = 'center'; });
    if (rfocus) applyFocus();
    $('#rackMicro').textContent = `The rack · ${railList.length + shelfList.length} pieces`;
  }
  function setRack(cat) {
    rcat = cat; unfocus();
    const old = $$('.piece-r', fixture); old.forEach((g) => g.classList.add('is-leave'));
    setTimeout(() => {
      old.forEach((g) => g.remove());
      const list = ids.filter((id) => cat === 'all' || P[id].cat === cat);
      railList = list.filter((id) => P[id].rail); shelfList = list.filter((id) => !P[id].rail);
      fixture.classList.toggle('no-rail', !railList.length); fixture.classList.toggle('no-shelf', !shelfList.length);
      railList.forEach((id, i) => railItems.appendChild(buildPiece(id, i, false)));
      shelfList.forEach((id, i) => shelfItems.appendChild(buildPiece(id, i + railList.length, true)));
      layoutRack();
    }, old.length ? 460 : 0);
  }
  function applyFocus() {
    const el = $(`.piece-r[data-id="${rfocus}"]`, fixture); if (!el) return;
    const onShelf = !P[rfocus].rail, cont = el.parentElement;
    const sr = stage.getBoundingClientRect(), cr = cont.getBoundingClientRect();
    const cx = innerWidth > 700 ? sr.left + sr.width * 0.36 : sr.left + sr.width / 2;
    const dx = cx - (cr.left + +el.dataset.x);
    let dy, sc;
    if (onShelf) { const h = parseFloat(el.style.getPropertyValue('--h')); sc = Math.min(2.6, 190 / h); dy = (sr.top + sr.height * 0.62) - cr.bottom; }
    else { sc = innerWidth > 700 ? 1.45 : 1.25; dy = 0; }
    el.style.transform = `translate(${dx}px, ${dy}px) scale(${sc})`;
    $$('.piece-r', fixture).forEach((x) => { if (x !== el) { const left = +x.dataset.x < +el.dataset.x; x.style.transform = x.parentElement === cont ? `translateX(${left ? -40 : 40}px) scale(.92)` : ''; } });
  }
  function focusRack(id) {
    rfocus = id; const p = P[id];
    $$('.piece-r', fixture).forEach((x) => { x.classList.toggle('is-focus', x.dataset.id === id); x.classList.remove('show-back'); });
    rackSec.classList.add('is-focus');
    $('#rdCat').textContent = (p.drop ? 'AFTERHOURS · ' : '') + window.CAT_LABEL[p.cat];
    $('#rdName').textContent = p.name;
    $('#rdPrice').textContent = `${money(p.price)} · ${p.desc}`;
    $('#rdSide').hidden = !p.back;
    $$('#rdSide button').forEach((b) => b.classList.toggle('is-on', b.dataset.side === 'front'));
    const sizes = window.SIZES[p.cat];
    $('#rdSizes').innerHTML = sizes.map((s, k) => `<button class="${k === Math.min(1, sizes.length - 1) ? 'is-on' : ''}">${s}</button>`).join('');
    applyFocus();
  }
  function unfocus() { rfocus = null; rackSec.classList.remove('is-focus'); $$('.piece-r', fixture).forEach((x) => { x.classList.remove('is-focus', 'show-back'); x.style.transform = ''; }); }
  const visibleIds = () => [...railList, ...shelfList];
  $('#rdSizes').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; $$('#rdSizes button').forEach((x) => x.classList.toggle('is-on', x === b)); };
  $('#rdSide').onclick = (e) => {
    const b = e.target.closest('button'); if (!b || !rfocus) return;
    $$('#rdSide button').forEach((x) => x.classList.toggle('is-on', x === b));
    $(`.piece-r[data-id="${rfocus}"]`, fixture).classList.toggle('show-back', b.dataset.side === 'back');
  };
  $('#rdAdd').onclick = (e) => {
    if (!rfocus) return;
    addToBag(rfocus, $(`.piece-r[data-id="${rfocus}"] .piece-r__front`, fixture), { size: $('#rdSizes .is-on').textContent });
    e.currentTarget.textContent = 'Added to bag'; setTimeout(() => ($('#rdAdd').textContent = 'Add to bag'), 1600);
  };
  $('#rackDetail .heart').onclick = (e) => e.currentTarget.classList.toggle('is-on');
  $('#rdClose').onclick = unfocus;
  $('#rackPrev').onclick = () => { const v = visibleIds(); focusRack(v[wrap(v.indexOf(rfocus) - 1, v.length)]); };
  $('#rackNext').onclick = () => { const v = visibleIds(); focusRack(v[wrap(v.indexOf(rfocus) + 1, v.length)]); };
  stage.addEventListener('click', (e) => { if (rfocus && !e.target.closest('.piece-r, .rack__detail, .rack__arrow')) unfocus(); });
  setRack('all');
  let rsT; window.addEventListener('resize', () => { clearTimeout(rsT); rsT = setTimeout(() => setRack(rcat), 200); });

  /* ------------------------------------------------------------------ clock out. switch on. */
  const dTrack = $('#devoteTrack');
  const dcard = (id, i) => { const p = P[id]; return `<article class="dcard" style="--pc:${p.color};--rot:${((i % 3) - 1) * 1.2}deg"><span class="dcard__n">${pad(i + 1)}</span><div class="dcard__img"><img src="${p.img}" alt="${p.name}" loading="lazy" draggable="false"></div><div class="dcard__body"><div class="dcard__cat">${p.drop ? 'AFTERHOURS · ' : ''}${window.CAT_LABEL[p.cat]}</div><div class="dcard__name">${p.name}</div><div class="dcard__desc">${p.desc}</div><div class="dcard__row"><span class="dcard__price">${money(p.price)}</span><button class="dcard__add" data-id="${id}">ADD TO BAG +</button></div></div></article>`; };
  dTrack.innerHTML = window.DEVOTE.map(dcard).join('') + window.DEVOTE.map(dcard).join('');
  const ln = window.LINES.map(([a, b]) => `<span>${a} <em>${b}</em></span>`).join('');
  $('#linesTrack').innerHTML = ln + ln;
  let tpos = 0, tdrag = false, tlast = 0, tmoved = 0, thover = false;
  (function tick() { const half = dTrack.scrollWidth / 2; if (!tdrag) tpos += thover ? 0.15 : 0.6; tpos = wrap(tpos, half || 1); dTrack.style.transform = `translateX(${-tpos}px)`; requestAnimationFrame(tick); })();
  const dRail = $('#devoteRail');
  dRail.addEventListener('pointerenter', () => (thover = true));
  dRail.addEventListener('pointerleave', () => (thover = false));
  dRail.addEventListener('pointerdown', (e) => { tdrag = true; tlast = e.clientX; tmoved = 0; });
  window.addEventListener('pointermove', (e) => { if (!tdrag) return; const dx = e.clientX - tlast; tlast = e.clientX; tpos -= dx; tmoved += Math.abs(dx); });
  window.addEventListener('pointerup', () => (tdrag = false));
  dTrack.addEventListener('click', (e) => { const b = e.target.closest('.dcard__add'); if (!b || tmoved > 6) return; addToBag(b.dataset.id, b.closest('.dcard').querySelector('img')); });

  /* ------------------------------------------------------------------ caught in the flash */
  const col = (arr) => [...arr, ...arr].map((s) => `<img src="${s}" alt="" loading="lazy">`).join('');
  $('#feelL').innerHTML = col(window.FEEL_L); $('#feelR').innerHTML = col(window.FEEL_R);
  const F = window.FILM, film = $('#film'), frames = $('#filmFrames');
  frames.innerHTML = F.map((s, i) => `<div class="film__frame" style="--kx:${i % 2 ? -3 : 3}%;--ky:${i % 3 ? 2 : -2}%"><img src="${s}" alt="" loading="lazy"></div>`).join('');
  let fi = -1, fPlaying = true, fStart = 0, fElapsed = 0, fTotal = 0; const FILM_MS = 5000;
  function filmNext() { fi = wrap(fi + 1, F.length); flash($('#filmFlash')); $$('.film__frame', frames).forEach((f, k) => f.classList.toggle('is-on', k === fi)); fStart = performance.now(); fElapsed = 0; }
  filmNext();
  (function ftick(now) {
    if (fPlaying) { const d = now - fStart - fElapsed; fElapsed = now - fStart; fTotal += Math.max(0, d); if (fElapsed >= FILM_MS) filmNext(); }
    $('#filmProg').style.width = Math.min(100, (fElapsed / FILM_MS) * 100) + '%';
    const t = Math.floor(fTotal / 1000), fr = Math.floor((fTotal % 1000) / 40);
    $('#filmTc').textContent = `${pad(Math.floor(t / 60))}:${pad(t % 60)}:${pad(fr)}`;
    requestAnimationFrame(ftick);
  })(performance.now());
  $('#filmPlay').onclick = () => {
    fPlaying = !fPlaying; film.classList.toggle('is-paused', !fPlaying);
    if (fPlaying) fStart = performance.now() - fElapsed;
    $$('.film__frame.is-on img', frames).forEach((im) => (im.style.animationPlayState = fPlaying ? 'running' : 'paused'));
    $('#filmPlay').innerHTML = fPlaying ? '<svg viewBox="0 0 24 24"><path d="M8 5v14M16 5v14"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M7 5l12 7-12 7z"/></svg>';
  };

  /* ------------------------------------------------------------------ reels + story */
  const RL = window.REELS, reelsRow = $('#reelsRow');
  let ri = 2, reelsPaused = false;
  RL.forEach((r, i) => {
    const el = document.createElement('div'); el.className = 'reel';
    el.innerHTML = `<img src="${r.img}" alt="${r.name}" loading="lazy"><div class="reel__top"><span>● REEL ${pad(i + 1)}</span><span>${r.dur}</span></div><div class="reel__play"></div><div class="reel__body"><div class="reel__cat">SHOP · ${P[r.id].name.toUpperCase()}</div><div class="reel__name">${r.name}</div><div class="reel__place">${r.place}</div></div>`;
    el.onclick = () => (i === ri ? openStory(i) : layoutReels(i));
    reelsRow.appendChild(el);
  });
  const reels = $$('.reel', reelsRow);
  function layoutReels(i = ri) {
    ri = wrap(i, RL.length);
    const w = reels[0].offsetWidth, W = reelsRow.clientWidth, sp = Math.min(w * 0.98, (W - w) / 5.4);
    reels.forEach((el, k) => {
      const o = nearest(k - ri, RL.length), a = Math.abs(o);
      el.style.transform = `translateX(${o * sp * (1 + a * 0.06)}px) translateZ(${-a * 90}px) rotateY(${-o * 8}deg) scale(${o === 0 ? 1.18 : 1 - a * 0.1})`;
      el.style.zIndex = 20 - a; el.style.opacity = a > 3 ? 0 : 1; el.style.filter = `brightness(${1 - a * 0.12})`;
      el.classList.toggle('is-center', o === 0);
    });
  }
  layoutReels(); window.addEventListener('resize', () => layoutReels());
  setInterval(() => { if (!reelsPaused && !story.classList.contains('is-open')) layoutReels(ri + 1); }, 3600);
  $('#reelsPause').onclick = (e) => { reelsPaused = !reelsPaused; e.currentTarget.innerHTML = reelsPaused ? '<svg viewBox="0 0 24 24"><path d="M8 6l10 6-10 6z"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M9 6v12M15 6v12"/></svg>'; };

  const story = $('#story'), sStage = $('#storyStage'), sbg = $('#storyBg');
  const STORY_MS = 6000; let si = 0, sStart = 0, sElapsed = 0, sHold = false, sRAF = null;
  RL.forEach((r) => {
    const p = P[r.id], c = document.createElement('div'); c.className = 'story__card';
    c.innerHTML = `<img src="${r.img}" alt="${r.name}"><div class="story__side-name">${r.name}</div>
      <div class="story__ui">
        <div class="story__bars">${RL.map(() => '<span><i></i></span>').join('')}</div>
        <div class="story__head"><div class="story__av">K</div><div class="story__who">korva<small>${r.place}</small></div>
          <div class="story__icons"><button class="s-mute" aria-label="Mute"><svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9a4 4 0 0 1 0 6"/></svg></button><button class="s-close" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div></div>
        <div class="story__body"><div class="story__cat">SHOP THE REEL</div><div class="story__name">${r.name}</div>
          <div class="story__shop">${thumb(p)}<div><div class="story__pname">${p.name}</div><div class="story__desc">${p.desc}</div></div></div>
          <div class="story__row"><span class="story__price">${money(p.price)}</span><button class="pill pill--acid s-add">Add to bag</button><button class="story__heart" aria-label="Save"><svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg></button><a class="story__more" href="#rack">More fits</a></div></div>
      </div>`;
    sStage.appendChild(c);
  });
  const scards = $$('.story__card', sStage);
  function layoutStory() {
    scards.forEach((c, k) => {
      const o = nearest(k - si, RL.length), a = Math.abs(o);
      c.classList.toggle('is-cur', o === 0); c.classList.toggle('is-side', a === 1);
      let tf, op = 1, fl = 'none';
      if (o === 0) tf = 'translate(-50%,-50%)';
      else if (a === 1) { tf = `translate(calc(-50% + ${o * 300}px), -50%) translateZ(-200px) rotateY(${-o * 24}deg) scale(.5)`; fl = 'brightness(.6) grayscale(.6)'; }
      else { tf = `translate(calc(-50% + ${o * 420}px), -50%) translateZ(-400px) scale(.3)`; op = 0; }
      if (innerWidth < 700 && o !== 0) { tf = `translate(calc(-50% + ${o * 110}%), -50%) scale(.8)`; op = 0; }
      c.style.transform = tf; c.style.opacity = op; c.style.filter = fl; c.style.zIndex = 10 - a; c.style.pointerEvents = a <= 1 ? 'auto' : 'none';
      $$('.story__bars span', c).forEach((b, j) => { b.querySelector('i').style.width = j < si ? '100%' : '0'; });
    });
    sbg.style.backgroundImage = `url(${RL[si].img})`; sbg.style.setProperty('--tint', RL[si].tint);
    sStart = performance.now(); sElapsed = 0;
  }
  function stick(now) {
    sRAF = requestAnimationFrame(stick);
    if (sHold) { sStart = now - sElapsed; return; }
    sElapsed = now - sStart;
    const bar = $$('.story__bars span', scards[si])[si]; if (bar) bar.querySelector('i').style.width = Math.min(100, (sElapsed / STORY_MS) * 100) + '%';
    if (sElapsed >= STORY_MS) { if (si === RL.length - 1) closeStory(); else { si++; layoutStory(); } }
  }
  function openStory(i) { si = i; story.classList.add('is-open'); story.setAttribute('aria-hidden', 'false'); lockScroll(true); layoutStory(); cancelAnimationFrame(sRAF); sRAF = requestAnimationFrame(stick); }
  function closeStory() { story.classList.remove('is-open'); story.setAttribute('aria-hidden', 'true'); lockScroll(false); cancelAnimationFrame(sRAF); }
  let sy = null, sx = null, sDownT = 0;
  sStage.addEventListener('pointerdown', (e) => { sy = e.clientY; sx = e.clientX; sDownT = performance.now(); if (e.target.closest('.story__card.is-cur') && !e.target.closest('button, a')) sHold = true; });
  sStage.addEventListener('pointerup', (e) => {
    sHold = false; if (sy === null) return;
    const dy = e.clientY - sy, dx = e.clientX - sx, held = performance.now() - sDownT > 350; sy = null;
    if (dy > 90) { closeStory(); return; }
    if (Math.abs(dx) > 60) { si = wrap(si + (dx < 0 ? 1 : -1), RL.length); layoutStory(); return; }
    const card = e.target.closest('.story__card');
    if (e.target.closest('.s-close')) { closeStory(); return; }
    if (e.target.closest('.s-mute')) { const m = e.target.closest('.s-mute'); m.style.opacity = m.style.opacity === '0.4' ? '1' : '0.4'; return; }
    if (e.target.closest('.s-add')) { addToBag(RL[si].id, card.querySelector('.thumb')); return; }
    if (e.target.closest('.story__heart')) { e.target.closest('.story__heart').classList.toggle('is-on'); return; }
    if (e.target.closest('.story__more')) { closeStory(); return; }
    if (held) return;
    if (!card) { closeStory(); return; }
    const k = scards.indexOf(card); if (k !== si) { si = k; layoutStory(); return; }
    const r = card.getBoundingClientRect();
    if (e.clientX < r.left + r.width / 3) { si = wrap(si - 1, RL.length); layoutStory(); }
    else if (e.clientX > r.left + (r.width * 2) / 3) { if (si === RL.length - 1) closeStory(); else { si++; layoutStory(); } }
  });

  /* ------------------------------------------------------------------ the late shift */
  const SG = window.SIGNATURE, fan = $('#fan');
  let gi = 3, fanHover = false;
  SG.forEach((s, i) => {
    const a = document.createElement('div'); a.className = 'arc';
    a.innerHTML = `<img src="${P[s.id].img}" alt="${P[s.id].name}" loading="lazy">`;
    a.onclick = () => showSig(i); fan.appendChild(a);
    $('#sigDots').insertAdjacentHTML('beforeend', `<button aria-label="${P[s.id].name}"></button>`);
  });
  $$('#sigDots button').forEach((b, i) => (b.onclick = () => showSig(i)));
  const arcs = $$('.arc', fan);
  function showSig(i) {
    gi = wrap(i, SG.length);
    arcs.forEach((a, k) => {
      const o = nearest(k - gi, SG.length), ab = Math.abs(o), sp = a.offsetWidth * 0.66;
      a.style.transform = `translateX(${o * sp * (1 - ab * 0.04)}px) translateY(${ab * 8 - (o === 0 ? 14 : 0)}px) rotate(${o * 8}deg) scale(${o === 0 ? 1.12 : 1 - ab * 0.1})`;
      a.style.filter = `blur(${ab > 0 ? ab * 1.2 : 0}px) brightness(${1 - ab * 0.12})`;
      a.style.opacity = ab > 3 ? 0 : 1 - ab * 0.1; a.style.zIndex = 10 - ab;
      a.classList.toggle('is-center', o === 0);
    });
    const p = P[SG[gi].id];
    $('#sigName').innerHTML = [...p.name].map((c, k) => c === ' ' ? ' ' : `<span class="ch" style="animation-delay:${k * 0.025}s">${c}</span>`).join('');
    $('#sigSub').textContent = `${p.drop ? 'AFTERHOURS · ' : ''}${window.CAT_LABEL[p.cat]} · ${money(p.price)}`;
    $$('#sigDots button').forEach((b, k) => b.classList.toggle('is-on', k === gi));
  }
  showSig(gi);
  fan.addEventListener('pointerenter', () => (fanHover = true));
  fan.addEventListener('pointerleave', () => (fanHover = false));
  setInterval(() => { if (!fanHover) showSig(gi + 1); }, 3400);
  $('#sigAdd').onclick = () => addToBag(SG[gi].id, arcs[gi].querySelector('img'));

  /* ------------------------------------------------------------------ three pieces, one night */
  const FB = window.FABRICS, mixSec = $('#mix');
  const weave = window.Weave($('#weave'), FB);
  const ROMAN = ['I', 'II', 'III'];
  let sel = [];
  $('#swatches').innerHTML = FB.map((f, i) => `<button class="sw" data-i="${i}" title="${P[f.id].name}" aria-label="${P[f.id].name}" style="background-image:url(${weave.swatchURLs[i]})"></button>`).join('');
  function renderMix() {
    $('#mixSlots').innerHTML = [0, 1, 2].map((k) => { const f = sel[k] !== undefined ? P[FB[sel[k]].id] : null; return `<li class="${f ? 'is-full' : ''}"><b>${ROMAN[k]}</b><span>${f ? f.name : 'A thread, waiting'}</span><button data-k="${k}" aria-label="Remove">×</button></li>`; }).join('');
    $$('.sw').forEach((s) => { const k = sel.indexOf(+s.dataset.i); s.classList.toggle('is-on', k >= 0); s.dataset.n = k >= 0 ? ROMAN[k] : ''; });
    const sum = sel.reduce((a, i) => a + P[FB[i].id].price, 0), full = sel.length === 3;
    mixSec.classList.toggle('is-full', full);
    $('#mixWas').textContent = full ? money(sum) : '';
    $('#mixNow').textContent = window.fmtNZD(full ? sum * 0.9 : sum, full);
    $('#mixLeft').textContent = full ? 'Woven as one · 10% off' : `${3 - sel.length} more to weave`;
    $('#mixPrompt').textContent = full ? 'Woven as one' : sel.length ? P[FB[sel[sel.length - 1]].id].name : 'Choose a piece to weave it in';
    weave.set([0, 1, 2].map((k) => (sel[k] !== undefined ? sel[k] : null)));
  }
  $('#swatches').onclick = (e) => { const s = e.target.closest('.sw'); if (!s) return; const i = +s.dataset.i, k = sel.indexOf(i); if (k >= 0) sel.splice(k, 1); else if (sel.length < 3) sel.push(i); else return; renderMix(); };
  $('#swatches').addEventListener('mouseover', (e) => { const s = e.target.closest('.sw'); if (s && sel.length < 3) { const p = P[FB[+s.dataset.i].id]; $('#mixPrompt').textContent = `${p.name} · ${money(p.price)}`; } });
  $('#swatches').addEventListener('mouseleave', () => renderMix());
  $('#mixSlots').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; sel.splice(+b.dataset.k, 1); renderMix(); };
  $('#mixAdd').onclick = (e) => {
    const sum = sel.reduce((a, i) => a + P[FB[i].id].price, 0);
    sel.forEach((i, k) => setTimeout(() => addToBag(FB[i].id, e.target, { disc: 0.1, quiet: true }), k * 120));
    const t = $('#mixToast'); t.textContent = `Woven and in your bag. You saved ${window.fmtNZD(sum * 0.1, true)}.`; t.classList.add('is-on');
    setTimeout(() => { t.classList.remove('is-on'); sel = []; renderMix(); }, 2600);
  };
  renderMix();

  /* ------------------------------------------------------------------ misc */
  $('#newsForm').onsubmit = (e) => { e.preventDefault(); e.target.reset(); toast('You are on the list. <b>See you after hours.</b>'); };
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { if (story.classList.contains('is-open')) closeStory(); else if (rfocus) unfocus(); openDrawer(false); }
    if (rfocus && e.key === 'ArrowRight') $('#rackNext').click();
    if (rfocus && e.key === 'ArrowLeft') $('#rackPrev').click();
  });
  window.addEventListener('storage', () => { syncCounts(); renderDrawer(); });
  function onScroll() {
    updateActive();
    const r = film.getBoundingClientRect(), vh = innerHeight;
    const p = Math.max(0, Math.min(1, 1 - (r.top + r.height / 2 - vh / 2) / vh));
    film.style.setProperty('--fs', (0.84 + 0.16 * p).toFixed(3));
  }
  if (lenis) lenis.on('scroll', onScroll); else window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  $$('[data-reveal], [data-split]').forEach((el) => revealIO.observe(el));
  if (location.hash === '#bag') openDrawer(true);
})();
