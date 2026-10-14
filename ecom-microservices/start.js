// Launches every service as its own OS process (zero npm dependencies, Node 18+).
const { spawn } = require('child_process');
const apps = ['services/product-service','services/wishlist-service','services/cart-service','services/order-service','services/billing-service','gateway'];
const kids = apps.map(a => { const p = spawn(process.execPath, [a + '/index.js'], { stdio: 'inherit' }); p.on('exit', c => console.log(`${a} exited (${c})`)); return p; });
process.on('SIGINT', () => { kids.forEach(k => k.kill()); process.exit(); });
process.on('SIGTERM', () => { kids.forEach(k => k.kill()); process.exit(); });
console.log('\nStore: http://localhost:3000\n');
