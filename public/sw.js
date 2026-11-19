
/* LifeTrack Training — Lot 1-D. Cache isolé par nom et version. */
const VERSION = '2-E.5.0';
const PREFIX = 'lifetrack-training-pwa-';
const CACHE = PREFIX + VERSION;
const ROOT = new URL('./', self.location.href).pathname;
const CORE = [ROOT, ROOT + 'manifest.webmanifest', ROOT + 'Icons/icon-192.png', ROOT + 'Icons/icon-512.png', ROOT + 'Icons/icon-180.png', ROOT + 'sounds/fin-effort.wav', ROOT + 'sounds/fin-repos.wav'];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // Récupère l'index et les ressources Vite hachées pour garantir le démarrage hors ligne.
    const response = await fetch(ROOT, {cache: 'reload'});
    if (!response.ok) throw new Error('Index indisponible pendant l’installation PWA');
    const html = await response.clone().text();
    const assetPaths = [...html.matchAll(/(?:src|href)=["']([^"']+\.(?:js|css)(?:\?[^"']*)?)["']/g)]
      .map(match => new URL(match[1], self.location.origin).pathname)
      .filter(path => path.startsWith(ROOT));
    await cache.put(ROOT, response);
    await cache.addAll([...new Set([...CORE.slice(1), ...assetPaths])]);
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith(PREFIX) && key !== CACHE) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin || !url.pathname.startsWith(ROOT)) return;

  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const res = await fetch(req);
        if (res.ok) return res;
      } catch (_) { /* offline */ }
      return (await caches.match(ROOT)) || Response.error();
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    try { return await fetch(req); } catch (_) { return Response.error(); }
  })());
});
