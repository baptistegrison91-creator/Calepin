// Calepin : fonctionnement hors connexion.
// L'app s'ouvre depuis le cache, puis se met à jour en arrière-plan : une nouvelle version s'affiche au lancement suivant.
const CACHE = 'calepin-v1';
const FICHIERS = ['./', 'index.html', 'manifest.webmanifest', 'icone-180.png', 'icone-192.png', 'icone-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const enCache = await c.match(e.request, { ignoreSearch: true });
    const reseau = fetch(e.request).then(r => { if (r && (r.ok || r.type === 'opaque')) c.put(e.request, r.clone()); return r; }).catch(() => null);
    return enCache || (await reseau) || new Response('Hors connexion', { status: 503 });
  }));
});
