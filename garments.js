/* Draws rack garments as SVG strings: tees, pants, shoes and accessories on hangers. */
(function () {
  let uid = 0;

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
    r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  }

  function patternDef(id, pat, c, c2) {
    switch (pat) {
      case 'stripe':
        return `<pattern id="${id}" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="${c}"/><rect y="12" width="20" height="6" fill="${c2}"/></pattern>`;
      case 'check':
        return `<pattern id="${id}" width="36" height="36" patternUnits="userSpaceOnUse"><rect width="36" height="36" fill="${c}"/><rect width="12" height="36" fill="${c2}" opacity=".45"/><rect width="36" height="12" fill="${c2}" opacity=".45"/><rect x="22" width="3" height="36" fill="#fff" opacity=".5"/><rect y="22" width="36" height="3" fill="#fff" opacity=".5"/></pattern>`;
      case 'denim':
        return `<pattern id="${id}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="6" height="6" fill="${c}"/><rect width="2" height="6" fill="${shade(c, 22)}" opacity=".6"/></pattern>`;
      case 'camo':
        return `<pattern id="${id}" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="60" height="60" fill="${c}"/><path d="M5 10q12-8 20 2t18-2 10 14-16 8-22-6-10-16z" fill="${c2}"/><path d="M30 38q10-6 18 4t-6 14-18-4 6-14z" fill="${shade(c, 35)}"/><path d="M0 44q8-4 12 4t-6 10-6-8z" fill="${shade(c2, -15)}"/></pattern>`;
      default:
        return `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(c, 14)}"/><stop offset="1" stop-color="${shade(c, -12)}"/></linearGradient>`;
    }
  }

  const HANGER = `<g class="hanger"><path d="M100 2c7 0 10 5 10 9 0 6-10 8-10 15v6" fill="none" stroke="#8a8f99" stroke-width="3" stroke-linecap="round"/><path d="M100 32 L26 62 c-7 3-5 8 2 8 h144 c7 0 9-5 2-8 Z" fill="#b5784a" stroke="#8d5a34" stroke-width="2.5" stroke-linejoin="round"/><path d="M34 66 H166" stroke="#d39a6c" stroke-width="2"/></g>`;
  const HOOK = `<g class="hanger"><path d="M100 2c7 0 10 5 10 9 0 6-10 8-10 15v10" fill="none" stroke="#8a8f99" stroke-width="3" stroke-linecap="round"/></g>`;
  const fold = (d) => `<path d="${d}" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="2" stroke-linecap="round"/>`;

  function tee(f, it, back, long) {
    const sl = long
      ? 'M70 62 Q100 76 130 62 L168 76 L190 196 L166 202 L150 116 L150 230 Q100 238 50 230 L50 116 L34 202 L10 196 L32 76 Z'
      : 'M70 62 Q100 76 130 62 L170 78 L190 118 L162 132 L152 112 L152 230 Q100 238 48 230 L48 112 L38 132 L10 118 L30 78 Z';
    let s = `<path d="${sl}" fill="url(#${f})" stroke="${shade(it.c, -40)}" stroke-width="2" stroke-linejoin="round"/>`;
    s += fold('M70 120 q8 50 -2 100') + fold('M132 130 q-6 40 4 92');
    if (it.pat === 'ringer') {
      s += `<path d="M70 62 Q100 ${back ? 70 : 84} 130 62" fill="none" stroke="${it.c2}" stroke-width="9"/>`;
      s += long ? '' : `<path d="M162 132 L190 118" stroke="${it.c2}" stroke-width="8"/><path d="M38 132 L10 118" stroke="${it.c2}" stroke-width="8"/>`;
    } else {
      s += `<path d="M70 62 Q100 ${back ? 70 : 82} 130 62" fill="none" stroke="${shade(it.c, -30)}" stroke-width="5"/>`;
    }
    if (long) s += `<path d="M166 202 L190 196" stroke="${shade(it.c, -30)}" stroke-width="7"/><path d="M34 202 L10 196" stroke="${shade(it.c, -30)}" stroke-width="7"/><path d="M50 222 Q100 230 150 222" stroke="${shade(it.c, -25)}" stroke-width="6" fill="none"/>`;
    if (!back && it.pat === 'graphic') s += `<circle cx="100" cy="128" r="26" fill="none" stroke="${it.c2}" stroke-width="5"/><path d="M84 132 l10-16 8 12 6-8 10 14z" fill="${it.c2}"/><text x="100" y="172" text-anchor="middle" font-family="Anton,Impact,sans-serif" font-size="16" fill="${it.c2}" letter-spacing="2">KORVA</text>`;
    if (!back && it.pat === 'pocket') s += `<path d="M112 100 h22 v24 q-11 6 -22 0z" fill="${it.c2}" stroke="${shade(it.c, -45)}" stroke-width="1.5"/>`;
    if (back) s += `<rect x="92" y="70" width="16" height="9" rx="2" fill="#fff" opacity=".85"/>`;
    return HANGER + s;
  }

  function pants(f, it, back, kind) {
    const short = kind === 'shorts';
    const bottom = short ? 160 : 232;
    let leg = `M54 72 H146 L${short ? 158 : 154} ${bottom} H${short ? 108 : 110} L100 ${short ? 124 : 128} L${short ? 92 : 90} ${bottom} H${short ? 42 : 46} Z`;
    if (kind === 'jogger') leg = `M54 72 H146 L150 214 Q148 226 138 228 H112 L100 128 L88 228 H62 Q52 226 50 214 Z`;
    let s = `<path d="${leg}" fill="url(#${f})" stroke="${shade(it.c, -40)}" stroke-width="2" stroke-linejoin="round"/>`;
    s += `<rect x="52" y="64" width="96" height="14" rx="3" fill="${shade(it.c, -18)}" stroke="${shade(it.c, -40)}" stroke-width="2"/>`;
    // clips
    s += `<path d="M100 32 V50 M60 50 H140" stroke="#8a8f99" stroke-width="3" stroke-linecap="round"/><rect x="56" y="48" width="12" height="20" rx="2" fill="#c3c7cf"/><rect x="132" y="48" width="12" height="20" rx="2" fill="#c3c7cf"/>`;
    s = HOOK + s;
    if (kind === 'jogger') s += `<path d="M62 222 H88 M112 222 H138" stroke="${shade(it.c, -25)}" stroke-width="7"/><path d="M96 78 q-6 14 -2 22 M104 78 q6 14 2 22" stroke="#fff" stroke-width="2" fill="none"/>`;
    if (!back) {
      s += fold('M100 80 V124');
      if (it.pat === 'denim') s += `<path d="M58 84 q16 16 30 0 M142 84 q-16 16 -30 0" fill="none" stroke="${it.c2}" stroke-width="1.6" stroke-dasharray="3 3"/><path d="M100 80 v40" stroke="${it.c2}" stroke-width="1.6" stroke-dasharray="3 3"/>`;
      if (kind === 'cargo') s += `<rect x="50" y="140" width="24" height="30" rx="3" fill="${shade(it.c, -12)}" stroke="${shade(it.c, -40)}" stroke-width="1.5"/><rect x="128" y="140" width="24" height="30" rx="3" fill="${shade(it.c, -12)}" stroke="${shade(it.c, -40)}" stroke-width="1.5"/>`;
    } else {
      s += `<path d="M64 96 h24 v22 l-12 6 -12 -6z M112 96 h24 v22 l-12 6 -12 -6z" fill="${shade(it.c, -10)}" stroke="${it.pat === 'denim' ? it.c2 : shade(it.c, -40)}" stroke-width="1.5" stroke-dasharray="${it.pat === 'denim' ? '3 3' : '0'}"/>`;
      if (it.pat === 'denim') s += `<rect x="120" y="72" width="18" height="10" fill="#8d5a34"/>`;
    }
    return s;
  }

  function sneaker(f, it, back, high) {
    const up = high
      ? 'M40 196 L40 100 Q42 90 56 90 L86 92 Q92 120 120 140 Q160 152 172 166 Q178 176 176 192 Z'
      : 'M30 196 Q30 150 56 140 L92 132 Q116 152 150 160 Q174 166 178 180 L178 192 Z';
    let s = `<path d="M100 22 L${high ? 66 : 74} ${high ? 104 : 140}" stroke="#d9d4c7" stroke-width="2.5"/><path d="M100 22 L${high ? 80 : 88} ${high ? 108 : 138}" stroke="#d9d4c7" stroke-width="2.5"/>`;
    s += `<g transform="rotate(-8 100 160)"><path d="${up}" fill="url(#${f})" stroke="${shade(it.c, -45)}" stroke-width="2.4" stroke-linejoin="round"/>`;
    s += `<rect x="${high ? 34 : 24}" y="190" width="${high ? 148 : 160}" height="16" rx="7" fill="${it.c2}" stroke="${shade(it.c2, -50)}" stroke-width="2"/>`;
    s += `<path d="M${high ? 36 : 26} 198 H${high ? 180 : 182}" stroke="${shade(it.c2, -40)}" stroke-width="1.5" stroke-dasharray="4 3"/>`;
    if (!back) {
      s += high
        ? `<circle cx="64" cy="160" r="12" fill="#fff" stroke="${shade(it.c, -40)}" stroke-width="2"/><path d="M58 160 h12 M64 154 v12" stroke="${it.c}" stroke-width="2"/>`
        : `<path d="M70 176 Q110 150 150 176" fill="none" stroke="${it.c2}" stroke-width="7" stroke-linecap="round"/>`;
      s += high ? `<path d="M74 100 l18 6 M78 112 l20 6 M84 124 l20 6" stroke="#fff" stroke-width="3"/>` : `<path d="M88 140 l14 8 M98 136 l14 8 M108 142 l12 8" stroke="#fff" stroke-width="3"/>`;
    } else {
      s += `<rect x="${high ? 36 : 28}" y="${high ? 104 : 148}" width="10" height="${high ? 80 : 40}" rx="3" fill="${it.c2}"/>`;
    }
    return HOOK + s + '</g>';
  }

  function cap(f, it, back) {
    let s = `<path d="M100 22 L100 74" stroke="#8a8f99" stroke-width="2.5"/>`;
    s += `<path d="M44 150 Q44 76 104 74 Q164 76 164 150 Z" fill="url(#${f})" stroke="${shade(it.c, -45)}" stroke-width="2.4"/>`;
    s += back ? `<path d="M80 150 Q104 120 128 150" fill="#fff" opacity=".9"/><rect x="88" y="138" width="34" height="6" rx="3" fill="${shade(it.c, -40)}"/>`
      : `<path d="M104 76 V150 M74 84 Q84 116 82 150 M134 84 Q124 116 126 150" stroke="${shade(it.c, -30)}" stroke-width="1.6" fill="none"/><path d="M36 150 Q110 136 196 168 Q120 182 36 158 Z" fill="${shade(it.c, -18)}" stroke="${shade(it.c, -45)}" stroke-width="2.4"/><text x="104" y="126" text-anchor="middle" font-family="Anton,Impact,sans-serif" font-size="18" fill="${it.c2}" letter-spacing="1">K</text>`;
    s += `<circle cx="104" cy="74" r="5" fill="${shade(it.c, -30)}"/>`;
    return HOOK + s;
  }

  function beanie(f, it) {
    return HOOK + `<path d="M100 22 L100 60" stroke="#8a8f99" stroke-width="2.5"/><circle cx="100" cy="64" r="16" fill="${it.c2}"/><path d="M50 172 Q50 72 100 72 Q150 72 150 172 Z" fill="url(#${f})" stroke="${shade(it.c, -45)}" stroke-width="2.4"/>` +
      `<rect x="44" y="150" width="112" height="40" rx="8" fill="${shade(it.c, -20)}" stroke="${shade(it.c, -45)}" stroke-width="2.4"/>` +
      [60, 72, 84, 96, 108, 120, 132, 144].map((x) => `<path d="M${x} 154 V186" stroke="${shade(it.c, -40)}" stroke-width="2"/>`).join('') +
      `<rect x="86" y="160" width="28" height="18" rx="2" fill="#fff"/><text x="100" y="174" text-anchor="middle" font-family="Anton,Impact,sans-serif" font-size="12" fill="${it.c}">KV</text>`;
  }

  function tote(f, it, back) {
    return HOOK + `<path d="M70 120 Q70 40 100 40 Q130 40 130 120" fill="none" stroke="${shade(it.c, -30)}" stroke-width="8"/>` +
      `<path d="M40 110 H160 L168 230 H32 Z" fill="url(#${f})" stroke="${shade(it.c, -45)}" stroke-width="2.4" stroke-linejoin="round"/>` +
      (back ? '' : `<rect x="66" y="150" width="68" height="40" rx="4" fill="#fff" opacity=".9"/><text x="100" y="178" text-anchor="middle" font-family="Anton,Impact,sans-serif" font-size="20" fill="${it.c2}" letter-spacing="2">KORVA</text>`);
  }

  function backpack(f, it, back) {
    return HOOK + `<path d="M84 44 Q100 30 116 44" fill="none" stroke="${shade(it.c, -40)}" stroke-width="7"/>` +
      `<rect x="46" y="50" width="108" height="180" rx="34" fill="url(#${f})" stroke="${shade(it.c, -45)}" stroke-width="2.4"/>` +
      (back ? `<path d="M66 60 Q60 150 70 222 M134 60 Q140 150 130 222" stroke="${it.c2}" stroke-width="12" fill="none" stroke-linecap="round"/>`
        : `<path d="M56 108 Q100 92 144 108" stroke="${shade(it.c, -45)}" stroke-width="2" fill="none"/><rect x="64" y="140" width="72" height="70" rx="16" fill="${it.c2}" stroke="${shade(it.c, -45)}" stroke-width="2"/><rect x="88" y="150" width="24" height="6" rx="3" fill="#1c1d29"/>`);
  }

  window.garmentSVG = function (it, back = false) {
    const f = 'g' + uid++;
    const defs = `<defs>${patternDef(f, it.pat, it.c, it.c2)}</defs>`;
    let body = '';
    switch (it.type) {
      case 'tee': body = tee(f, it, back, false); break;
      case 'longsleeve': body = tee(f, it, back, true); break;
      case 'pants': case 'cargo': case 'jogger': case 'shorts': body = pants(f, it, back, it.type); break;
      case 'sneaker': body = sneaker(f, it, back, false); break;
      case 'hightop': body = sneaker(f, it, back, true); break;
      case 'cap': body = cap(f, it, back); break;
      case 'beanie': body = beanie(f, it, back); break;
      case 'tote': body = tote(f, it, back); break;
      case 'backpack': body = backpack(f, it, back); break;
    }
    return `<svg viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg">${defs}<g>${body}</g></svg>`;
  };
})();
