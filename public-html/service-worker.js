// /public-html/service-worker.js
const CACHE_NAME = 'tareas-udc-final-v4'; // Incrementa la versión si haces cambios
const urlsToCache = [
    './',
    './index.php',
    './style.css',
    './script.js',
    './manifest.json',
    './api/check_session.php', // Añadimos el verificador a la caché
    './icons/icon-192x192.png',
    './icons/icon-512x512.png'
];

self.addEventListener('install', e => e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(urlsToCache)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null))).then(() => self.clients.claim())));

self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET') return;
    
    // Estrategia Network First para la página principal
    if (e.request.mode === 'navigate') {
        e.respondWith(
            fetch(e.request).catch(() => caches.match('./index.php'))
        );
        return;
    }
    
    // Estrategia Cache First para todo lo demás
    e.respondWith(
        caches.match(e.request).then(res => res || fetch(e.request))
    );
});