const { service, call, urls } = require('../../shared/mini');
const carts = new Map(); // userId -> { productId: qty }
const of = u => carts.get(u) || carts.set(u, {}).get(u);
async function view(user) { // prices always come from product-service, never from the browser
  const c = of(user), ids = Object.keys(c);
  const prods = ids.length ? await call(`${urls.products}/?ids=${ids}`) : [];
  const lines = prods.map(product => ({ product, qty: c[product.id] }));
  const subtotal = lines.reduce((a, l) => a + l.product.price * l.qty, 0);
  const shipping = subtotal === 0 || subtotal >= 2000 ? 0 : 99, gst = Math.round(subtotal * 0.18);
  return { lines, count: lines.reduce((a, l) => a + l.qty, 0), totals: { subtotal, gst, shipping, total: subtotal + shipping + gst } };
}
service('cart-service', 4003, [
  ['GET', '/', ({ user }) => view(user)],
  ['POST', '/items', async ({ user, body }) => {
    await call(`${urls.products}/${+body.id}`); const c = of(user);
    c[body.id] = (c[body.id] || 0) + (+body.qty || 1); if (c[body.id] <= 0) delete c[body.id];
    return view(user);
  }],
  ['DELETE', '/items/:id', ({ user, params }) => { delete of(user)[params.id]; return view(user); }],
  ['DELETE', '/', ({ user }) => { carts.set(user, {}); return view(user); }],
]);
