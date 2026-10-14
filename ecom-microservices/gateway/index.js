// API gateway: serves the frontend and routes /api/<service>/... to the right service.
const http = require('http'), fs = require('fs'), path = require('path');
const { urls } = require('../shared/mini');
const WEB = path.join(__dirname, '../frontend');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x'), m = u.pathname.match(/^\/api\/(\w+)(\/.*)?$/);
  if (u.pathname === '/api/health') {
    const out = {}; await Promise.all(Object.entries(urls).map(async ([k, v]) => { try { out[k] = (await (await fetch(v + '/health')).json()).status; } catch { out[k] = 'down'; } }));
    res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify(out));
  }
  if (m) {
    if (!urls[m[1]]) { res.writeHead(404); return res.end('{"error":"Unknown service"}'); }
    const t = new URL(urls[m[1]]);
    const p = http.request({ host: t.hostname, port: t.port, path: (m[2] || '/') + u.search, method: req.method, headers: req.headers },
      r => { res.writeHead(r.statusCode, r.headers); r.pipe(res); });
    p.on('error', () => { res.writeHead(502, { 'Content-Type': 'application/json' }); res.end('{"error":"Service unavailable"}'); });
    return req.pipe(p);
  }
  const file = path.join(WEB, u.pathname === '/' ? 'index.html' : path.normalize(u.pathname));
  if (!file.startsWith(WEB) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('Not found'); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'text/plain' }); fs.createReadStream(file).pipe(res);
}).listen(process.env.PORT || 3000, () => console.log('[gateway] listening on :3000'));
