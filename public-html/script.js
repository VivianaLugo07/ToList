// /public-html/script.js

// --- SELECTORES Y VARIABLES GLOBALES ---
const tituloInput = document.getElementById("tituloTareas");
const descripcionInput = document.getElementById("descripcionTareas");
const btnAgregar = document.getElementById("btn_agregar");
const contenedor = document.getElementById("contenedor");
const btnLogout = document.getElementById('logout-btn');
const API_URL = '/proyecto/api/tareas.php';

let listaTareas = [];
let pendingOps = JSON.parse(localStorage.getItem('pendingOps')) || [];

// --- FUNCIONES AUXILIARES DE LOCALSTORAGE ---
function savePendingOps() {
    localStorage.setItem('pendingOps', JSON.stringify(pendingOps));
}

function saveTasksLocal() {
    localStorage.setItem('tasks', JSON.stringify(listaTareas.map(t => ({
        id: t.id || null,
        titulo: t.titulo,
        texto: t.texto,
        offline: t.offline || false
    }))));
}

// --- RENDERIZADO Y LÓGICA DE LA UI ---
function renderizarTareas() {
    contenedor.innerHTML = "";
    if (listaTareas.length === 0) {
        contenedor.innerHTML = "<p class='mensaje-vacio'>¡No hay tareas pendientes! ✨</p>";
        return;
    }
    listaTareas.forEach((tarea, index) => {
        const divTarea = document.createElement("div");
        divTarea.classList.add("lista_Tareas");

        const tituloP = document.createElement("p");
        tituloP.textContent = tarea.titulo;

        const textoSmall = document.createElement("small");
        textoSmall.textContent = tarea.texto;

        const eliminarBtn = document.createElement("button");
        eliminarBtn.textContent = "Eliminar";
        eliminarBtn.classList.add("btn-eliminar");
        eliminarBtn.onclick = (e) => {
            e.stopPropagation();
            eliminarTarea(tarea, index);
        };

        divTarea.appendChild(tituloP);
        divTarea.appendChild(textoSmall);
        divTarea.appendChild(eliminarBtn);
        contenedor.appendChild(divTarea);
    });
}

// --- LÓGICA DE DATOS Y API ---
async function cargarTareas() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Servidor o sesión no disponible");

        const tareasServidor = await res.json();
        const tareasLocales = JSON.parse(localStorage.getItem('tasks')) || [];
        const tareasOffline = tareasLocales.filter(t => t.offline);

        listaTareas = [...tareasServidor, ...tareasOffline];
        saveTasksLocal();
    } catch (err) {
        console.warn("Modo Offline: Cargando tareas desde localStorage.");
        listaTareas = JSON.parse(localStorage.getItem('tasks')) || [];
    }
    renderizarTareas();
    syncOfflineOps(); // Siempre intentar sincronizar al cargar
}

async function agregarTarea() {
    const titulo = tituloInput.value.trim();
    const texto = descripcionInput.value.trim();
    if (titulo === '' || texto === '') return;

    tituloInput.value = '';
    descripcionInput.value = '';

    const nuevaTarea = { titulo, texto, offline: true };
    listaTareas.unshift(nuevaTarea);
    saveTasksLocal();
    renderizarTareas();
    syncOfflineOps(); // Intentar sincronizar inmediatamente
}

async function eliminarTarea(tarea, index) {
    listaTareas.splice(index, 1); // Elimina de la UI al instante

    if (tarea.id) { // Si la tarea tiene un ID, vino del servidor
        pendingOps.push({ type: "delete", id: tarea.id });
        savePendingOps();
    }
    saveTasksLocal();
    renderizarTareas();
    syncOfflineOps(); // Intentar sincronizar inmediatamente
}

// --- LÓGICA DE SINCRONIZACIÓN ---
async function syncOfflineOps() {
    if (!navigator.onLine) return;

    // 1. Sincronizar tareas nuevas (marcadas como "offline")
    const tareasNuevas = listaTareas.filter(t => t.offline);
    for (const tarea of tareasNuevas) {
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ titulo: tarea.titulo, descripcion: tarea.texto }),
            });
            const tareaSincronizada = await res.json();
            // Actualizamos la tarea local con el ID del servidor y quitamos el flag
            tarea.id = tareaSincronizada.id;
            delete tarea.offline;
        } catch (err) {
            console.warn("Fallo al sincronizar nueva tarea, se reintentará luego.", err);
        }
    }

    // 2. Sincronizar operaciones pendientes (eliminaciones)
    const ops = [...pendingOps];
    pendingOps = []; // Limpiamos la lista original para evitar re-procesar

    for (const op of ops) {
        try {
            if (op.type === 'delete') {
                await fetch(`${API_URL}?id=${op.id}`, { method: 'DELETE' });
            }
        } catch (err) {
            console.warn("Fallo al sincronizar una operación, se reintentará luego.", err);
            pendingOps.push(op); // Si falla, la devolvemos a la lista de pendientes
        }
    }

    savePendingOps();
    saveTasksLocal();
    renderizarTareas();
}

// --- EVENT LISTENERS DE LA APLICACIÓN ---
btnAgregar.addEventListener('click', agregarTarea);

btnLogout.addEventListener('click', (event) => {
    event.preventDefault();
    localStorage.clear();
    window.location.href = event.target.href;
});

window.addEventListener('online', syncOfflineOps);

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    // La sesión ya se verifica en PHP, así que cargamos las tareas directamente
    cargarTareas();
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js')
            .then(reg => console.log('Service Worker registrado'))
            .catch(err => console.error('Error registrando Service Worker', err));
    }
});