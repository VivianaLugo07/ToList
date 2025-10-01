// /public-html/service-worker.js

const CACHE_NAME = 'tareas-udc-cache-final-v3'; // Un nombre nuevo para la caché

const urlsToCache = [
    './',
    './index.php',
    './style.css',
    './script.js',
    './manifest.json',
    './icons/icon-192x192.png',
    './icons/icon-512x512.png'
];

// --- INSTALL: Guarda los archivos ---
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting())
    );
});

// --- ACTIVATE: Limpia las cachés viejas ---
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.map(key => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }))
        ).then(() => self.clients.claim())
    );
});

// --- FETCH: Estrategia HÍBRIDA (LA PARTE CLAVE) ---
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    // ESTRATEGIA 1: Network First para la página principal (index.php)
    if (event.request.mode === 'navigate') {
        event.respondWith(
            // 1. Intenta ir a la red primero
            fetch(event.request)
                .catch(() => {
                    // 2. Si la red falla, devuelve la página desde la caché
                    return caches.match('./index.php');
                })
        );
        return;
    }

    // ESTRATEGIA 2: Cache First para todo lo demás (CSS, JS, imágenes)
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});