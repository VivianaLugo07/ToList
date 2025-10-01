// /public-html/service-worker.js

const CACHE_NAME = 'tareas-udc-cache-v4'; 

const urlsToCache = [
    './',
    './index.php',
    './style.css',
    './script.js',
    './manifest.json',
    './icons/icon-192x192.png',
    './icons/icon-512x512.png'
];

// Evento 'install': Guarda los archivos y se prepara para activar
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting()) // Activa el nuevo SW más rápido
    );
});

// Evento 'activate': Limpia las cachés viejas para ahorrar espacio
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.map(key => {
                // Si la clave de la caché no es la actual, la borramos
                if (key !== CACHE_NAME) {
                    console.log('Borrando caché antigua:', key);
                    return caches.delete(key);
                }
            }))
        ).then(() => self.clients.claim()) // Toma control de las pestañas abiertas
    );
});

// Evento 'fetch': Responde desde la caché o la red, con una red de seguridad
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return; // Solo gestionamos peticiones GET

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Si encontramos el archivo en la caché, lo devolvemos. Si no, vamos a la red.
                return response || fetch(event.request);
            })
            .catch(() => {
                // Si todo falla (ni caché ni red), devolvemos la página principal
                if (event.request.destination === 'document') {
                    return caches.match('./index.php'); // Apuntamos a index.php
                }
                return new Response('', { status: 503, statusText: 'Offline' });
            })
    );
});