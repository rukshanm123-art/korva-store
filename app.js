/* =====================================================================
   KORVA — interactions
   ===================================================================== */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const P = window.PRODUCTS;
  const money = (n) => window.CUR + Math.round(n).toLocaleString('en-IN');
  const wrap = (v, n) => ((v % n) + n) % n;
  const nearest = (o, n) => { o = wrap(o, n); return o > n / 2 ? o - n : o; };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     Smooth scroll
  ------------------------------------------------------------------ */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new window.Lenis({ lerp: 0.085, wheelMultiplier: 1 });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    lenis.stop();
  }
  const scrollToEl = (el) => {
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: el.id === 'home' ? 0 : -20, duration: 1.6 });
    else el.scrollIntoView({ behavior: 'smooth' });
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const el = document.getElementById(a.getAttribute('href').slice(1));
    if (!el) return;
    e.preventDefault();
    $('#nav').classList.remove('is-menu');
    scrollToEl(el);
  });
  const lockScroll = (on) => { document.body.classList.toggle('is-locked', on); if (lenis) on ? lenis.stop() : lenis.start(); };

  /* ------------------------------------------------------------------
     Text splitting (letters animate in, gradient continuous across em)
  ------------------------------------------------------------------ */
  function splitInto(el) {
    const nodes = [...el.childNodes];
    el.textContent = '';
    nodes.forEach((n) => {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach((w) => {
          if (!w) return;
          if (/^\s+$/.test(w)) { el.appendChild(document.createTextNode(' ')); return; }
          const ws = document.createElement('span'); ws.className = 'w';
          [...w].forEach((c) => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; ws.appendChild(s); });
          el.appendChild(ws);
        });
      } else if (n.nodeType === 1 && n.tagName === 'BR') {
        el.appendChild(n);
      } else if (n.nodeType === 1) {
        splitInto(n); el.appendChild(n);
      }
    });
  }
  function fixGradients() {
    $$('[data-split] em.grad').forEach((em) => {
      const chs = $$('.ch', em);
      if (!chs.length) return;
      const x0 = Math.min(...chs.map((c) => c.getBoundingClientRect().left));
      const x1 = Math.max(...chs.map((c) => c.getBoundingClientRect().right));
      chs.forEach((c) => {
        c.style.setProperty('--gw', (x1 - x0) + 'px');
        c.style.setProperty('--gx', -(c.getBoundingClientRect().left - x0) + 'px');
      });
    });
  }
  $$('[data-split]').forEach((el) => {
    splitInto(el);
    $$('.ch', el).forEach((c, i) => { c.style.transitionDelay = (i * 0.022) + 's'; });
  });
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(fixGradients);
  window.addEventListener('resize', fixGradients);

  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); revealIO.unobserve(e.target); } });
  }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
  const observeReveal = (root = document) => $$('[data-reveal], [data-split], .arch', root).forEach((el) => revealIO.observe(el));

  /* ------------------------------------------------------------------
     Bag
  ------------------------------------------------------------------ */
  const bag = [];
  const bagBtn = $('#bagBtn');
  function toast(html) {
    const t = $('#toast');
    t.innerHTML = html; t.classList.add('is-on');
    clearTimeout(toast.tm); toast.tm = setTimeout(() => t.classList.remove('is-on'), 2400);
  }
  function fly(fromEl, src) {
    if (!fromEl || reduce) return;
    const r = fromEl.getBoundingClientRect(), b = bagBtn.getBoundingClientRect();
    const im = document.createElement(src ? 'img' : 'div');
    im.className = 'flyer';
    if (src) im.src = src; else { im.style.background = '#fff'; im.innerHTML = fromEl.innerHTML; }
    const s = Math.min(90, Math.max(50, r.width * 0.5));
    Object.assign(im.style, { left: (r.left + r.width / 2 - s / 2) + 'px', top: (r.top + r.height / 2 - s / 2) + 'px', width: s + 'px', height: s + 'px' });
    document.body.appendChild(im);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      im.style.transform = `translate(${b.left + b.width / 2 - (r.left + r.width / 2)}px, ${b.top + b.height / 2 - (r.top + r.height / 2)}px) scale(.2) rotate(20deg)`;
      im.style.opacity = '.4'; im.style.borderRadius = '50%';
    }));
    setTimeout(() => im.remove(), 950);
  }
  function addToBag(item, fromEl, quiet) {
    bag.push(item);
    fly(fromEl, item.img);
    setTimeout(() => {
      const c = $('#bagCount'); c.textContent = bag.length; c.classList.add('bump');
      setTimeout(() => c.classList.remove('bump'), 300);
      $('#viewCartCount').textContent = bag.length;
    }, reduce ? 0 : 800);
    if (!quiet) toast(`<b>${item.name}</b> added to your bag`);
    renderDrawer();
  }
  const addProduct = (id, el) => addToBag({ name: P[id].name, price: P[id].price, img: P[id].img }, el);
  function renderDrawer() {
    const ul = $('#drawerList');
    ul.innerHTML = bag.length ? '' : '<li class="drawer__empty" style="display:block">Your bag is waiting for its first piece.</li>';
    bag.forEach((it, i) => {
      const li = document.createElement('li');
      li.innerHTML = `${it.img ? `<img src="${it.img}" alt="">` : `<div class="sw-mini" style="${it.bg ? `background-image:url(${it.bg})` : ''}">${it.svg || ''}</div>`}<div><b>${it.name}</b><small>${money(it.price)}</small></div><button aria-label="Remove">×</button>`;
      li.querySelector('button').onclick = () => { bag.splice(i, 1); $('#bagCount').textContent = bag.length; $('#viewCartCount').textContent = bag.length; renderDrawer(); };
      ul.appendChild(li);
    });
    $('#drawerTotal').textContent = money(bag.reduce((a, b) => a + b.price, 0));
  }
  renderDrawer();
  const openDrawer = (on) => { $('#drawer').classList.toggle('is-open', on); lockScroll(on); };
  bagBtn.onclick = () => openDrawer(true);
  $('#viewCart').onclick = () => openDrawer(true);
  $$('#drawer [data-close]').forEach((b) => (b.onclick = () => openDrawer(false)));

  /* ------------------------------------------------------------------
     Nav: active section + mobile menu
  ------------------------------------------------------------------ */
  const nav = $('#nav');
  $('#burger').onclick = () => nav.classList.toggle('is-menu');
  const sections = $$('[data-section]');
  function updateActive() {
    const y = window.innerHeight * 0.4;
    let key = 'home';
    sections.forEach((s) => { if (s.getBoundingClientRect().top <= y) key = s.dataset.section || s.id; });
    if (key === 'devote') key = 'rack';
    $$('#navLinks a').forEach((a) => a.classList.toggle('is-active', a.dataset.sec === key));
  }

  /* ------------------------------------------------------------------
     Intro curtain
  ------------------------------------------------------------------ */
  const intro = $('#intro');
  let introDone = false;
  function openIntro() {
    if (introDone) return; introDone = true;
    intro.classList.add('is-open');
    setTimeout(() => {
      document.body.classList.remove('is-intro');
      if (lenis) lenis.start();
      startHero();
    }, 700);
    setTimeout(() => intro.classList.add('is-gone'), 1900);
  }
  $('#introSkip').onclick = openIntro;
  intro.addEventListener('click', openIntro);
  window.addEventListener('wheel', openIntro, { once: true, passive: true });
  setTimeout(openIntro, reduce ? 100 : 3000);

  /* ------------------------------------------------------------------
     Hero slideshow
  ------------------------------------------------------------------ */
  const H = window.HERO, slidesEl = $('#heroSlides'), contentEl = $('#heroContent'), barsEl = $('#heroBars');
  const HERO_MS = 6500;
  let hi = 0, heroTimer = null;
  H.forEach((s, i) => {
    slidesEl.insertAdjacentHTML('beforeend', `<div class="hero__slide"><img src="${s.img}" alt="" ${i ? 'loading="lazy"' : ''}></div>`);
    const b = document.createElement('div'); b.className = 'hero__bar'; b.innerHTML = '<i></i>';
    b.style.setProperty('--dur', HERO_MS + 'ms'); b.onclick = () => showHero(i);
    barsEl.appendChild(b);
  });
  function showHero(i) {
    hi = wrap(i, H.length);
    $$('.hero__slide', slidesEl).forEach((s, k) => s.classList.toggle('is-on', k === hi));
    $$('.hero__bar', barsEl).forEach((b, k) => { b.classList.remove('is-on'); b.classList.toggle('is-done', k < hi); void b.offsetWidth; if (k === hi) b.classList.add('is-on'); });
    const s = H[hi];
    const chars = [...s.title].map((c, k) => c === ' ' ? ' ' : `<span class="ch" style="animation-delay:${(k * 0.03).toFixed(2)}s">${c}</span>`).join('');
    contentEl.innerHTML = (s.main ? `<div class="hero__chip">${s.eyebrow}</div>` : `<div class="hero__eyebrow">${s.eyebrow}</div>`) +
      `<h1 class="hero__title">${chars.replace(/(<span class="ch"[^>]*>[^<]<\/span>)+/g, (m) => `<span class="w" style="display:inline-block;white-space:nowrap">${m}</span>`)}</h1>` +
      `<p class="hero__text">${s.text}</p>` +
      (s.main ? `<div class="hero__cta"><a class="pill pill--red" href="#look">Try the Look <span class="pill__dot"><svg viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8"/></svg></span></a><a class="pill pill--ghost" href="#rack">Browse the Rack <span class="pill__dot"><svg viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8"/></svg></span></a></div>` : '');
    clearTimeout(heroTimer);
    heroTimer = setTimeout(() => showHero(hi + 1), HERO_MS);
  }
  function startHero() { showHero(0); }
  $$('.hero__slide')[0].classList.add('is-on');

  /* ------------------------------------------------------------------
     Ticker
  ------------------------------------------------------------------ */
  const tk = window.TICKER.map(([a, b]) => `<span><b>${a}</b>${b}<i>◆</i></span>`).join('');
  $('#ticker').innerHTML = tk + tk + tk;

  /* ------------------------------------------------------------------
     Six moods
  ------------------------------------------------------------------ */
  $('#arches').innerHTML = window.MOODS.map((m, i) => `
    <div class="arch" style="--d:${(i * 0.09).toFixed(2)}s;--r:${(i - 2.5) * 3}deg;--tint:${m.tint}">
      <div class="arch__frame"><div class="arch__clip"><img src="${m.img}" alt="${m.name}" loading="lazy"></div></div>
      <div class="arch__name">${m.name}</div>
    </div>`).join('');
  $$('.arch').forEach((a) => (a.onclick = () => scrollToEl($('#look'))));

  /* ------------------------------------------------------------------
     Try the Look
  ------------------------------------------------------------------ */
  const L = window.LOOKS, lookSec = $('#look'), strip = $('#lookStrip');
  let li = 0, detail = false, moving = false;
  L.forEach((lk, i) => {
    const m = document.createElement('div');
    m.className = 'model';
    m.innerHTML = `<div class="model__img"><img src="${lk.img}" alt="${lk.name}" loading="lazy"></div>` +
      lk.spots.map((p, k) => `<button class="spot" data-k="${k}" style="left:${p[0]}%;top:${p[1]}%">${k + 1}<span class="spot__tip">${P[lk.pieces[k]].name}<b>${money(P[lk.pieces[k]].price)}</b></span></button>`).join('') +
      `<div class="model__tag">${lk.name}</div>`;
    m.onclick = (e) => {
      if (e.target.closest('.spot')) return;
      if (i === li) setDetail(!detail); else goLook(i);
    };
    strip.appendChild(m);
  });
  const models = $$('.model', strip);
  function layoutLooks() {
    const w = $('#lookStage').clientWidth;
    const sp = Math.min(220, w * 0.2);
    models.forEach((m, i) => {
      const o = nearest(i - li, L.length), a = Math.abs(o);
      let tf, blur, op;
      if (detail) {
        tf = o === 0 ? `translateX(-50%) translateY(-2%) scale(1.42)` : `translateX(calc(-50% + ${o * sp * 2.6}px)) scale(.7)`;
        blur = o === 0 ? 0 : 12; op = o === 0 ? 1 : 0;
      } else {
        tf = `translateX(calc(-50% + ${o * sp}px)) scale(${1 - a * 0.1})`;
        blur = a * 1.6 + (moving ? 3 : 0); op = a > 3 ? 0 : 1 - a * 0.12;
      }
      m.style.transform = tf; m.style.filter = `blur(${blur}px)`; m.style.opacity = op; m.style.zIndex = 20 - a;
      m.classList.toggle('is-center', o === 0);
    });
    $('#lookCount').textContent = String(li + 1).padStart(2, '0') + ' / ' + String(L.length).padStart(2, '0');
    $('#lookLabel').innerHTML = `<small>LOOK ${String(li + 1).padStart(2, '0')}</small><span>${L[li].name}</span>`;
  }
  function renderPieces() {
    const lk = L[li];
    $('#lookPieces').innerHTML = lk.pieces.map((id, k) => `<li class="piece" data-k="${k}" style="--d:${k * 0.07}s"><img src="${P[id].img}" alt=""><div><div class="piece__name">${P[id].name}</div><div class="piece__price">${money(P[id].price)}</div></div><span class="piece__n">${k + 1}</span></li>`).join('');
    $('#lookTotal').textContent = money(lk.pieces.reduce((a, id) => a + P[id].price, 0));
    $$('.piece').forEach((p) => {
      p.onmouseenter = () => hot(+p.dataset.k, true); p.onmouseleave = () => hot(+p.dataset.k, false);
    });
  }
  function hot(k, on) {
    $$('.piece')[k] && $$('.piece')[k].classList.toggle('is-hot', on);
    const s = $$('.spot', models[li])[k]; s && s.classList.toggle('is-hot', on);
  }
  strip.addEventListener('mouseover', (e) => { const s = e.target.closest('.spot'); if (s) hot(+s.dataset.k, true); });
  strip.addEventListener('mouseout', (e) => { const s = e.target.closest('.spot'); if (s) hot(+s.dataset.k, false); });
  function goLook(i) {
    li = wrap(i, L.length); moving = true; layoutLooks(); renderPieces();
    clearTimeout(goLook.t); goLook.t = setTimeout(() => { moving = false; layoutLooks(); }, 450);
  }
  function setDetail(on) { detail = on; lookSec.classList.toggle('is-detail', on); layoutLooks(); }
  $('#lookPrev').onclick = () => goLook(li - 1);
  $('#lookNext').onclick = () => goLook(li + 1);
  $('#lookBack').onclick = () => setDetail(false);
  $('#lookAdd').onclick = (e) => {
    L[li].pieces.forEach((id, k) => setTimeout(() => addToBag({ name: P[id].name, price: P[id].price, img: P[id].img }, $$('.piece img')[k], true), k * 120));
    toast(`<b>${L[li].name}</b> — full look added to your bag`);
  };
  let lx = null;
  strip.addEventListener('pointerdown', (e) => { lx = e.clientX; });
  strip.addEventListener('pointerup', (e) => { if (lx !== null && Math.abs(e.clientX - lx) > 50) goLook(li + (e.clientX < lx ? 1 : -1)); lx = null; });
  layoutLooks(); renderPieces();
  window.addEventListener('resize', layoutLooks);

  /* ------------------------------------------------------------------
     Pick a Fit — 3D drifting deck
  ------------------------------------------------------------------ */
  const deck = $('#deck'), deckTrack = $('#deckTrack');
  const D = window.DECK;
  D.forEach((d) => {
    const p = P[d.id];
    const c = document.createElement('div');
    c.className = 'card'; c.style.setProperty('--bg-c', d.bg);
    c.innerHTML = `<div class="card__inner"><div class="card__title">${d.title[0]}<br>${d.title[1]}</div><div class="card__img"><img src="${p.img}" alt="${p.name}" draggable="false" loading="lazy"></div>
      <button class="card__fav" aria-label="Wishlist"><svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg></button>
      <div class="card__price">${money(p.price)}</div><button class="card__add" aria-label="Add ${p.name}">+</button><div class="card__shine"></div></div>`;
    c.dataset.id = d.id;
    deckTrack.appendChild(c);
  });
  const cards = $$('.card', deckTrack);
  let dpos = 0, dvel = 0, dragging = false, dragMoved = 0, hoverDeck = false, dLast = 0;
  function deckFrame() {
    const W = deck.clientWidth, cw = cards[0].offsetWidth, sp = cw + 20, total = sp * cards.length;
    if (!dragging) { dvel *= 0.94; dpos += dvel + (hoverDeck ? 0.08 : 0.55); }
    cards.forEach((c, i) => {
      const rel = nearest(i * sp - dpos, total);
      const d = Math.max(-1.6, Math.min(1.6, rel / (W / 2)));
      const a = Math.abs(d);
      c.style.transform = `translate3d(${W / 2 + rel - cw / 2}px, ${a * a * 26}px, ${-a * 150}px) rotateY(${-d * 26}deg) rotateZ(${d * 2.5}deg) scale(${1 - a * 0.04})`;
      c.style.zIndex = 100 - Math.round(a * 10);
      c.style.opacity = a > 1.45 ? Math.max(0, (1.6 - a) / 0.15) : 1;
    });
    requestAnimationFrame(deckFrame);
  }
  requestAnimationFrame(deckFrame);
  deck.addEventListener('pointerenter', () => (hoverDeck = true));
  deck.addEventListener('pointerleave', () => { hoverDeck = false; cards.forEach((c) => { c.querySelector('.card__inner').style.transform = ''; c.classList.remove('is-press'); }); });
  deck.addEventListener('pointerdown', (e) => {
    dragging = true; dragMoved = 0; dLast = e.clientX; deck.classList.add('is-drag');
    const c = e.target.closest('.card'); if (c) c.classList.add('is-press');
  });
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
    if (e.target.closest('.card__add')) addProduct(c.dataset.id, c.querySelector('.card__img img'));
    else if (e.target.closest('.card__fav')) { e.target.closest('.card__fav').classList.toggle('is-on'); toast('Saved to your wishlist'); }
  });

  /* ------------------------------------------------------------------
     The Rack
  ------------------------------------------------------------------ */
  const R = window.RACK, rackSec = $('#rack'), railItems = $('#railItems');
  let rcat = 'all', rlist = [], rfocus = -1;
  $('#chips').innerHTML = window.RACK_CATS.map((c) => `<button class="chip ${c.key === 'all' ? 'is-on' : ''}" data-k="${c.key}">${c.label} <i>${c.key === 'all' ? R.length : R.filter((r) => r.cat === c.key).length}</i></button>`).join('');
  $('#chips').onclick = (e) => { const b = e.target.closest('.chip'); if (!b || b.dataset.k === rcat) return; $$('.chip').forEach((c) => c.classList.toggle('is-on', c === b)); setRack(b.dataset.k); };
  function rackPositions() {
    const W = railItems.clientWidth, n = rlist.length;
    const gw = $('.garment', railItems) ? $('.garment', railItems).offsetWidth : 150;
    const ideal = gw * 0.95;
    const span = Math.min(W, ideal * n);
    const start = (W - span) / 2;
    return rlist.map((_, i) => start + span * ((i + 0.5) / n));
  }
  function layoutRack() {
    const xs = rackPositions(), els = $$('.garment:not(.is-leave)', railItems);
    const W = railItems.clientWidth;
    els.forEach((g, i) => {
      g.style.left = xs[i] + 'px';
      if (rfocus === i) {
        g.style.transform = `translateX(${W / 2 - xs[i]}px) translateY(6px) scale(1.32)`;
      } else if (rfocus >= 0) {
        g.style.transform = `translateX(${(xs[i] < xs[rfocus] ? -1 : 1) * 30}px) scale(.92)`;
      } else g.style.transform = '';
      g.classList.toggle('is-focus', rfocus === i);
    });
    const span = xs.length ? xs[xs.length - 1] - xs[0] : 0;
    $('.rail__bar').style.margin = `0 ${Math.max(2, (W - span) / 2 / W * 100 - 6)}%`;
    $('#rackMicro').textContent = `The rack · ${rlist.length} pieces`;
  }
  function setRack(cat) {
    rcat = cat; unfocus();
    const old = $$('.garment', railItems);
    old.forEach((g) => g.classList.add('is-leave'));
    setTimeout(() => {
      old.forEach((g) => g.remove());
      rlist = R.filter((r) => cat === 'all' || r.cat === cat);
      rlist.forEach((it, i) => {
        const g = document.createElement('div');
        g.className = 'garment is-enter';
        g.style.setProperty('--d', (i * 0.045).toFixed(2) + 's');
        g.innerHTML = `<div class="garment__swing" style="--sw:${(3 + Math.random() * 1.6).toFixed(2)}s;--sd:${(-Math.random() * 3).toFixed(2)}s"><div class="garment__flip"><div class="garment__face">${window.garmentSVG(it)}</div><div class="garment__back">${window.garmentSVG(it, true)}</div></div></div>`;
        g.onclick = (e) => { e.stopPropagation(); focusRack(i); };
        g.addEventListener('animationend', (e) => { if (e.animationName === 'garmentIn') g.classList.remove('is-enter'); });
        railItems.appendChild(g);
      });
      layoutRack();
    }, old.length ? 480 : 0);
  }
  function focusRack(i) {
    rfocus = wrap(i, rlist.length);
    rackSec.classList.add('is-focus');
    const it = rlist[rfocus];
    $('#rdName').textContent = it.name;
    $('#rdPrice').textContent = money(it.price);
    const sizes = it.cat === 'shoes' ? ['7', '8', '9', '10', '11'] : it.cat === 'acc' ? ['OS'] : ['S', 'M', 'L', 'XL'];
    $('#rdSizes').innerHTML = sizes.map((s, k) => `<button class="${k === Math.min(1, sizes.length - 1) ? 'is-on' : ''}">${s}</button>`).join('');
    $$('#rdSide button').forEach((b) => b.classList.toggle('is-on', b.dataset.side === 'front'));
    $$('.garment__flip', railItems).forEach((f) => f.classList.remove('is-back'));
    layoutRack();
  }
  function unfocus() { rfocus = -1; rackSec.classList.remove('is-focus'); $$('.garment__flip', railItems).forEach((f) => f.classList.remove('is-back')); layoutRack(); }
  $('#rdSizes').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; $$('#rdSizes button').forEach((x) => x.classList.toggle('is-on', x === b)); };
  $('#rdSide').onclick = (e) => {
    const b = e.target.closest('button'); if (!b || rfocus < 0) return;
    $$('#rdSide button').forEach((x) => x.classList.toggle('is-on', x === b));
    $$('.garment', railItems)[rfocus].querySelector('.garment__flip').classList.toggle('is-back', b.dataset.side === 'back');
  };
  $('#rdAdd').onclick = (e) => {
    const it = rlist[rfocus]; if (!it) return;
    const size = $('#rdSizes .is-on') ? $('#rdSizes .is-on').textContent : '';
    const g = $$('.garment', railItems)[rfocus];
    addToBag({ name: `${it.name}${size && size !== 'OS' ? ' · ' + size : ''}`, price: it.price, svg: window.garmentSVG(it) }, g.querySelector('.garment__face'));
    e.currentTarget.textContent = 'Added to bag';
    setTimeout(() => ($('#rdAdd').textContent = 'Add to bag'), 1600);
  };
  $('#rackDetail .heart').onclick = (e) => e.currentTarget.classList.toggle('is-on');
  $('#rackPrev').onclick = () => focusRack(rfocus - 1);
  $('#rackNext').onclick = () => focusRack(rfocus + 1);
  $('#rackStage').addEventListener('click', (e) => { if (rfocus >= 0 && !e.target.closest('.garment, .rack__detail, .rack__arrow')) unfocus(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { if (story.classList.contains('is-open')) closeStory(); else if (rfocus >= 0) unfocus(); else if (detail) setDetail(false); openDrawer(false); }
    if (rfocus >= 0 && e.key === 'ArrowRight') focusRack(rfocus + 1);
    if (rfocus >= 0 && e.key === 'ArrowLeft') focusRack(rfocus - 1);
  });
  setRack('all');
  window.addEventListener('resize', layoutRack);

  /* ------------------------------------------------------------------
     Built for the block — drifting product cards
  ------------------------------------------------------------------ */
  const DV = window.DEVOTE, dTrack = $('#devoteTrack');
  const dcard = (d, i) => `<article class="dcard" style="--rot:${((i % 3) - 1) * 1.2}deg"><img src="${d.img}" alt="${d.name}" loading="lazy" draggable="false"><span class="dcard__n">${String(i + 1).padStart(2, '0')}</span><div class="dcard__body"><div class="dcard__cat">${d.cat}</div><div class="dcard__name">${d.name}</div><div class="dcard__desc">${d.desc}</div><div class="dcard__row"><span class="dcard__price">${money(d.price)}</span><button class="dcard__add" data-i="${i}">ADD TO CART +</button></div></div></article>`;
  dTrack.innerHTML = DV.map(dcard).join('') + DV.map(dcard).join('');
  let tpos = 0, tdrag = false, tlast = 0, tmoved = 0, thover = false;
  (function tick() {
    const half = dTrack.scrollWidth / 2;
    if (!tdrag) tpos += thover ? 0.15 : 0.6;
    tpos = wrap(tpos, half);
    dTrack.style.transform = `translateX(${-tpos}px)`;
    requestAnimationFrame(tick);
  })();
  const dRail = $('#devoteRail');
  dRail.addEventListener('pointerenter', () => (thover = true));
  dRail.addEventListener('pointerleave', () => (thover = false));
  dRail.addEventListener('pointerdown', (e) => { tdrag = true; tlast = e.clientX; tmoved = 0; });
  window.addEventListener('pointermove', (e) => { if (!tdrag) return; const dx = e.clientX - tlast; tlast = e.clientX; tpos -= dx; tmoved += Math.abs(dx); });
  window.addEventListener('pointerup', () => (tdrag = false));
  dTrack.addEventListener('click', (e) => {
    const b = e.target.closest('.dcard__add'); if (!b || tmoved > 6) return;
    const d = DV[+b.dataset.i];
    addToBag({ name: d.name, price: d.price, img: d.img }, b.closest('.dcard').querySelector('img'));
  });

  /* ------------------------------------------------------------------
     Feel the fit — film + drifting photo columns
  ------------------------------------------------------------------ */
  const col = (arr) => [...arr, ...arr].map((s) => `<img src="${s}" alt="" loading="lazy">`).join('');
  $('#feelL').innerHTML = col(window.FEEL_L);
  $('#feelR').innerHTML = col(window.FEEL_R);
  const F = window.FILM, film = $('#film'), frames = $('#filmFrames');
  frames.innerHTML = F.map((s, i) => `<div class="film__frame" style="--kx:${i % 2 ? -3 : 3}%;--ky:${i % 3 ? 2 : -2}%"><img src="${s}" alt="" loading="lazy"></div>`).join('');
  let fi = -1, fPlaying = true, fStart = 0, fElapsed = 0;
  const FILM_MS = 5000;
  function filmNext() { fi = wrap(fi + 1, F.length); $$('.film__frame', frames).forEach((f, k) => f.classList.toggle('is-on', k === fi)); fStart = performance.now(); fElapsed = 0; }
  filmNext();
  (function ftick(now) {
    if (fPlaying) { fElapsed = now - fStart; if (fElapsed >= FILM_MS) filmNext(); }
    $('#filmProg').style.width = Math.min(100, (fElapsed / FILM_MS) * 100) + '%';
    requestAnimationFrame(ftick);
  })(performance.now());
  $('#filmPlay').onclick = () => {
    fPlaying = !fPlaying; film.classList.toggle('is-paused', !fPlaying);
    if (fPlaying) fStart = performance.now() - fElapsed;
    $$('.film__frame.is-on img', frames).forEach((im) => (im.style.animationPlayState = fPlaying ? 'running' : 'paused'));
    $('#filmPlay').innerHTML = fPlaying ? '<svg viewBox="0 0 24 24"><path d="M8 5v14M16 5v14"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M7 5l12 7-12 7z"/></svg>';
  };

  /* ------------------------------------------------------------------
     Reels — coverflow + story viewer
  ------------------------------------------------------------------ */
  const RL = window.REELS, reelsRow = $('#reelsRow');
  let ri = 3, reelsPaused = false;
  RL.forEach((r, i) => {
    const el = document.createElement('div');
    el.className = 'reel';
    el.innerHTML = `<img src="${r.img}" alt="${r.name}" loading="lazy"><div class="reel__top"><span>◆ REEL ${String(i + 1).padStart(2, '0')}</span><span>${r.dur}</span></div><div class="reel__play"></div><div class="reel__body"><div class="reel__cat">${r.cat}</div><div class="reel__name">${r.name}</div><div class="reel__place">${r.place}</div></div>`;
    el.onclick = () => (i === ri ? openStory(i) : layoutReels(i));
    reelsRow.appendChild(el);
  });
  const reels = $$('.reel', reelsRow);
  function layoutReels(i = ri) {
    ri = wrap(i, RL.length);
    const w = reels[0].offsetWidth, W = reelsRow.clientWidth;
    const sp = Math.min(w * 0.98, (W - w) / 6.2);
    reels.forEach((el, k) => {
      const o = nearest(k - ri, RL.length), a = Math.abs(o);
      el.style.transform = `translateX(${o * sp * (1 + a * 0.06)}px) translateZ(${-a * 90}px) rotateY(${-o * 8}deg) scale(${o === 0 ? 1.18 : 1 - a * 0.1})`;
      el.style.zIndex = 20 - a; el.style.opacity = a > 3 ? 0 : 1; el.style.filter = `brightness(${1 - a * 0.08})`;
      el.classList.toggle('is-center', o === 0);
    });
  }
  layoutReels();
  window.addEventListener('resize', () => layoutReels());
  setInterval(() => { if (!reelsPaused && !story.classList.contains('is-open')) layoutReels(ri + 1); }, 3600);
  $('#reelsPause').onclick = (e) => {
    reelsPaused = !reelsPaused;
    e.currentTarget.innerHTML = reelsPaused ? '<svg viewBox="0 0 24 24"><path d="M8 6l10 6-10 6z"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M9 6v12M15 6v12"/></svg>';
  };

  const story = $('#story'), stage = $('#storyStage'), sbg = $('#storyBg');
  const STORY_MS = 6000;
  let si = 0, sStart = 0, sElapsed = 0, sHold = false, sRAF = null;
  RL.forEach((r) => {
    const c = document.createElement('div');
    c.className = 'story__card';
    c.innerHTML = `<img src="${r.img}" alt="${r.name}"><div class="story__side-name">${r.name}</div>
      <div class="story__ui">
        <div class="story__bars">${RL.map(() => '<span><i></i></span>').join('')}</div>
        <div class="story__head"><div class="story__av">K</div><div class="story__who">korva<small>${r.place}</small></div>
          <div class="story__icons"><button class="s-mute" aria-label="Mute"><svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9a4 4 0 0 1 0 6"/></svg></button><button class="s-close" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div></div>
        <div class="story__body"><div class="story__cat">${r.cat}</div><div class="story__name">${r.name}</div><div class="story__desc">${r.desc}</div>
          <div class="story__row"><span class="story__price">${money(r.price)}</span><button class="pill pill--red s-add">Add to bag</button><button class="story__heart" aria-label="Save"><svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg></button><a class="story__more" href="#rack">More fits</a></div></div>
      </div>`;
    stage.appendChild(c);
  });
  const scards = $$('.story__card', stage);
  function layoutStory() {
    scards.forEach((c, k) => {
      const o = nearest(k - si, RL.length), a = Math.abs(o);
      c.classList.toggle('is-cur', o === 0); c.classList.toggle('is-side', a === 1);
      let tf, op = 1, fl = 'none';
      if (o === 0) tf = 'translate(-50%,-50%)';
      else if (a === 1) { tf = `translate(calc(-50% + ${o * 300}px), -50%) translateZ(-200px) rotateY(${-o * 24}deg) scale(.5)`; fl = 'brightness(.75)'; }
      else { tf = `translate(calc(-50% + ${o * 420}px), -50%) translateZ(-400px) scale(.3)`; op = 0; }
      if (innerWidth < 700 && o !== 0) { tf = `translate(calc(-50% + ${o * 110}%), -50%) scale(.8)`; op = 0; }
      c.style.transform = tf; c.style.opacity = op; c.style.filter = fl; c.style.zIndex = 10 - a;
      c.style.pointerEvents = a <= 1 ? 'auto' : 'none';
      $$('.story__bars span', c).forEach((b, j) => { b.classList.toggle('done', j < si); b.querySelector('i').style.width = j < si ? '100%' : '0'; });
    });
    sbg.style.backgroundImage = `url(${RL[si].img})`;
    sbg.style.setProperty('--tint', RL[si].tint);
    sStart = performance.now(); sElapsed = 0;
  }
  function stick(now) {
    sRAF = requestAnimationFrame(stick);
    if (sHold) { sStart = now - sElapsed; return; }
    sElapsed = now - sStart;
    const bar = $$('.story__bars span', scards[si])[si];
    if (bar) bar.querySelector('i').style.width = Math.min(100, (sElapsed / STORY_MS) * 100) + '%';
    if (sElapsed >= STORY_MS) { if (si === RL.length - 1) closeStory(); else { si++; layoutStory(); } }
  }
  function openStory(i) { si = i; story.classList.add('is-open'); story.setAttribute('aria-hidden', 'false'); lockScroll(true); layoutStory(); cancelAnimationFrame(sRAF); sRAF = requestAnimationFrame(stick); }
  function closeStory() { story.classList.remove('is-open'); story.setAttribute('aria-hidden', 'true'); lockScroll(false); cancelAnimationFrame(sRAF); }
  let sy = null, sx = null, sDownT = 0;
  stage.addEventListener('pointerdown', (e) => { sy = e.clientY; sx = e.clientX; sDownT = performance.now(); if (e.target.closest('.story__card.is-cur')) sHold = true; });
  stage.addEventListener('pointerup', (e) => {
    sHold = false;
    if (sy === null) return;
    const dy = e.clientY - sy, dx = e.clientX - sx, held = performance.now() - sDownT > 350; sy = null;
    if (dy > 90) { closeStory(); return; }
    if (Math.abs(dx) > 60) { si = wrap(si + (dx < 0 ? 1 : -1), RL.length); layoutStory(); return; }
    if (held) return;
    const card = e.target.closest('.story__card');
    if (e.target.closest('.s-close')) { closeStory(); return; }
    if (e.target.closest('.s-mute')) { e.target.closest('.s-mute').style.opacity = e.target.closest('.s-mute').style.opacity === '0.4' ? '1' : '0.4'; return; }
    if (e.target.closest('.s-add')) { const r = RL[si]; addToBag({ name: r.name, price: r.price, img: r.img }, card.querySelector('img')); return; }
    if (e.target.closest('.story__heart')) { e.target.closest('.story__heart').classList.toggle('is-on'); return; }
    if (e.target.closest('.story__more')) { closeStory(); return; }
    if (!card) { closeStory(); return; }
    const k = scards.indexOf(card);
    if (k !== si) { si = k; layoutStory(); return; }
    const r = card.getBoundingClientRect();
    if (e.clientX < r.left + r.width / 3) { si = wrap(si - 1, RL.length); layoutStory(); }
    else if (e.clientX > r.left + (r.width * 2) / 3) { if (si === RL.length - 1) closeStory(); else { si++; layoutStory(); } }
  });

  /* ------------------------------------------------------------------
     Signature collection — fan of arches
  ------------------------------------------------------------------ */
  const SG = window.SIGNATURE, fan = $('#fan');
  let gi = 3, fanHover = false;
  SG.forEach((s, i) => {
    const a = document.createElement('div');
    a.className = 'arc';
    a.innerHTML = `<img src="${s.img}" alt="${s.name}" loading="lazy">`;
    a.onclick = () => showSig(i);
    fan.appendChild(a);
    $('#sigDots').insertAdjacentHTML('beforeend', `<button aria-label="${s.name}"></button>`);
  });
  $$('#sigDots button').forEach((b, i) => (b.onclick = () => showSig(i)));
  const arcs = $$('.arc', fan);
  function showSig(i) {
    gi = wrap(i, SG.length);
    arcs.forEach((a, k) => {
      const o = nearest(k - gi, SG.length), ab = Math.abs(o);
      const sp = a.offsetWidth * 0.66;
      a.style.transform = `translateX(${o * sp * (1 - ab * 0.04)}px) translateY(${ab * 8 - (o === 0 ? 14 : 0)}px) rotate(${o * 8}deg) scale(${o === 0 ? 1.12 : 1 - ab * 0.1})`;
      a.style.filter = `blur(${ab > 0 ? ab * 1.2 : 0}px) saturate(${1 - ab * 0.15})`;
      a.style.opacity = ab > 3 ? 0 : 1 - ab * 0.12; a.style.zIndex = 10 - ab;
    });
    const s = SG[gi];
    $('#sigName').innerHTML = [...s.name].map((c, k) => c === ' ' ? ' ' : `<span class="ch" style="animation-delay:${k * 0.025}s">${c}</span>`).join('');
    $('#sigSub').textContent = `${s.sub} · ${money(s.price)}`;
    $$('#sigDots button').forEach((b, k) => b.classList.toggle('is-on', k === gi));
  }
  showSig(gi);
  fan.addEventListener('pointerenter', () => (fanHover = true));
  fan.addEventListener('pointerleave', () => (fanHover = false));
  setInterval(() => { if (!fanHover) showSig(gi + 1); }, 3400);
  $('#sigAdd').onclick = () => { const s = SG[gi]; addToBag({ name: s.name, price: s.price, img: s.img }, arcs[gi]); };

  /* ------------------------------------------------------------------
     Three pieces, one fit
  ------------------------------------------------------------------ */
  const FB = window.FABRICS, mixSec = $('#mix');
  const weave = window.Weave($('#weave'), FB);
  const ROMAN = ['I', 'II', 'III'];
  let sel = [];
  $('#swatches').innerHTML = FB.map((f, i) => `<button class="sw" data-i="${i}" title="${f.name}" aria-label="${f.name}" style="background-image:url(${weave.swatchURLs[i]})"></button>`).join('');
  function renderMix() {
    $('#mixSlots').innerHTML = [0, 1, 2].map((k) => {
      const f = sel[k] !== undefined ? FB[sel[k]] : null;
      return `<li class="${f ? 'is-full' : ''}"><b>${ROMAN[k]}</b><span>${f ? f.name : 'A thread, waiting'}</span><button data-k="${k}" aria-label="Remove">×</button></li>`;
    }).join('');
    $$('.sw').forEach((s) => { const k = sel.indexOf(+s.dataset.i); s.classList.toggle('is-on', k >= 0); s.dataset.n = k >= 0 ? ROMAN[k] : ''; });
    const sum = sel.reduce((a, i) => a + FB[i].price, 0), full = sel.length === 3;
    mixSec.classList.toggle('is-full', full);
    $('#mixWas').textContent = full ? money(sum) : '';
    $('#mixNow').textContent = money(full ? sum * 0.9 : sum);
    $('#mixLeft').textContent = full ? 'Woven as one · 10% off' : `${3 - sel.length} more to weave`;
    $('#mixPrompt').textContent = full ? 'Woven as one' : sel.length ? FB[sel[sel.length - 1]].name : 'Choose a fabric to weave it in';
    weave.set([0, 1, 2].map((k) => (sel[k] !== undefined ? sel[k] : null)));
  }
  $('#swatches').onclick = (e) => {
    const s = e.target.closest('.sw'); if (!s) return;
    const i = +s.dataset.i, k = sel.indexOf(i);
    if (k >= 0) sel.splice(k, 1); else if (sel.length < 3) sel.push(i); else return;
    renderMix();
  };
  $('#swatches').addEventListener('mouseover', (e) => { const s = e.target.closest('.sw'); if (s && sel.length < 3) $('#mixPrompt').textContent = `${FB[+s.dataset.i].name} · ${money(FB[+s.dataset.i].price)}`; });
  $('#swatches').addEventListener('mouseleave', () => renderMix());
  $('#mixSlots').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; sel.splice(+b.dataset.k, 1); renderMix(); };
  $('#mixAdd').onclick = (e) => {
    const sum = sel.reduce((a, i) => a + FB[i].price, 0), saved = sum * 0.1;
    addToBag({ name: 'Capsule: ' + sel.map((i) => FB[i].name).join(' + '), price: sum * 0.9, bg: weave.swatchURLs[sel[0]] }, e.currentTarget, true);
    const t = $('#mixToast'); t.textContent = `Woven and in your bag. You saved ${money(saved)}.`; t.classList.add('is-on');
    setTimeout(() => { t.classList.remove('is-on'); sel = []; renderMix(); }, 2600);
  };
  renderMix();

  /* ------------------------------------------------------------------
     Footer + scroll-linked bits
  ------------------------------------------------------------------ */
  $('#newsForm').onsubmit = (e) => { e.preventDefault(); e.target.reset(); toast('You are on the list — <b>welcome to KORVA</b>'); };

  function onScroll() {
    updateActive();
    const r = film.getBoundingClientRect(), vh = innerHeight;
    const p = Math.max(0, Math.min(1, 1 - (r.top + r.height / 2 - vh / 2) / vh));
    film.style.setProperty('--fs', (0.84 + 0.16 * p).toFixed(3));
  }
  if (lenis) lenis.on('scroll', onScroll); else window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  observeReveal();
})();
