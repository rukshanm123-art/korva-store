/* "Three pieces, one fit" — canvas fabric ribbons that braid together. */
(function () {
  const TW = 512, TH = 96;

  function makeTexture(f) {
    const c = document.createElement('canvas');
    c.width = TW; c.height = TH;
    const g = c.getContext('2d');
    const [a, b, d, e] = f.cols;
    g.fillStyle = a; g.fillRect(0, 0, TW, TH);
    if (f.kind === 'plaid') {
      const cols = [b, d, e || b];
      for (let x = 0; x < TW; x += 48) {
        g.globalAlpha = 0.55; g.fillStyle = cols[(x / 48) % 3]; g.fillRect(x, 0, 16, TH);
        g.globalAlpha = 0.8; g.fillStyle = '#ffffff'; g.fillRect(x + 28, 0, 3, TH);
      }
      for (let y = 0; y < TH; y += 32) {
        g.globalAlpha = 0.45; g.fillStyle = cols[(y / 32) % 3]; g.fillRect(0, y, TW, 12);
        g.globalAlpha = 0.6; g.fillStyle = '#1c1d29'; g.fillRect(0, y + 20, TW, 2);
      }
    } else if (f.kind === 'denim') {
      g.strokeStyle = b; g.lineWidth = 2; g.globalAlpha = 0.6;
      for (let x = -TH; x < TW; x += 5) { g.beginPath(); g.moveTo(x, TH); g.lineTo(x + TH, 0); g.stroke(); }
      g.globalAlpha = 1; g.strokeStyle = '#e39b3a'; g.setLineDash([6, 5]); g.lineWidth = 2;
      g.beginPath(); g.moveTo(0, 8); g.lineTo(TW, 8); g.moveTo(0, TH - 8); g.lineTo(TW, TH - 8); g.stroke();
    } else if (f.kind === 'print') {
      g.fillStyle = b;
      for (let x = 0; x < TW; x += 72) {
        g.fillRect(x + 8, 10, 44, 6); g.fillRect(x + 8, TH - 16, 44, 6);
        g.strokeStyle = b; g.lineWidth = 4; g.strokeRect(x + 14, 24, 32, TH - 48);
        g.beginPath(); g.arc(x + 30, TH / 2, 9, 0, 7); g.fill();
      }
    } else if (f.kind === 'jersey') {
      g.strokeStyle = b; g.lineWidth = 1; g.globalAlpha = 0.55;
      for (let y = 0; y < TH; y += 4) { g.beginPath(); for (let x = 0; x <= TW; x += 6) { g.lineTo(x, y + (x / 6 % 2 ? 1.5 : 0)); } g.stroke(); }
    } else if (f.kind === 'twill') {
      g.strokeStyle = b; g.lineWidth = 3; g.globalAlpha = 0.5;
      for (let x = -TH; x < TW; x += 7) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + TH, TH); g.stroke(); }
    } else if (f.kind === 'stripe') {
      for (let x = 0; x < TW; x += 40) { g.fillStyle = b; g.fillRect(x, 0, 14, TH); g.fillStyle = d; g.fillRect(x + 20, 0, 5, TH); }
    } else if (f.kind === 'camo') {
      const cols = [b, d, e];
      for (let i = 0; i < 70; i++) {
        g.fillStyle = cols[i % 3]; g.beginPath();
        const x = Math.random() * TW, y = Math.random() * TH, r = 8 + Math.random() * 16;
        g.ellipse(x, y, r * 1.6, r, Math.random() * 3, 0, 7); g.fill();
      }
    }
    // soft sheen
    g.globalAlpha = 1;
    const sh = g.createLinearGradient(0, 0, 0, TH);
    sh.addColorStop(0, 'rgba(255,255,255,.18)'); sh.addColorStop(0.5, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(0,0,0,.18)');
    g.fillStyle = sh; g.fillRect(0, 0, TW, TH);
    return c;
  }

  window.Weave = function (canvas, fabrics) {
    const ctx = canvas.getContext('2d');
    const tex = fabrics.map(makeTexture);
    const swatchURLs = tex.map((t) => t.toDataURL('image/jpeg', 0.8));
    const slots = [0, 1, 2].map((i) => ({ fab: null, grow: 0, target: 0, phase: (i * Math.PI * 2) / 3 }));
    let braid = 0, braidTarget = 0, W = 0, H = 0, dpr = 1, t = 0, last = performance.now(), visible = true, fly = 0;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; }, { rootMargin: '100px' }).observe(canvas);

    const smooth = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

    function frame(now) {
      requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!visible) return;
      t += dt;
      slots.forEach((s) => { s.grow += (s.target - s.grow) * Math.min(1, dt * 2.2); });
      braid += (braidTarget - braid) * Math.min(1, dt * 1.6);
      ctx.clearRect(0, 0, W, H);
      const cy = H / 2;
      const active = slots.filter((s) => s.fab !== null).length;

      // idle threads
      const threadAlpha = 0.45 * (1 - braid);
      if (threadAlpha > 0.02) {
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
          ctx.strokeStyle = `rgba(40,40,60,${threadAlpha})`;
          ctx.beginPath();
          for (let x = 0; x <= W; x += 8) {
            const u = x / W;
            const y = cy + H * 0.26 * Math.sin(Math.PI * 2 * u * (0.8 + i * 0.15) + t * 0.5 + i * 2.1) * (0.7 + 0.3 * Math.sin(t * 0.3 + i));
            x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }

      if (!active && !slots.some((s) => s.grow > 0.01)) return;
      const step = 3;
      const ampFree = H * 0.2, ampBraid = H * 0.13;
      for (let x = -step; x <= W + step; x += step) {
        const u = x / W;
        const cols = [];
        slots.forEach((s, i) => {
          if (s.fab === null && s.grow < 0.01) return;
          const reach = s.grow * (W + 160);
          if (x > reach) return;
          const taper = smooth((reach - x) / 120);
          const kf = Math.PI * 2 * u * 0.9 + t * 0.7 + s.phase;
          const kb = Math.PI * 2 * u * 2.6 - t * 1.6 + s.phase;
          const ycF = cy + ampFree * Math.sin(kf) + (i - 1) * H * 0.06;
          const ycB = cy + ampBraid * Math.sin(kb);
          const yc = ycF + (ycB - ycF) * braid;
          const thF = Math.PI * 2 * u * 1.1 + t * 0.9 + s.phase * 1.7;
          const thB = kb + Math.PI / 2;
          const th = thF + (thB - thF) * braid;
          const hw = (H * 0.11) * (1 - braid) + (H * 0.075) * braid;
          const c = Math.cos(th);
          const h = hw * (0.16 + 0.84 * Math.abs(c)) * taper;
          const z = (1 - braid) * i + braid * Math.cos(kb) * 3;
          cols.push({ s, yc, h, c, z, th });
        });
        cols.sort((a, b) => a.z - b.z);
        for (const o of cols) {
          if (o.h < 0.3 || o.s.fab === null && o.s.lastFab == null) continue;
          const tx = tex[o.s.fab !== null ? o.s.fab : o.s.lastFab];
          const tu = ((x * 0.7 + t * 30) % TW + TW) % TW;
          ctx.drawImage(tx, tu, 0, 2, TH, x, o.yc - o.h, step + 0.9, o.h * 2);
          const dark = 0.38 * (1 - Math.abs(o.c));
          if (dark > 0.01) { ctx.fillStyle = `rgba(20,10,20,${dark})`; ctx.fillRect(x, o.yc - o.h, step + 0.9, o.h * 2); }
          const lit = 0.22 * Math.max(0, Math.sin(o.th));
          if (lit > 0.01) { ctx.fillStyle = `rgba(255,255,255,${lit})`; ctx.fillRect(x, o.yc - o.h, step + 0.9, o.h * 2); }
        }
      }
    }
    requestAnimationFrame(frame);

    return {
      swatchURLs,
      set(selection) {
        slots.forEach((s, i) => {
          const f = selection[i];
          if (f === undefined || f === null) { if (s.fab !== null) s.lastFab = s.fab; s.fab = null; s.target = 0; }
          else { if (s.fab !== f) { s.grow = Math.min(s.grow, 0.05); } s.fab = f; s.lastFab = f; s.target = 1; }
        });
        braidTarget = selection.filter((v) => v !== null && v !== undefined).length === 3 ? 1 : 0;
      },
    };
  };
})();
