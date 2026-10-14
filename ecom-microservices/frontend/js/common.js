// Shared helpers only (API client, nav, product card). Each page owns its logic in js/<page>.js
const $ = (s, r = document) => r.querySelector(s);
const fmt = n => '₹' + n.toLocaleString('en-IN');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const USER = (() => { try { let u = localStorage.getItem('kiln-uid'); if (!u) { u = (crypto.randomUUID?.() || String(Math.random()).slice(2)); localStorage.setItem('kiln-uid', u); } return u; } catch { return 'guest'; } })();
async function api(path, { method = 'GET', body } = {}) {
  const r = await fetch('/api' + path, { method, headers: { 'Content-Type': 'application/json', 'x-user-id': USER }, body: body && JSON.stringify(body) });
  const d = await r.json(); if (!r.ok) throw Object.assign(new Error(d.error || 'Request failed'), { fields: d.fields }); return d;
}
const SHAPES = {
  bowl: '<path d="M10 38H90C90 72 70 88 50 88C30 88 10 72 10 38Z"/>',
  vase: '<path d="M40 12H60V28C86 42 84 82 50 90C16 82 14 42 40 28Z"/>',
  mug: '<path d="M20 22H70V72C70 84 60 88 45 88C30 88 20 84 20 72Z"/><path d="M70 34H78C92 34 92 62 78 62H70" fill="none" stroke-width="7" stroke="currentColor"/>' };
const vessel = p => `<div class="tile" style="background:color-mix(in srgb,${p.c} 18%,var(--surface));color:${p.c}"><svg viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">${SHAPES[p.s]}</svg>`;
const card = (p, saved) => `<article class="card">${vessel(p)}<button class="heart" data-a="wish" data-id="${p.id}" aria-pressed="${saved}" aria-label="Wishlist: ${p.name}">${saved ? '♥' : '♡'}</button></div>
<div class="info"><h3>${p.name}</h3><small>${p.cat}</small><b>${fmt(p.price)}</b><button class="btn sm" data-a="add" data-id="${p.id}">Add to order</button></div></article>`;
const empty = (h, t, l = 'Browse the shop') => `<div class="empty"><h2>${h}</h2><p>${t}</p><a class="btn" href="index.html">${l}</a></div>`;
const summary = (t, btn) => `<aside class="panel sum"><h3 style="margin-bottom:8px">Summary</h3><div><span>Subtotal</span><span>${fmt(t.subtotal)}</span></div>
<div><span>GST (18%)</span><span>${fmt(t.gst)}</span></div><div><span>Delivery</span><span>${t.shipping ? fmt(t.shipping) : 'Free'}</span></div>
<div class="tot"><span>Total</span><span>${fmt(t.total)}</span></div>${btn ? '<a class="btn" style="display:block;margin-top:12px" href="billing.html">Continue to billing</a>' : ''}</aside>`;
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 1600); }
const PAGES = [['index.html', 'Shop'], ['wishlist.html', 'Wishlist', 'w'], ['order.html', 'Order', 'c'], ['billing.html', 'Billing'], ['orders.html', 'My orders']];
function initPage(active) {
  $('#hdr').innerHTML = `<div class="bar"><a class="logo" href="index.html">Kiln &amp; Co.</a><nav aria-label="Main">${PAGES.map(([h, l, k]) =>
    `<a href="${h}" ${h === active ? 'aria-current="page"' : ''}>${l}${k ? `<b id="n-${k}"></b>` : ''}</a>`).join('')}</nav></div>`;
  refreshNav();
}
async function refreshNav() {
  try { const [w, c] = await Promise.all([api('/wishlist/ids'), api('/cart')]);
    $('#n-w').textContent = w.length || ''; $('#n-c').textContent = c.count || ''; } catch {}
}
function wireActions(root, after) { // add-to-order + wishlist buttons, used by Home and Wishlist pages
  root.addEventListener('click', async e => {
    const b = e.target.closest('[data-a]'); if (!b || !['add', 'wish'].includes(b.dataset.a)) return; const id = +b.dataset.id;
    try {
      if (b.dataset.a === 'add') { await api('/cart/items', { method: 'POST', body: { id, qty: 1 } }); toast('Added to order'); }
      else { const r = await api('/wishlist/toggle/' + id, { method: 'POST' }); b.setAttribute('aria-pressed', r.saved); b.textContent = r.saved ? '♥' : '♡'; toast(r.saved ? 'Saved to wishlist' : 'Removed from wishlist'); }
      refreshNav(); after && after(b.dataset.a);
    } catch (err) { toast(err.message); }
  });
}
