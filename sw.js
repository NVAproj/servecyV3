const CACHE_NAME = 'survey-app-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.webmanifest',
    '/icons/people.png',
    '/assets/index-B1mkUXfl.js',
    '/assets/index-C8bj_9ZP.css',
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
                // Продолжаем установку даже если что-то не закэшировалось
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});

// Активация Service Worker
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

// Стратегия: Сначала кэш, потом сеть (Cache First)
self.addEventListener('fetch', (event) => {
    // Пропускаем не-GET запросы
    if (event.request.method !== 'GET') return;

    // Пропускаем запросы к API
    if (event.request.url.includes('/api/')) {
        return; // Пусть обрабатываются браузером
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Если нет в кэше, делаем запрос в сеть
                return fetch(event.request)
                    .then((response) => {
                        // Проверяем, что ответ валидный
                        if (!response || response.status !== 200 || response.type === 'opaque') {
                            return response;
                        }

                        // Кэшируем только GET-запросы к статическим ресурсам
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
                        // Если офлайн и запрос на страницу
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }

                        // Для других ресурсов возвращаем ошибку
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