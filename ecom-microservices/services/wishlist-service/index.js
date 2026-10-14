const { service, call, urls } = require('../../shared/mini');
const lists = new Map(); // userId -> Set(productId)   (in-memory, no database)
const of = u => lists.get(u) || lists.set(u, new Set()).get(u);
service('wishlist-service', 4002, [
  ['GET', '/ids', ({ user }) => [...of(user)]],
  ['GET', '/', ({ user }) => of(user).size ? call(`${urls.products}/?ids=${[...of(user)]}`) : []],
  ['POST', '/toggle/:id', async ({ user, params }) => {
    const id = +params.id; await call(`${urls.products}/${id}`); // 404s if product is unknown
    const s = of(user), saved = !s.has(id); saved ? s.add(id) : s.delete(id);
    return { saved, count: s.size };
  }],
]);
