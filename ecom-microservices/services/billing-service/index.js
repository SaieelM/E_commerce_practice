const { service, call, fail, urls } = require('../../shared/mini');
function validate(f) {
  const e = {}, s = v => String(v ?? '');
  if (s(f.name).trim().length < 2) e.name = 'Enter your full name';
  if (!/^\S+@\S+\.\S+$/.test(s(f.email))) e.email = 'Enter a valid email';
  if (!/^\d{10}$/.test(s(f.phone))) e.phone = 'Enter a 10-digit phone number';
  if (s(f.address).trim().length < 8) e.address = 'Enter your full address';
  if (!/^\d{6}$/.test(s(f.pin))) e.pin = 'Enter a 6-digit PIN code';
  if (!['upi', 'card', 'cod'].includes(f.pay)) e.pay = 'Choose a payment method';
  if (f.pay === 'upi' && !/^[\w.\-]{2,}@\w{2,}$/.test(s(f.upi))) e.upi = 'Enter a UPI ID like name@bank';
  if (f.pay === 'card' && !/^\d{16}$/.test(s(f.card).replace(/\s/g, ''))) e.card = 'Enter a 16-digit card number';
  return e;
}
// Orchestrates: cart-service (read) -> order-service (create) -> cart-service (clear). Payment is simulated.
service('billing-service', 4005, [
  ['POST', '/checkout', async ({ user, body: f }) => {
    const fields = validate(f); if (Object.keys(fields).length) throw fail(422, 'Fix the highlighted fields', { fields });
    const cart = await call(`${urls.cart}/`, { user });
    if (!cart.lines.length) throw fail(400, 'Your order is empty');
    const payment = f.pay === 'card' ? 'Card ending ' + f.card.replace(/\s/g, '').slice(-4) : f.pay === 'upi' ? `UPI (${f.upi})` : 'Cash on delivery';
    const order = await call(`${urls.orders}/`, { method: 'POST', user, body: {
      customer: { name: f.name.trim(), email: f.email.trim(), phone: f.phone, address: `${f.address.trim()} – ${f.pin}` },
      payment, items: cart.lines.map(l => ({ name: l.product.name, qty: l.qty, price: l.product.price })), totals: cart.totals } });
    await call(`${urls.cart}/`, { method: 'DELETE', user });
    return order;
  }],
]);
