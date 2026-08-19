/* ============================================================
   Offline for the scorer.

   A match tracker is used on a court, which is exactly where signal
   isn't. The scorer needs nothing from the network once loaded — the
   engines run locally and matches are stored locally — so the only
   thing standing between it and working offline is the page assets.

   Deliberately narrow:

   - The **spectate** pages are never served from the cache. A live
     score read from a cache is a stale score presented as live, which
     is worse than an error. They stay network-only.
   - The relay's API is never cached, for the same reason.
   - Everything else is stale-while-revalidate: instant offline, and a
     background fetch keeps the next load current.
   ============================================================ */

const CACHE = 'scorius-v1';

/** Shells worth having before they are first asked for. */
const PRECACHE = ['/score', '/', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      // Individually, so one 404 can't fail the whole install and leave the
      // scorer with no offline copy at all.
      .then((cache) => Promise.all(PRECACHE.map((url) => cache.add(url).catch(() => {}))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Live data must never come from a cache. A spectator would rather see
  // "reconnecting" than yesterday's score rendered as this minute's.
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/w/') || url.pathname === '/watch') {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
