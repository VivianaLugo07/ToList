const CACHE_NAME = 'tareas-udc-cache-final-v22'; // Un nombre nuevo para la caché
    './',
    './index.php',
    './style.css',
    './script.js',
    './manifest.json',
    './api/check_session.php', // Añadimos el verificador a la caché
    './icons/icon-192x192.png',
    './icons/icon-512x512.png'
;

/**
 * evento 'install': Se dispara cuando el service worker se instala.
 * 1. self.skipWaiting(): Forza al nuevo SW a activarse inmediatamente.
 * 2. caches.open(): Abre el caché especificado.
 * 3. cache.addAll(): Descarga y almacena todos los assets definidos.
 */
self.addEventListener("install", (event) => {
    self.skipWaiting(); // Hace que el nuevo SW se active en cuanto termine la instalación.
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log("Cache abierto. Cacheando assets iniciales...");
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => console.log("Assets cacheados correctamente."))
            .catch((err) => console.error("Falló el cacheo inicial de assets:", err))
    );
});

/**
 * evento 'activate': Se dispara cuando el service worker se activa.
 * Es el lugar ideal para limpiar cachés antiguos.
 * 1. self.clients.claim(): Permite que el SW tome control de las pestañas abiertas inmediatamente.
 * 2. caches.keys(): Obtiene los nombres de todos los cachés existentes.
 * 3. Promise.all(): Espera a que todas las promesas de borrado se completen.
 * 4. caches.delete(): Borra los cachés que no coincidan con CACHE_NAME.
 */

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((oldKey) => {
                        console.log(`Borrando caché antiguo: ${oldKey}`);
                        return caches.delete(oldKey);
                    })
            )
        ).then(() => self.clients.claim()) // ¡Mejora clave!
    );
});

/**
 * evento 'fetch': Intercepta todas las peticiones de red.
 * Aquí se definen las estrategias de caché.
 */
self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // 1. Ignorar peticiones que no son GET para que Background Sync funcione.
    // 2. Ignorar peticiones de autenticación/cierre de sesión y desarrollo.
    //    También se ignoran las peticiones que no son GET.
    if (
        request.method !== 'GET' ||
        url.pathname.includes("__vscode_livepreview_injected_script") ||
        url.pathname.endsWith('/logout.php') ||
        url.pathname.endsWith('/federacion.php') ||
        url.search.includes('logout=true')
    ) {
        // No interceptar estas peticiones. Dejar que el navegador las maneje.
        // Esto es CRÍTICO para que el logout funcione.
        return; 
    }

    // 3. Estrategia "Network First" para la navegación principal (HTML).
    // Intenta ir a la red; si falla, sirve el index.php desde el caché.
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request).catch(() => {
                console.log('Offline: Sirviendo página principal desde caché.');
                return caches.match("/proyecto/index.php");
            })
        );
        return;
    }

    // 4. Estrategia "Network Only" para la API.
    // Siempre va a la red para obtener datos frescos. Si falla (offline),
    // la lógica en app.js (catch) se encargará de usar localStorage.
    if (url.pathname.endsWith("/tareas.php")) {
        return; // Deja que la petición continúe a la red.
    }

    // 5. Estrategia "Cache First" para los demás assets (JS, CSS, imágenes).
    // Es la más rápida: primero busca en caché, y si no lo encuentra, va a la red.
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse; // Devolver desde caché si existe.
            }

            // Si no está en caché, ir a la red y cachear la respuesta.
            // No es necesario clonar la respuesta aquí si no se va a usar después.
            return fetch(request);
        })
    );
});

// ----- Background Sync -----
// Esta parte ya estaba perfecta, no necesita cambios.

self.addEventListener('sync', (event) => {
    console.log('Evento Sync recibido:', event.tag);

    if (event.tag === 'sync-tasks') {
        event.waitUntil(notifyClientsToSync());
    }
});

function notifyClientsToSync() {
    return self.clients.matchAll({
        includeUncontrolled: true,
        type: 'window',
    }).then(clients => {
        if (clients && clients.length) {
            clients.forEach(client => {
                client.postMessage({ type: 'SYNC_NOW' });
            });
        }
    });
}