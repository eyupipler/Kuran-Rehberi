/*
 * Kuran Rehberi service worker.
 *
 * Strateji:
 *  - Uygulama kabuğu (HTML): önce ağ, yanıt yoksa önbellek, o da yoksa çevrimdışı sayfası.
 *  - Derleme çıktısı (/_next/static): içerik hash'li olduğu için önce önbellek.
 *  - API: stale-while-revalidate. Kuran metni ve meal değişmediği için önbellekten
 *    anında sunmak güvenli; arka planda tazelenir. Okunan sureler böylece çevrimdışı kalır.
 *
 * API dışındaki çapraz kaynak istekleri (ör. Google Fonts) araya girilmeden geçirilir:
 * bunlar no-cors isteklerdir ve opak yanıt döndürmek tarayıcıda kaynağın reddedilmesine yol açar.
 *
 * VERSION değiştiğinde eski önbellekler silinir.
 */

const VERSION = 'v2';
const SHELL_CACHE = `kr-shell-${VERSION}`;
const STATIC_CACHE = `kr-static-${VERSION}`;
const API_CACHE = `kr-api-${VERSION}`;

const OFFLINE_URL = '/offline.html';
const SHELL_ASSETS = ['/', OFFLINE_URL, '/manifest.json', '/logo.png'];

// API önbelleği sınırsız büyümesin; en eski kayıtlar düşer.
const API_CACHE_LIMIT = 160;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const keep = new Set([SHELL_CACHE, STATIC_CACHE, API_CACHE]);
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((name) => !keep.has(name)).map((name) => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'skip-waiting') self.skipWaiting();
});

async function trimCache(cacheName, limit) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= limit) return;
  await Promise.all(keys.slice(0, keys.length - limit).map((key) => cache.delete(key)));
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Ağ yoksa ve önbellekte de yoksa isteği başarısızlığa bırakmak yerine
    // anlaşılır bir yanıt döndür; böylece sayfa tamamen çökmez.
    return new Response('', { status: 504, statusText: 'Çevrimdışı' });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const network = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone()).then(() => trimCache(cacheName, API_CACHE_LIMIT));
      }
      return response;
    })
    .catch(() => null);

  if (cached) return cached;

  const response = await network;
  if (response) return response;

  return new Response(JSON.stringify({ error: 'Çevrimdışısınız ve bu içerik daha önce açılmamış.' }), {
    status: 503,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

async function networkFirstNavigation(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = (await caches.match(request)) || (await caches.match('/'));
    return cached || caches.match(OFFLINE_URL);
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  // API çapraz kaynakta olabilir; istek CORS modunda olduğu için önbelleğe alınabilir.
  if (url.pathname.includes('/api/')) {
    event.respondWith(staleWhileRevalidate(request, API_CACHE));
    return;
  }

  // Geri kalan çapraz kaynak istekleri (yazı tipleri vb.) olduğu gibi geçer.
  if (!sameOrigin) return;

  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  if (/\.(png|ico|svg|webp|json|txt)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  }
});
