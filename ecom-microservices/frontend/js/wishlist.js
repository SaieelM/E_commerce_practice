initPage('wishlist.html');
async function load() {
  const list = await api('/wishlist');
  $('#all').hidden = !list.length;
  $('#grid').innerHTML = list.length ? list.map(p => card(p, true)).join('') : empty('Your wishlist is empty', 'Tap the heart on any product to save it here.');
}
wireActions($('#grid'), a => a === 'wish' && load());
$('#all').addEventListener('click', async () => {
  for (const p of await api('/wishlist')) await api('/cart/items', { method: 'POST', body: { id: p.id, qty: 1 } });
  toast('Added all to order'); refreshNav();
});
load().catch(e => toast(e.message));
