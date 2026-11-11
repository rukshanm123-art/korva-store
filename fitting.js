/* =====================================================================
   KORVA — The Fitting Room
   Tees and pants hang on a curved rail and swing forward one by one; shoes
   sit on a lit shelf. Switch to "On model" to see the piece worn while the
   model turns 360° (auto or drag); pants and shoes get a closer camera.
   If a real turnaround video exists for a look (assets/fitting/<set>.mp4),
   it is used instead of the 8-angle frames.
   ===================================================================== */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const P = window.PRODUCTS, FIT = window.FITTING;
  const stage = $('#fitStage'); if (!stage || !FIT) return;
  const money = (n) => window.fmtNZD(n);
  const wrap = (v, n) => ((v % n) + n) % n;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FRAMES = 8;
  const frameSrc = (set, i) => `assets/fitting/${set}-${i}.webp`;
  const VIDEOS = window.FITTING_VIDEOS || {};
  const HANGER = '<svg class="fg__hanger" viewBox="0 0 120 46"><path d="M60 2c6 0 9 4 9 8 0 5-9 7-9 13v5" fill="none" stroke="#a7a9b0" stroke-width="3" stroke-linecap="round"/><path d="M60 28 L9 41 c-5 2-3 5 1 5 h100 c4 0 6-3 1-5 Z" fill="#d9c3a5" stroke="#b39a78" stroke-width="2" stroke-linejoin="round"/></svg>';
  const CLIPS = '<svg class="fg__hanger fg__hanger--clips" viewBox="0 0 120 46"><path d="M60 2c6 0 9 4 9 8 0 5-9 7-9 13v8" fill="none" stroke="#a7a9b0" stroke-width="3" stroke-linecap="round"/><path d="M14 32 H106" stroke="#b9bbc2" stroke-width="5" stroke-linecap="round"/><rect x="18" y="30" width="12" height="16" rx="2" fill="#8d8f97"/><rect x="90" y="30" width="12" height="16" rx="2" fill="#8d8f97"/></svg>';
  const CAM = { tees: { z: 1, y: 0, bg: 1 }, pants: { z: 1.75, y: -4, bg: 1.12 }, shoes: { z: 3.3, y: -12, bg: 1.3 } };

  let cat = 'tees', F = FIT[cat], cur = 0, mode = 'rail', busy = false, hover = false, visible = false;
  let garments = [];
  const queue = $('#fitQueue');

  /* ---------------- build a category ---------------- */
  function build() {
    F = FIT[cat]; cur = 0;
    stage.dataset.cat = cat;
    queue.innerHTML = '';
    queue.classList.toggle('is-shelf', cat === 'shoes');
    F.forEach((f, i) => {
      const p = P[f.id], g = document.createElement('div');
      g.className = 'fg'; g.dataset.i = i;
      const hang = cat === 'shoes' ? '' : p.hanger ? (p.cat === 'pants' ? CLIPS : HANGER) : '';
      g.innerHTML = `<div class="fg__swing">${hang}<img class="fg__shadow" src="${p.img}" alt="" aria-hidden="true"><img class="fg__img" src="${p.img}" alt="${p.name}" draggable="false">${cat === 'shoes' ? '<span class="fg__plinth"></span>' : ''}</div>`;
      g.onclick = () => { if (i !== cur) go(i); };
      queue.appendChild(g);
    });
    garments = $$('.fg', queue);
    $('#fitThumbs').innerHTML = F.map((f, i) => `<button class="fthumb" data-i="${i}" aria-label="${P[f.id].name}"><img src="${P[f.id].img}" alt=""></button>`).join('');
    $$('#fitCats button').forEach((b) => b.classList.toggle('is-on', b.dataset.cat === cat));
    $('#fitRailBtn').textContent = cat === 'shoes' ? 'On the shelf' : 'On the rail';
    place(); card();
    if (mode === 'model') loadModel(false);
  }
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

  /* ---------------- card ---------------- */
  $('#fitThumbs').onclick = (e) => { const b = e.target.closest('.fthumb'); if (b) go(+b.dataset.i); };
  function card() {
    const f = F[cur], p = P[f.id];
    $('#fitIdx').textContent = `${String(cur + 1).padStart(2, '0')} / ${String(F.length).padStart(2, '0')}`;
    $('#fitCat').textContent = (p.drop ? 'AFTERHOURS · ' : '') + window.CAT_LABEL[p.cat];
    $('#fitName').textContent = p.name;
    $('#fitPrice').textContent = money(p.price);
    $('#fitColour').innerHTML = `<i style="background:${p.color}"></i>${f.colour}`;
    $('#fitDesc').textContent = p.desc;
    const sizes = window.SIZES[p.cat];
    $('#fitSizes').innerHTML = sizes.map((s, k) => `<button class="${k === Math.min(1, sizes.length - 1) ? 'is-on' : ''}">${s}</button>`).join('');
    const look = window.LOOK_OF[f.set];
    $('#fitLook').innerHTML = look.filter((id) => id !== f.id).map((id) => `<span title="${P[id].name}"><img src="${P[id].img}" alt="${P[id].name}"></span>`).join('');
    $('#fitLookTotal').textContent = money(look.reduce((a, id) => a + P[id].price, 0));
    $('#fitTry').textContent = mode === 'model' ? 'Back to the ' + (cat === 'shoes' ? 'shelf' : 'rail') : `View on model 360°`;
    $$('.fthumb').forEach((b, k) => b.classList.toggle('is-on', k === cur));
    $('#fitCard').classList.remove('is-swap'); void $('#fitCard').offsetWidth; $('#fitCard').classList.add('is-swap');
  }
  $('#fitSizes').onclick = (e) => { const b = e.target.closest('button'); if (b) $$('#fitSizes button').forEach((x) => x.classList.toggle('is-on', x === b)); };
  $('#fitAdd').onclick = (e) => {
    const f = F[cur];
    window.KORVA.addToBag(f.id, mode === 'rail' ? garments[cur].querySelector('.fg__img') : $('#fitModel'), { size: $('#fitSizes .is-on').textContent });
    e.currentTarget.textContent = 'Added'; setTimeout(() => ($('#fitAdd').textContent = 'Add to bag'), 1400);
  };
  $('#fitAddLook').onclick = () => {
    const look = window.LOOK_OF[F[cur].set];
    look.forEach((id, k) => setTimeout(() => window.KORVA.addToBag(id, $('#fitLook img') || $('#fitModel'), { quiet: true }), k * 120));
    window.KORVA.toast(`<b>Full look</b> ${look.length} pieces added`);
  };

  /* ---------------- switching pieces ---------------- */
  function go(i) {
    if (busy || i === cur) return;
    busy = true;
    const prev = cur;
    cur = wrap(i, F.length);
    card();
    if (mode === 'model') { const same = F[prev].set === F[cur].set; loadModel(!same); setTimeout(() => (busy = false), 500); place(); return; }
    const out = garments[prev];
    out.classList.add('is-out');
    place(prev);
    setTimeout(() => {
      out.classList.add('no-anim'); out.classList.remove('is-out');
      place();
      void out.offsetWidth; out.classList.remove('no-anim');
      busy = false;
    }, reduce ? 0 : 620);
  }
  $('#fitPrev').onclick = () => go(cur - 1);
  $('#fitNext').onclick = () => go(cur + 1);
  $('#fitCats').onclick = (e) => {
    const b = e.target.closest('button'); if (!b || b.dataset.cat === cat) return;
    cat = b.dataset.cat; flash(); build();
  };
  stage.addEventListener('mouseenter', () => (hover = true));
  stage.addEventListener('mouseleave', () => (hover = false));
  new IntersectionObserver((e) => { visible = e[0].isIntersecting; }, { threshold: 0.35 }).observe(stage);
  setInterval(() => { if (visible && !hover && mode === 'rail' && !reduce) go(cur + 1); }, 4800);

  /* ---------------- on-model 360 ---------------- */
  const A = $('#fitA'), B = $('#fitB'), V = $('#fitVideo'), model = $('#fitModel');
  let frame = 0, front = A, back = B, spinT = null, dragging = false, lastX = 0, acc = 0, resumeAt = 0, useVideo = false;
  const cache = {};
  function preload(set) { if (cache[set]) return; cache[set] = true; for (let i = 0; i < FRAMES; i++) { const im = new Image(); im.src = frameSrc(set, i); } }
  function setDial(deg) { $('#fitDeg').textContent = String(Math.round(deg) % 360).padStart(3, '0') + '°'; $('#fitDot').style.transform = `rotate(${deg}deg)`; }
  function show(i) {
    frame = wrap(i, FRAMES);
    back.src = frameSrc(F[cur].set, frame);
    back.classList.add('is-on'); front.classList.remove('is-on');
    [front, back] = [back, front];
    setDial(frame * 45);
  }
  function camera() {
    const c = CAM[cat];
    stage.style.setProperty('--z', c.z); stage.style.setProperty('--zy', c.y + '%'); stage.style.setProperty('--zbg', c.bg);
    stage.style.setProperty('--vz', cat === 'tees' ? 1 : cat === 'pants' ? 1.55 : 2.2); stage.style.setProperty('--vo', cat === 'tees' ? '60%' : '96%');
  }
  function loadModel(withFlash) {
    const set = F[cur].set; camera();
    if (withFlash) flash();
    useVideo = !!VIDEOS[set];
    stage.classList.toggle('has-video', useVideo);
    if (useVideo) {
      const base = VIDEOS[set].replace(/\.(mp4|webm)$/, '');
      V.poster = base + '-poster.jpg';
      V.src = base + (V.canPlayType('video/webm; codecs="vp9"') ? '.webm' : '.mp4');
      V.currentTime = 0; V.play().catch(() => {});
    } else {
      preload(set);
      frame = 0; front.src = frameSrc(set, 0); front.classList.add('is-on'); back.classList.remove('is-on');
      setDial(0);
    }
  }
  V.addEventListener('timeupdate', () => { if (useVideo && V.duration) setDial((V.currentTime / V.duration) * 360); });
  function spin() {
    clearInterval(spinT);
    spinT = setInterval(() => { if (mode === 'model' && !useVideo && !dragging && performance.now() > resumeAt) show(frame + 1); }, 420);
  }
  model.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; acc = 0; model.setPointerCapture(e.pointerId); model.classList.add('is-drag'); if (useVideo) V.pause(); });
  model.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX; lastX = e.clientX;
    if (useVideo && V.duration) { V.currentTime = wrap(V.currentTime - dx / 600 * V.duration, V.duration); return; }
    acc += dx;
    while (Math.abs(acc) > 46) { show(frame + (acc > 0 ? -1 : 1)); acc -= Math.sign(acc) * 46; }
  });
  const endDrag = () => { if (!dragging) return; dragging = false; model.classList.remove('is-drag'); resumeAt = performance.now() + 2200; if (useVideo) setTimeout(() => { if (!dragging && mode === 'model') V.play().catch(() => {}); }, 1600); };
  model.addEventListener('pointerup', endDrag); model.addEventListener('pointercancel', endDrag);

  /* ---------------- mode toggle ---------------- */
  function flash() { const fl = $('#fitFlash'); if (reduce) return; fl.classList.remove('go'); void fl.offsetWidth; fl.classList.add('go'); }
  function setMode(m) {
    if (m === mode) return;
    mode = m; flash();
    stage.classList.toggle('is-model', m === 'model');
    $$('#fitToggle button').forEach((b) => b.classList.toggle('is-on', b.dataset.mode === m));
    if (m === 'model') { loadModel(false); spin(); } else { clearInterval(spinT); V.pause(); }
    card();
  }
  $('#fitToggle').onclick = (e) => { const b = e.target.closest('button'); if (b) setMode(b.dataset.mode); };
  $('#fitTry').onclick = () => setMode(mode === 'model' ? 'rail' : 'model');

  document.addEventListener('keydown', (e) => {
    if (!visible || e.target.closest('input, textarea')) return;
    if (e.key === 'ArrowRight') { mode === 'model' && !useVideo ? show(frame + 1) : go(cur + 1); }
    if (e.key === 'ArrowLeft') { mode === 'model' && !useVideo ? show(frame - 1) : go(cur - 1); }
  });

  build();
  Object.values(FIT).flat().forEach((f) => preload(f.set));
})();
