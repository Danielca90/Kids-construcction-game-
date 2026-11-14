// Fichitas: guarda el juego en el dispositivo para jugar sin internet.
// Cambia VERSION cada vez que se publique una versión nueva.
const VERSION = 'fichitas-v3';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png',
  './apple-touch-icon.png', './3d/', './3d/index.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Con internet: trae la versión nueva (máximo 2,5 s). Sin internet o lento: abre la copia guardada al instante.
function withTimeout(p, ms) { return new Promise((res, rej) => { const t = setTimeout(() => rej('timeout'), ms); p.then(v => { clearTimeout(t); res(v) }, e => { clearTimeout(t); rej(e) }) }) }
function fallbackFor(url) { return url.pathname.includes('/3d') ? './3d/index.html' : './index.html' }

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  const isPage = req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('.html');
  if (isPage) {
    e.respondWith((async () => {
      const cache = await caches.open(VERSION);
      try {
        const r = await withTimeout(fetch(req), 2500);
        if (r && r.ok) cache.put(req, r.clone());
        return r;
      } catch (err) {
        return (await cache.match(req, { ignoreSearch: true })) || (await cache.match(fallbackFor(url)));
      }
    })());
  } else {
    // íconos y demás: primero la copia guardada, y se actualiza en segundo plano
    e.respondWith(caches.open(VERSION).then(async cache => {
      const hit = await cache.match(req, { ignoreSearch: true });
      const net = fetch(req).then(r => { if (r && r.ok) cache.put(req, r.clone()); return r }).catch(() => hit);
      return hit || net;
    }));
  }
});
