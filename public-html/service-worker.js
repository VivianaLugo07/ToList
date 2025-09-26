// Nombre de la caché que almacenará nuestros archivos
const CACHE_NAME = 'tareas-udc-cache-v1';

// Lista de archivos esenciales de la aplicación para guardar
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './icons/icon-192x192.png',
    './icons/icon-512x512.png'
];

// Evento 'install': Guarda los archivos en la caché
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Archivos guardados en caché');
                return cache.addAll(urlsToCache);
            })
    );
});

// Evento 'fetch': Responde con los archivos de la caché si no hay conexión
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Si el archivo está en caché, lo devuelve. Si no, lo busca en la red.
                return response || fetch(event.request);
            })
    );
});