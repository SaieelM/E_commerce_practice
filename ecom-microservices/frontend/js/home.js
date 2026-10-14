initPage('index.html');
let saved = new Set(), cat = 'All', q = '', timer;
async function load() {
  const list = await api(`/products?cat=${cat}&q=${encodeURIComponent(q)}`);
  $('#grid').innerHTML = list.length ? list.map(p => card(p, saved.has(p.id))).join('') : '<p class="empty">No products match. Clear the search or pick another category.</p>';
}
wireActions($('#grid'));
$('#q').addEventListener('input', e => { q = e.target.value; clearTimeout(timer); timer = setTimeout(load, 200); });
$('#chips').addEventListener('click', e => { const b = e.target.closest('.chip'); if (!b) return; cat = b.dataset.c;
  document.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', c === b)); load(); });
api('/wishlist/ids').then(ids => { saved = new Set(ids); return load(); }).catch(e => toast(e.message));
