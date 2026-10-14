// Tiny service toolkit shared by every service: routing, JSON, errors, service-to-service calls.
const http = require('http');
const urls = {
  products: process.env.PRODUCT_URL || 'http://localhost:4001',
  wishlist: process.env.WISHLIST_URL || 'http://localhost:4002',
  cart: process.env.CART_URL || 'http://localhost:4003',
  orders: process.env.ORDER_URL || 'http://localhost:4004',
  billing: process.env.BILLING_URL || 'http://localhost:4005',
};
const fail = (status, message, extra = {}) => Object.assign(new Error(message), { status, extra });
const readBody = req => new Promise((ok, no) => { let b = ''; req.on('data', c => b += c);
  req.on('end', () => { try { ok(b ? JSON.parse(b) : {}); } catch { no(fail(400, 'Invalid JSON')); } }); });
function service(name, port, routes) {
  routes = [['GET', '/health', () => ({ service: name, status: 'up' })], ...routes];
  http.createServer(async (req, res) => {
    const send = (c, d) => { res.writeHead(c, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(d)); };
    try {
      const url = new URL(req.url, 'http://x'), body = await readBody(req);
      for (const [method, path, fn] of routes) {
        const m = req.method === method && url.pathname.match(new RegExp('^' + path.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '/?$'));
        if (m) return send(200, await fn({ params: m.groups || {}, query: url.searchParams, body, user: req.headers['x-user-id'] || 'guest' }));
      }
      send(404, { error: 'Route not found' });
    } catch (e) { send(e.status || 500, { error: e.message, ...e.extra }); }
  }).listen(port, () => console.log(`[${name}] listening on :${port}`));
}
async function call(url, { method = 'GET', user, body } = {}) {
  const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'x-user-id': user || 'guest' }, body: body && JSON.stringify(body) });
  const d = await r.json(); if (!r.ok) throw fail(r.status, d.error, d); return d;
}
module.exports = { service, fail, call, urls };
