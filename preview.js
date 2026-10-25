'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'dist');
const tipe = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml',
  '.xml': 'application/xml', '.txt': 'text/plain', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };
http.createServer((q, r) => {
  const p = decodeURIComponent(new URL(q.url, 'http://x').pathname);
  let f = path.join(dir, p);
  if (!f.startsWith(dir)) { r.writeHead(403); return r.end(); }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) {
    r.writeHead(404, { 'Content-Type': tipe['.html'] });
    return r.end(fs.existsSync(path.join(dir, '404.html')) ? fs.readFileSync(path.join(dir, '404.html')) : 'Tidak ditemukan');
  }
  r.writeHead(200, { 'Content-Type': tipe[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(r);
}).listen(3000, () => console.log('Pratinjau: http://localhost:3000 (hentikan dengan Ctrl+C)'));
