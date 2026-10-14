initPage('order.html');
const root = $('#content');
async function load() {
  const c = await api('/cart');
  if (!c.lines.length) { root.innerHTML = empty('Your order is empty', 'Add something from the shop to get started.'); return refreshNav(); }
  root.innerHTML = `<div class="layout"><div class="panel">${c.lines.map(({ product: p, qty }) => `<div class="line">${vessel(p)}</div><div><b>${p.name}</b><div><small>${fmt(p.price)} each</small></div>
  <div class="qty"><button data-id="${p.id}" data-n="-1" aria-label="Decrease quantity">−</button><span>${qty}</span><button data-id="${p.id}" data-n="1" aria-label="Increase quantity">+</button>
  <button class="btn ghost sm" data-del="${p.id}">Remove</button></div></div><b>${fmt(p.price * qty)}</b></div>`).join('')}</div>${summary(c.totals, true)}</div>`;
  refreshNav();
}
root.addEventListener('click', async e => {
  const b = e.target.closest('button'); if (!b) return;
  try {
    if (b.dataset.del) await api('/cart/items/' + b.dataset.del, { method: 'DELETE' });
    else if (b.dataset.n) await api('/cart/items', { method: 'POST', body: { id: +b.dataset.id, qty: +b.dataset.n } });
    else return; load();
  } catch (err) { toast(err.message); }
});
load().catch(e => toast(e.message));
