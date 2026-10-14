initPage('billing.html');
const form = $('#bill');
api('/cart').then(c => {
  if (!c.lines.length) { $('#content').innerHTML = empty('Nothing to bill yet', 'Add items to your order first.', 'Go to shop'); return; }
  $('#sum').innerHTML = summary(c.totals); $('#pay-btn').textContent = 'Pay ' + fmt(c.totals.total); form.hidden = false;
}).catch(e => toast(e.message));
form.addEventListener('input', e => { if (e.target.name !== 'pay') return;
  $('#upiF').hidden = e.target.value !== 'upi'; $('#cardF').hidden = e.target.value !== 'card'; });
form.addEventListener('submit', async e => {
  e.preventDefault(); const btn = $('#pay-btn'); btn.disabled = true;
  form.querySelectorAll('[data-e]').forEach(s => s.textContent = '');
  try { const o = await api('/billing/checkout', { method: 'POST', body: Object.fromEntries(new FormData(form)) });
    location.href = 'orders.html?placed=' + encodeURIComponent(o.id);
  } catch (err) {
    for (const [k, v] of Object.entries(err.fields || {})) { const s = form.querySelector(`[data-e="${k}"]`); if (s) s.textContent = v; }
    const first = Object.keys(err.fields || {})[0]; if (first && form.elements[first]) form.elements[first].focus(); toast(err.message); btn.disabled = false;
  }
});
