const { service } = require('../../shared/mini');
const orders = new Map(); // userId -> [order]
service('order-service', 4004, [
  ['POST', '/', ({ user, body }) => {
    const order = { id: 'KC-' + Date.now().toString().slice(-7) + Math.floor(10 + Math.random() * 90), createdAt: new Date().toISOString(), status: 'Confirmed', ...body };
    (orders.get(user) || orders.set(user, []).get(user)).unshift(order); return order;
  }],
  ['GET', '/', ({ user }) => orders.get(user) || []],
]);
