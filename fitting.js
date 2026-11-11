/* =====================================================================
   KORVA — The Fitting Room
   Garments hang on a curved rail and swing forward one by one; switch to
   "On model" to see the same piece worn, turning 360° (auto or drag).
   ===================================================================== */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const P = window.PRODUCTS, F = window.FITTING;
  const stage = $('#fitStage'); if (!stage || !F) return;
  const money = (n) => window.fmtNZD(n);
  const wrap = (v, n) => ((v % n) + n) % n;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FRAMES = 8;
  const frameSrc = (set, i) => `assets/fitting/${set}-${i}.webp`;
  const HANGER = '<svg class="fg__hanger" viewBox="0 0 120 46"><path d="M60 2c6 0 9 4 9 8 0 5-9 7-9 13v5" fill="none" stroke="#a7a9b0" stroke-width="3" stroke-linecap="round"/><path d="M60 28 L9 41 c-5 2-3 5 1 5 h100 c4 0 6-3 1-5 Z" fill="#d9c3a5" stroke="#b39a78" stroke-width="2" stroke-linejoin="round"/></svg>';

  let cur = 0, mode = 'rail', busy = false, hover = false, visible = false;

  /* ---------------- rail: build garments ---------------- */
  const queue = $('#fitQueue');
  F.forEach((f, i) => {
    const p = P[f.id], g = document.createElement('div');
    g.className = 'fg'; g.dataset.i = i;
    g.innerHTML = `<div class="fg__swing">${p.hanger ? HANGER : ''}<img class="fg__shadow" src="${p.img}" alt="" aria-hidden="true"><img class="fg__img" src="${p.img}" alt="${p.name}" draggable="false"></div>`;
    g.onclick = () => { if (i !== cur) go(i); };
    queue.appendChild(g);
  });
  const garments = $$('.fg', queue);

  function place(skipIndex) {
    const n = F.length;
    garments.forEach((g, i) => {
      if (i === skipIndex) return;
      const o = wrap(i - cur, n);
      g.style.setProperty('--o', o);
      g.classList.toggle('is-front', o === 0);
      g.style.zIndex = 20 - o;
    });
  }

  /* ---------------- card + thumbs ---------------- */
  const thumbs = $('#fitThumbs');
  thumbs.innerHTML = F.map((f, i) => `<button class="fthumb" data-i="${i}" aria-label="${P[f.id].name}"><img src="${P[f.id].img}" alt=""></button>`).join('');
  thumbs.onclick = (e) => { const b = e.target.closest('.fthumb'); if (b) go(+b.dataset.i); };
  function card() {
    const f = F[cur], p = P[f.id];
    $('#fitIdx').textContent = `${String(cur + 1).padStart(2, '0')} / ${String(F.length).padStart(2, '0')}`;
    $('#fitCat').textContent = (p.drop ? 'AFTERHOURS · ' : '') + window.CAT_LABEL[p.cat];
    $('#fitName').textContent = p.name;
    $('#fitPrice').textContent = money(p.price);
    $('#fitColour').innerHTML = `<i style="background:${p.color}"></i>${f.colour}`;
    $('#fitDesc').textContent = p.desc;
    const sizes = window.SIZES[p.cat];
    $('#fitSizes').innerHTML = sizes.map((s, k) => `<button class="${k === 1 ? 'is-on' : ''}">${s}</button>`).join('');
    $('#fitLook').innerHTML = f.look.filter((id) => id !== f.id).map((id) => `<span title="${P[id].name}"><img src="${P[id].img}" alt="${P[id].name}"></span>`).join('');
    $('#fitLookTotal').textContent = money(f.look.reduce((a, id) => a + P[id].price, 0));
    $$('.fthumb', thumbs).forEach((b, k) => b.classList.toggle('is-on', k === cur));
    $('#fitCard').classList.remove('is-swap'); void $('#fitCard').offsetWidth; $('#fitCard').classList.add('is-swap');
  }
  $('#fitSizes').onclick = (e) => { const b = e.target.closest('button'); if (b) $$('#fitSizes button').forEach((x) => x.classList.toggle('is-on', x === b)); };
  $('#fitAdd').onclick = (e) => {
    const f = F[cur];
    window.KORVA.addToBag(f.id, mode === 'rail' ? garments[cur].querySelector('.fg__img') : $('#fitA'), { size: $('#fitSizes .is-on').textContent });
    e.currentTarget.textContent = 'Added'; setTimeout(() => ($('#fitAdd').textContent = 'Add to bag'), 1400);
  };
  $('#fitAddLook').onclick = () => {
    const f = F[cur];
    f.look.forEach((id, k) => setTimeout(() => window.KORVA.addToBag(id, $('#fitLook img') || $('#fitA'), { quiet: true }), k * 120));
    window.KORVA.toast(`<b>Full look</b> ${f.look.length} pieces added`);
  };

  /* ---------------- switching garments ---------------- */
  function go(i) {
    if (busy || i === cur) return;
    busy = true;
    const prev = cur;
    cur = wrap(i, F.length);
    card();
    if (mode === 'model') { loadModel(true); setTimeout(() => (busy = false), 500); place(); return; }
    const out = garments[prev];
    out.classList.add('is-out');                  // swings off to the side
    place(prev);
    setTimeout(() => {
      out.classList.add('no-anim'); out.classList.remove('is-out');
      place();                                    // re-hung at the back of the rail
      void out.offsetWidth; out.classList.remove('no-anim');
      busy = false;
    }, reduce ? 0 : 620);
  }
  $('#fitPrev').onclick = () => go(cur - 1);
  $('#fitNext').onclick = () => go(cur + 1);
  stage.addEventListener('mouseenter', () => (hover = true));
  stage.addEventListener('mouseleave', () => (hover = false));
  new IntersectionObserver((e) => { visible = e[0].isIntersecting; }, { threshold: 0.35 }).observe(stage);
  setInterval(() => { if (visible && !hover && mode === 'rail' && !reduce) go(cur + 1); }, 4800);

  /* ---------------- on-model 360 ---------------- */
  const A = $('#fitA'), B = $('#fitB');
  let frame = 0, front = A, back = B, spinT = null, dragging = false, lastX = 0, acc = 0, resumeAt = 0;
  const cache = {};
  function preload(set) { if (cache[set]) return; cache[set] = true; for (let i = 0; i < FRAMES; i++) { const im = new Image(); im.src = frameSrc(set, i); } }
  function show(i) {
    frame = wrap(i, FRAMES);
    const set = F[cur].set;
    back.src = frameSrc(set, frame);
    back.classList.add('is-on'); front.classList.remove('is-on');
    [front, back] = [back, front];
    const deg = frame * 45;
    $('#fitDeg').textContent = String(deg).padStart(3, '0') + '°';
    $('#fitDot').style.transform = `rotate(${deg}deg)`;
  }
  function loadModel(withFlash) {
    const set = F[cur].set; preload(set);
    if (withFlash) flash();
    frame = 0; front.src = frameSrc(set, 0); front.classList.add('is-on'); back.classList.remove('is-on');
    $('#fitDeg').textContent = '000°'; $('#fitDot').style.transform = 'rotate(0deg)';
  }
  function spin() {
    clearInterval(spinT);
    spinT = setInterval(() => { if (mode === 'model' && !dragging && performance.now() > resumeAt) show(frame + 1); }, 420);
  }
  const model = $('#fitModel');
  model.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; acc = 0; model.setPointerCapture(e.pointerId); model.classList.add('is-drag'); });
  model.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    acc += e.clientX - lastX; lastX = e.clientX;
    while (Math.abs(acc) > 46) { show(frame + (acc > 0 ? -1 : 1)); acc -= Math.sign(acc) * 46; }
  });
  const endDrag = () => { if (!dragging) return; dragging = false; model.classList.remove('is-drag'); resumeAt = performance.now() + 2200; };
  model.addEventListener('pointerup', endDrag); model.addEventListener('pointercancel', endDrag);

  /* ---------------- mode toggle ---------------- */
  function flash() { const fl = $('#fitFlash'); if (reduce) return; fl.classList.remove('go'); void fl.offsetWidth; fl.classList.add('go'); }
  function setMode(m) {
    if (m === mode) return;
    mode = m; flash();
    stage.classList.toggle('is-model', m === 'model');
    $$('#fitToggle button').forEach((b) => b.classList.toggle('is-on', b.dataset.mode === m));
    if (m === 'model') { loadModel(false); spin(); } else clearInterval(spinT);
  }
  $('#fitToggle').onclick = (e) => { const b = e.target.closest('button'); if (b) setMode(b.dataset.mode); };
  $('#fitTry').onclick = () => setMode(mode === 'model' ? 'rail' : 'model');

  document.addEventListener('keydown', (e) => {
    if (!visible || e.target.closest('input, textarea')) return;
    if (e.key === 'ArrowRight') { mode === 'model' ? show(frame + 1) : go(cur + 1); }
    if (e.key === 'ArrowLeft') { mode === 'model' ? show(frame - 1) : go(cur - 1); }
  });

  place(); card();
  F.forEach((f) => preload(f.set));
})();
