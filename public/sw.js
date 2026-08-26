const CACHE_NAME = 'survey-app-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.webmanifest',
    '/icons/people.png',
    '/assets/index-CMqXfWNy.js',
    '/assets/index-B5ATAUPr.css',
];

// Установка Service Worker
self.addEventListener('install', (event) => {
    console.log('[SW] Установка...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Кэширование основных файлов');
                return cache.addAll(STATIC_ASSETS);
            })
            .catch((error) => {
                console.error('[SW] Ошибка кэширования:', error);
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});


self.addEventListener('activate', (event) => {
    console.log('[SW] Активация...');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[SW] Удаление старого кэша:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[SW] Активация завершена');
                return self.clients.claim();
            })
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    if (event.request.url.includes('/api/')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(event.request)
                    .then((response) => {
                        if (!response || response.status !== 200 || response.type === 'opaque') {
                            return response;
                        }

                        const url = new URL(event.request.url);
                        if (url.origin === location.origin) {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(event.request, responseClone);
                                console.log('[SW] Закэшировано:', event.request.url);
                            });
                        }
                        return response;
                    })
                    .catch(() => {
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }

                        return new Response('Offline', {
                            status: 408,
                            statusText: 'Offline',
                            headers: new Headers({
                                'Content-Type': 'text/plain; charset=utf-8'
                            })
                        });
                    });
            })
    );
});