/* KORVA — checkout. Test mode: nothing is charged and no details leave the browser.
   To take real payments, connect a payment provider (for example Stripe for cards, Apple Pay and
   Google Pay, plus Afterpay, Klarna and Gem merchant accounts) where `completeOrder` is called. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const P = window.PRODUCTS, Bag = window.Bag;
  const nzd = (n) => window.fmtNZD(n, true);
  const FREE_SHIP = 150, AFTERPAY_MAX = 2000, GEM_MIN = 250;
  const PROMOS = { KORVA10: 0.1, KIAORA: 0.15 };
  const APPLE_SVG = '<svg viewBox="0 0 24 24"><path d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9s-1.8-.8-3-.8C7 7.4 5.6 8.3 4.8 9.7c-1.6 2.8-.4 6.9 1.2 9.1.8 1.1 1.7 2.3 2.8 2.3 1.1 0 1.6-.7 3-.7s1.8.7 3 .7 2-1.1 2.7-2.2c.9-1.3 1.2-2.5 1.2-2.6 0 0-2.3-.9-2.3-3.7zM14.2 5.8c.6-.8 1-1.8.9-2.8-.9 0-2 .6-2.6 1.4-.6.7-1.1 1.7-.9 2.7 1 .1 2-.5 2.6-1.3z"/></svg>';
  let promo = 0, promoCode = '';
  const form = $('#coForm');

  /* ---------------------------------------------------------------- totals */
  function totals() {
    const sub = Bag.subtotal();
    const disc = Math.round(sub * promo * 100) / 100;
    const after = sub - disc;
    const method = form.ship.value;
    const ship = method === 'collect' ? 0 : method === 'express' ? 15 : after >= FREE_SHIP ? 0 : 8;
    const total = after + ship;
    return { sub, disc, ship, total, gst: total * 3 / 23 };
  }

  /* ---------------------------------------------------------------- summary */
  function render() {
    const lines = Bag.items();
    if (!lines.length && !document.body.classList.contains('is-done')) { $('#coMain').hidden = true; $('#coEmpty').hidden = false; return; }
    $('#sumCount').textContent = `· ${Bag.count()} item${Bag.count() === 1 ? '' : 's'}`;
    $('#sumList').innerHTML = lines.map((l, k) => `<li><span class="thumb" style="--tc:#efedf4"><img src="${l.p.img}" alt=""><i>${l.qty}</i></span><div><b>${l.p.name}</b><small>${l.size}${l.disc ? ' · Capsule −10%' : ''} · ${nzd(l.unit)}</small><button type="button" class="rm" data-k="${k}">Remove</button></div><div class="line">${nzd(l.total)}</div></li>`).join('');
    $$('#sumList .rm').forEach((b) => (b.onclick = () => { const l = Bag.items()[+b.dataset.k]; Bag.setQty(+b.dataset.k, 0); render(); if (l) flash(`${l.p.name} removed`); }));
    const t = totals();
    $('#sumSub').textContent = nzd(t.sub);
    $('#sumDiscRow').hidden = !t.disc; $('#sumDisc').textContent = '−' + nzd(t.disc);
    $('#sumShip').textContent = t.ship ? nzd(t.ship) : 'Free';
    $('#sumTotal').textContent = nzd(t.total);
    $('#sumGst').textContent = nzd(t.gst);
    // shipping option prices
    const after = t.sub - t.disc;
    $('[data-ship="standard"]').textContent = after >= FREE_SHIP ? 'Free' : nzd(8);
    $('[data-ship="express"]').textContent = nzd(15);
    $('[data-ship="collect"]').textContent = 'Free';
    // BNPL messaging
    const q = t.total / 4;
    $('#sumBnpl').innerHTML = `<span class="pm pm--afterpay">afterpay</span> or <span class="pm pm--klarna">Klarna.</span> 4 interest-free payments of <b>${nzd(q)}</b>` +
      (t.total >= GEM_MIN ? `<br><span class="pm pm--gem">gem</span> 6 months interest free from <b>${nzd(t.total / 6)}</b>/month` : `<br><span class="pm pm--gem">gem</span> Interest free on orders over ${nzd(GEM_MIN)}`);
    $('#afterpaySched').innerHTML = ['Today', '2 weeks', '4 weeks', '6 weeks'].map((d, i) => `<div style="--p:${(i + 1) * 25}%">${d}<b>${nzd(q)}</b></div>`).join('');
    $('#klarna4').textContent = `4 interest-free payments of ${nzd(q)}`;
    $('#gemText').textContent = t.total >= GEM_MIN ? `6 months interest free with Gem Visa: ${nzd(t.total / 6)} a month for 6 months.` : `Gem Interest Free is available on orders of ${nzd(GEM_MIN)} or more. Add ${nzd(GEM_MIN - t.total)} to use it.`;
    renderUpsell(lines);
    updatePayBtn();
  }
  function renderUpsell(lines) {
    const D = window.DROP, have = new Set(lines.map((l) => l.id));
    const missing = D.ids.filter((id) => !have.has(id));
    if (!missing.length) { $('#upsell').innerHTML = ''; return; }
    $('#upsell').innerHTML = `<h3>${D.name} · ${D.no}</h3><p>Complete the drop. ${D.line}</p><ul>${missing.map((id) => `<li><span class="thumb"><img src="${P[id].img}" alt=""></span><div><b>${P[id].name}</b><small>${nzd(P[id].price)}</small></div><button type="button" data-id="${id}">Add</button></li>`).join('')}</ul>`;
    $$('#upsell button').forEach((b) => (b.onclick = () => { Bag.add(b.dataset.id); render(); flash(`${P[b.dataset.id].name} added`); }));
  }
  function updatePayBtn() {
    const m = form.pay.value, t = totals();
    const label = { card: `Pay ${nzd(t.total)}`, applepay: 'Pay with Apple Pay', googlepay: 'Pay with Google Pay', afterpay: 'Continue to Afterpay', klarna: 'Continue to Klarna', gem: 'Continue to Gem' }[m];
    $('#payBtn').textContent = label;
  }
  let flashT;
  function flash(msg) { const e = $('#formErr'); e.style.color = 'var(--muted)'; e.textContent = msg; clearTimeout(flashT); flashT = setTimeout(() => { e.textContent = ''; e.style.color = ''; }, 2500); }

  /* ---------------------------------------------------------------- inputs */
  form.addEventListener('change', (e) => { if (e.target.name === 'ship' || e.target.name === 'pay') { render(); $('#formErr').textContent = ''; } });
  $('#promoForm').onsubmit = (e) => {
    e.preventDefault();
    const code = $('#promo').value.trim().toUpperCase(), m = $('#promoMsg');
    if (PROMOS[code]) { promo = PROMOS[code]; promoCode = code; m.textContent = `${code} applied: ${PROMOS[code] * 100}% off your order.`; m.className = 'promo__msg ok'; }
    else { promo = 0; promoCode = ''; m.textContent = code ? 'That code is not valid.' : ''; m.className = 'promo__msg'; }
    render();
  };
  const cc = form.cc, exp = form.exp, cvc = form.cvc;
  const brandOf = (d) => (/^4/.test(d) ? 'visa' : /^(5[1-5]|2[2-7])/.test(d) ? 'mc' : '');
  cc.addEventListener('input', () => {
    const d = cc.value.replace(/\D/g, '').slice(0, 19);
    cc.value = d.replace(/(.{4})/g, '$1 ').trim();
    const b = brandOf(d);
    $('#ccBrand').innerHTML = b === 'visa' ? '<span class="pm pm--visa">VISA</span>' : b === 'mc' ? '<span class="pm pm--mc"><i></i><i></i></span>' : '';
  });
  exp.addEventListener('input', (e) => {
    let d = exp.value.replace(/\D/g, '').slice(0, 4);
    if (d.length === 1 && +d > 1) d = '0' + d;
    exp.value = d.length > 2 ? d.slice(0, 2) + ' / ' + d.slice(2) : d;
    if (e.inputType === 'deleteContentBackward' && exp.value.endsWith(' /')) exp.value = d.slice(0, 2);
  });
  cvc.addEventListener('input', () => { cvc.value = cvc.value.replace(/\D/g, '').slice(0, 4); });
  form.postcode.addEventListener('input', () => { form.postcode.value = form.postcode.value.replace(/\D/g, '').slice(0, 4); });
  $$('.fld input, .fld select', form).forEach((i) => i.addEventListener('input', () => i.closest('.fld').classList.remove('is-bad')));

  /* ---------------------------------------------------------------- validation */
  const luhn = (d) => { let s = 0; for (let i = 0; i < d.length; i++) { let n = +d[d.length - 1 - i]; if (i % 2) { n *= 2; if (n > 9) n -= 9; } s += n; } return d.length >= 13 && s % 10 === 0; };
  function check(fields) {
    const bad = [];
    fields.forEach(([name, ok, msg]) => { const el = form[name]; const good = ok(el.value.trim()); el.closest('.fld').classList.toggle('is-bad', !good); if (!good) bad.push(msg); });
    return bad;
  }
  function validateDetails() {
    return check([
      ['email', (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v), 'Enter a valid email address.'],
      ['phone', (v) => /^(\+?64|0)\s?2\d[\d\s]{6,10}$/.test(v), 'Enter a New Zealand mobile number, e.g. 021 123 4567.'],
      ['first', (v) => v.length > 0, 'Enter your first name.'],
      ['last', (v) => v.length > 0, 'Enter your last name.'],
      ['street', (v) => v.length > 3, 'Enter your street address.'],
      ['suburb', (v) => v.length > 1, 'Enter your suburb.'],
      ['city', (v) => v.length > 1, 'Enter your town or city.'],
      ['region', (v) => v.length > 0, 'Choose your region.'],
      ['postcode', (v) => /^\d{4}$/.test(v), 'Enter a 4-digit NZ postcode.'],
    ]);
  }
  function validateCard() {
    return check([
      ['cc', (v) => { const d = v.replace(/\D/g, ''); return luhn(d) && !!brandOf(d); }, 'Enter a valid Visa or Mastercard number.'],
      ['exp', (v) => { const m = v.match(/^(\d{2}) \/ (\d{2})$/); if (!m || +m[1] < 1 || +m[1] > 12) return false; const now = new Date(); const y = 2000 + +m[2]; return y > now.getFullYear() || (y === now.getFullYear() && +m[1] >= now.getMonth() + 1); }, 'Enter a valid expiry date.'],
      ['cvc', (v) => /^\d{3}$/.test(v), 'Enter the 3-digit security code.'],
      ['ccname', (v) => v.length > 1, 'Enter the name on the card.'],
    ]);
  }
  function showErrors(errs) {
    $('#formErr').style.color = '';
    $('#formErr').textContent = errs.length ? errs[0] + (errs.length > 1 ? ` (and ${errs.length - 1} more)` : '') : '';
    if (errs.length) { const first = $('.fld.is-bad input, .fld.is-bad select', form); if (first) { first.focus({ preventScroll: true }); first.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }
    return !errs.length;
  }

  /* ---------------------------------------------------------------- provider sheets */
  const sheet = $('#sheet'), panel = $('#sheetPanel');
  function openSheet(kind, express) {
    const t = totals();
    const name = form.first.value ? `${form.first.value} ${form.last.value}` : 'Saved in your wallet';
    const addr = form.street.value ? `${form.street.value}, ${form.city.value} ${form.postcode.value}` : 'Saved in your wallet';
    const head = {
      applepay: `<span class="pm pm--apple">${APPLE_SVG}Pay</span>`,
      googlepay: '<span class="pm pm--google"><b class="g">G</b>Pay</span>',
      afterpay: '<span class="pm pm--afterpay">afterpay</span>',
      klarna: '<span class="pm pm--klarna">Klarna.</span>',
      gem: '<span class="pm pm--gem">gem</span>',
    }[kind];
    const q = t.total / 4;
    let rows = '', confirm = '', note = '';
    if (kind === 'applepay' || kind === 'googlepay') {
      rows = `<div class="sheet__row"><span>Card</span><b>Visa •••• 4242</b></div><div class="sheet__row"><span>Ship to</span><b>${name}<br>${addr}</b></div><div class="sheet__row"><span>Contact</span><b>${form.email.value || 'From your wallet'}</b></div><div class="sheet__row"><span>Pay KORVA</span><b class="sheet__total">${nzd(t.total)}</b></div>`;
      confirm = kind === 'applepay' ? `<button class="sheet__confirm sheet__confirm--apple" data-ok>${APPLE_SVG} Confirm with Face ID</button>` : '<button class="sheet__confirm sheet__confirm--google" data-ok>Pay now</button>';
      note = 'Test mode: this sheet stands in for the real wallet. Nothing is charged.';
    } else if (kind === 'afterpay') {
      rows = `<div class="sheet__row"><span>Today</span><b>${nzd(q)}</b></div><div class="sheet__row"><span>Then 3 payments, every 2 weeks</span><b>${nzd(q)} each</b></div><div class="sheet__row"><span>Total</span><b class="sheet__total">${nzd(t.total)}</b></div>`;
      confirm = '<button class="sheet__confirm sheet__confirm--afterpay" data-ok>Confirm with Afterpay</button>';
      note = 'Test mode: in production you would be redirected to Afterpay to log in and confirm.';
    } else if (kind === 'klarna') {
      const thirty = form.klarna.value === '30';
      rows = thirty ? `<div class="sheet__row"><span>Pay in 30 days</span><b>${nzd(t.total)}</b></div><div class="sheet__row"><span>Due today</span><b>${nzd(0)}</b></div>` : `<div class="sheet__row"><span>Today</span><b>${nzd(q)}</b></div><div class="sheet__row"><span>Then 3 payments, every 2 weeks</span><b>${nzd(q)} each</b></div>`;
      rows += `<div class="sheet__row"><span>Total</span><b class="sheet__total">${nzd(t.total)}</b></div>`;
      confirm = '<button class="sheet__confirm sheet__confirm--klarna" data-ok>Confirm with Klarna</button>';
      note = 'Test mode: in production you would be redirected to Klarna to confirm.';
    } else if (kind === 'gem') {
      rows = `<div class="sheet__row"><span>Plan</span><b>6 months interest free</b></div><div class="sheet__row"><span>Monthly</span><b>${nzd(t.total / 6)}</b></div><div class="sheet__row"><span>Total</span><b class="sheet__total">${nzd(t.total)}</b></div>`;
      confirm = '<button class="sheet__confirm sheet__confirm--gem" data-ok>Confirm with Gem Visa</button>';
      note = 'Test mode: in production you would be redirected to Gem to sign in and approve. Subject to approval; fees, terms and conditions apply.';
    }
    panel.innerHTML = `<div class="sheet__top">${head}<button data-close>Cancel</button></div>${rows}<p class="sheet__note">${note}</p>${confirm}`;
    sheet.classList.add('is-open'); sheet.setAttribute('aria-hidden', 'false');
    $$('[data-close]', sheet).forEach((b) => (b.onclick = closeSheet));
    $('[data-ok]', panel).onclick = () => { closeSheet(); completeOrder(kind, express); };
  }
  function closeSheet() { sheet.classList.remove('is-open'); sheet.setAttribute('aria-hidden', 'true'); }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); });

  /* ---------------------------------------------------------------- pay */
  function bnplLimits(kind) {
    const t = totals();
    if (kind === 'afterpay' && t.total > AFTERPAY_MAX) return `Afterpay is available on orders up to ${nzd(AFTERPAY_MAX)}.`;
    if (kind === 'gem' && t.total < GEM_MIN) return `Gem Interest Free needs an order of ${nzd(GEM_MIN)} or more.`;
    return '';
  }
  $$('.xbtn').forEach((b) => (b.onclick = () => {
    if (b.dataset.wallet) { openSheet(b.dataset.wallet === 'Apple Pay' ? 'applepay' : 'googlepay', true); return; }
    const lim = bnplLimits('afterpay'); if (lim) { showErrors([lim]); return; }
    if (!showErrors(validateDetails())) return;
    openSheet('afterpay', false);
  }));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const m = form.pay.value;
    const errs = validateDetails();
    if (m === 'card') errs.push(...validateCard());
    const lim = bnplLimits(m); if (lim) errs.unshift(lim);
    if (!showErrors(errs)) return;
    if (m === 'card') completeOrder('card'); else openSheet(m, false);
  });

  /* ---------------------------------------------------------------- complete (test mode) */
  function completeOrder(method, express) {
    const t = totals(), count = Bag.count();
    const label = { card: `${brandOf(cc.value.replace(/\D/g, '')) === 'mc' ? 'Mastercard' : 'Visa'} •••• ${cc.value.replace(/\D/g, '').slice(-4)}`, applepay: 'Apple Pay', googlepay: 'Google Pay', afterpay: 'Afterpay (4 payments)', klarna: form.klarna.value === '30' ? 'Klarna (pay in 30 days)' : 'Klarna (pay in 4)', gem: 'Gem Interest Free (6 months)' }[method];
    $('#procText').textContent = method === 'card' || express ? 'Processing payment…' : `Confirming with ${label.split(' ')[0]}…`;
    $('#processing').classList.add('is-on');
    setTimeout(() => {
      $('#processing').classList.remove('is-on');
      const order = 'KV-' + String(Math.floor(100000 + Math.random() * 900000));
      const shipLabel = { standard: 'NZ Post standard, 2–4 working days', express: 'Express courier, next working day', collect: 'Click & Collect, Ponsonby Rd studio' }[form.ship.value];
      const who = form.first.value || 'there';
      $('#doneText').textContent = `Thanks ${who}! Your order ${order} is confirmed. ${form.email.value ? `A receipt is on its way to ${form.email.value}.` : 'Your receipt will be sent to the email in your wallet.'}`;
      $('#doneCard').innerHTML = `<div><span>Order</span><b>${order}</b></div><div><span>Items</span><b>${count}</b></div><div><span>Paid with</span><b>${label}</b></div><div><span>Delivery</span><b>${shipLabel}</b></div>${promoCode ? `<div><span>Code</span><b>${promoCode}</b></div>` : ''}<div><span>Total (incl. GST ${nzd(t.gst)})</span><b>${nzd(t.total)}</b></div>`;
      document.body.classList.add('is-done');
      Bag.clear();
      $('#coMain').hidden = true; $('#coDone').hidden = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1700);
  }

  render();
})();
