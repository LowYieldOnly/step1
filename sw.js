/* ============================================================
   LOW YIELD ONLY — Service Worker (online-first)

   This site is used online, in the browser, on phones and
   computers. So every request tries the NETWORK FIRST: users
   always get the latest version the moment they reload — no
   version bumping, no stale pages, no stale icons, no reinstall.
   A cached copy is kept only as a fallback for when the network
   is unavailable (a free bonus, not a goal).

   Saved progress is NOT stored here — it lives in each user's
   Firestore account (with a local cache). This only handles the
   static page, so clearing it can never lose study data.
   ============================================================ */

const CACHE = 'lyo-runtime';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Cross-origin (Firebase, Google auth, gstatic CDN) manages itself.
  if (url.origin !== self.location.origin) return;

  // Network-first for everything same-origin: always fresh when online,
  // fall back to the last cached copy only if the network fails.
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then((cached) =>
          cached || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)
        )
      )
  );
});
