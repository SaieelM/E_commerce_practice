initPage('orders.html');
const placed = new URLSearchParams(location.search).get('placed');
api('/orders').then(list => {
  $('#content').innerHTML = (placed ? `<p class="panel" role="status">Order <b>${esc(placed)}</b> is confirmed.</p><br>` : '') +
    (list.length ? list.map(o => `<div class="panel order"><div class="row"><b>${esc(o.id)}</b><span class="tag">${esc(o.status)}</span></div>
    <small>${new Date(o.createdAt).toLocaleString('en-IN')} · ${esc(o.payment)}</small><p>${o.items.map(i => `${esc(i.name)} × ${i.qty}`).join(', ')}</p>
    <p><small>Deliver to ${esc(o.customer.name)}, ${esc(o.customer.address)}</small></p><b>Total ${fmt(o.totals.total)}</b></div>`).join('')
    : empty('No orders yet', 'Orders you place will appear here.'));
}).catch(e => toast(e.message));
