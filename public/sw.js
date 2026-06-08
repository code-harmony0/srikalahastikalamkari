/**
 * Service Worker for offline support and aggressive caching
 * Implements Cache-First strategy for static assets
 * Network-First for API calls with offline fallback
 */

const isDev = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

if (isDev) {
  // Install event - immediately skip waiting to activate the new version
  self.addEventListener('install', (event) => {
    self.skipWaiting();
  });

  // Activate event - clean ALL caches immediately and claim clients
  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => caches.delete(name))
        );
      }).then(() => self.clients.claim())
    );
  });

  // Fetch event - do not intercept any requests in development to allow hot reloading and HMR
  self.addEventListener('fetch', (event) => {
    // No-op: browser will fetch normally
  });
} else {
  const CACHE_NAME = 'kalamkari-v1';
  const STATIC_CACHE = 'kalamkari-static-v1';
  const IMAGE_CACHE = 'kalamkari-images-v1';
  const API_CACHE = 'kalamkari-api-v1';

  // Assets to cache on install
  const STATIC_ASSETS = [
    '/',
    '/products',
    '/cart',
    '/checkout',
    '/offline.html',
  ];

  // Install event - cache static assets
  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
    );
    self.skipWaiting();
  });

  // Activate event - clean old caches
  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('kalamkari-') && name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
    );
    self.clients.claim();
  });

  // Fetch event - implement caching strategies
  self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip chrome-extension and other non-http requests
    if (!url.protocol.startsWith('http')) return;

    // Strategy 1: Cache First for static assets (JS, CSS, fonts)
    if (isStaticAsset(request)) {
      event.respondWith(cacheFirst(request, STATIC_CACHE));
      return;
    }

    // Strategy 2: Cache First with stale-while-revalidate for images
    if (isImage(request)) {
      event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
      return;
    }

    // Strategy 3: Network First with cache fallback for API
    if (isAPI(request)) {
      event.respondWith(networkFirst(request, API_CACHE));
      return;
    }

    // Strategy 4: Network First for pages
    if (isPage(request)) {
      event.respondWith(networkFirst(request, CACHE_NAME));
      return;
    }
  });

  // Helper functions
  function isStaticAsset(request) {
    return /\.(js|css|woff2?|json)$/.test(request.url);
  }

  function isImage(request) {
    return /\.(png|jpg|jpeg|gif|webp|avif|svg)$/.test(request.url);
  }

  function isAPI(request) {
    return request.url.includes('/api/') || 
           request.url.includes('supabase.co') ||
           request.url.includes('razorpay');
  }

  function isPage(request) {
    return request.mode === 'navigate';
  }

  // Cache First strategy
  async function cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    try {
      const response = await fetch(request);
      cache.put(request, response.clone());
      return response;
    } catch (error) {
      return cached || new Response('Offline', { status: 503 });
    }
  }

  // Network First strategy
  async function networkFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    
    try {
      const networkResponse = await fetch(request);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    } catch (error) {
      const cached = await cache.match(request);
      if (cached) {
        return cached;
      }
      // Return offline fallback for pages
      if (isPage(request)) {
        return caches.match('/offline.html');
      }
      throw error;
    }
  }

  // Stale While Revalidate strategy
  async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    // Fetch in background
    const fetchPromise = fetch(request).then((response) => {
      cache.put(request, response.clone());
      return response;
    }).catch(() => cached);
    
    // Return cached immediately if available
    return cached || fetchPromise;
  }

  // Background sync for offline form submissions
  self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-orders') {
      event.waitUntil(syncPendingOrders());
    }
  });

  async function syncPendingOrders() {
    // Sync orders that were created while offline
    const pending = await getPendingOrders();
    for (const order of pending) {
      try {
        await fetch('/api/orders', {
          method: 'POST',
          body: JSON.stringify(order),
          headers: { 'Content-Type': 'application/json' },
        });
        await removePendingOrder(order.id);
      } catch (error) {
        console.error('Failed to sync order:', order.id);
      }
    }
  }

  // Push notifications (optional)
  self.addEventListener('push', (event) => {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        data: data.url,
      })
    );
  });
}
