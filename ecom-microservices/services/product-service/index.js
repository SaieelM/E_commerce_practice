const { service, fail } = require('../../shared/mini');
const P = [
  { id: 1, name: 'Tide Bowl', cat: 'Bowls', price: 1200, c: '#2a7a74', s: 'bowl' },
  { id: 2, name: 'Saffron Mug', cat: 'Mugs', price: 650, c: '#e0a63a', s: 'mug' },
  { id: 3, name: 'Monsoon Vase', cat: 'Vases', price: 2400, c: '#3b5b9a', s: 'vase' },
  { id: 4, name: 'Laterite Bowl', cat: 'Bowls', price: 950, c: '#b3502f', s: 'bowl' },
  { id: 5, name: 'Dusk Mug', cat: 'Mugs', price: 700, c: '#6b4f8f', s: 'mug' },
  { id: 6, name: 'Palm Vase', cat: 'Vases', price: 1850, c: '#4d8a3f', s: 'vase' },
  { id: 7, name: 'Chalk Bowl', cat: 'Bowls', price: 1100, c: '#8a93a6', s: 'bowl' },
  { id: 8, name: 'Ember Mug', cat: 'Mugs', price: 620, c: '#c8443a', s: 'mug' }];
service('product-service', 4001, [
  ['GET', '/', ({ query }) => {
    const ids = query.get('ids')?.split(',').map(Number), cat = query.get('cat'), q = (query.get('q') || '').toLowerCase();
    return P.filter(p => (!ids || ids.includes(p.id)) && (!cat || cat === 'All' || p.cat === cat) && p.name.toLowerCase().includes(q));
  }],
  ['GET', '/:id', ({ params }) => P.find(p => p.id === +params.id) || (() => { throw fail(404, 'Product not found'); })()],
]);
