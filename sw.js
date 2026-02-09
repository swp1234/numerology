const CACHE_NAME = 'numerology-v1';
const ASSETS_TO_CACHE = [
    './index.html',
    './css/style.css',
    './js/i18n.js',
    './js/numerology-data.js',
    './js/app.js',
    './js/locales/ko.json',
    './js/locales/en.json',
    './js/locales/ja.json',
    './js/locales/es.json',
    './js/locales/pt.json',
    './js/locales/zh.json',
    './js/locales/id.json',
    './js/locales/tr.json',
    './js/locales/de.json',
    './js/locales/fr.json',
    './js/locales/hi.json',
    './js/locales/ru.json',
    './manifest.json',
    './icon-192.svg',
    './icon-512.svg'
];

// Install event - cache assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS_TO_CACHE))
            .catch(err => console.error('Cache install failed:', err))
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version if available
                if (response) return response;

                // Otherwise fetch from network
                return fetch(event.request)
                    .then(response => {
                        // Don't cache if not successful
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }

                        // Clone response for caching
                        const responseToCache = response.clone();

                        // Cache successful responses (except analytics/ads)
                        if (!event.request.url.includes('analytics') &&
                            !event.request.url.includes('ads') &&
                            !event.request.url.includes('google')) {
                            caches.open(CACHE_NAME)
                                .then(cache => cache.put(event.request, responseToCache))
                                .catch(err => console.error('Cache update failed:', err));
                        }

                        return response;
                    })
                    .catch(err => {
                        console.error('Fetch failed:', err);
                        // You could return a custom offline page here
                        return new Response('Network error occurred', { status: 0, statusText: 'Service Unavailable' });
                    });
            })
    );
});

// Handle background sync for future features
self.addEventListener('sync', event => {
    if (event.tag === 'sync-results') {
        event.waitUntil(syncResults());
    }
});

async function syncResults() {
    // Implement sync logic if needed in future
    return Promise.resolve();
}
