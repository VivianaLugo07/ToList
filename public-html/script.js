// /public-html/script.js

window.initializeApp = function() {
    // --- SELECTORES Y VARIABLES ---
    const tituloInput = document.getElementById("tituloTareas");
    const descripcionInput = document.getElementById("descripcionTareas");
    const btnAgregar = document.getElementById("btn_agregar");
    const contenedor = document.getElementById("contenedor");
    const btnLogout = document.getElementById('logout-btn');
    const API_URL = '/proyecto/api/tareas.php';
    
    // --- LÓGICA DE CIERRE DE SESIÓN ---
    btnLogout.addEventListener('click', (event) => {
        event.preventDefault();
        localStorage.clear();
        window.location.href = event.target.href;
    });

    // --- FUNCIONES DE LA APLICACIÓN ---

    function renderizar(tareas) {
        contenedor.innerHTML = "";
        if (!tareas || tareas.length === 0) {
            contenedor.innerHTML = "<p class='mensaje-vacio'>¡No hay tareas pendientes! ✨</p>";
            return;
        }
        tareas.forEach(tarea => {
            const divTarea = document.createElement("div"); divTarea.classList.add("lista_Tareas");
            const tituloP = document.createElement("p"); tituloP.textContent = tarea.titulo;
            const textoSmall = document.createElement("small"); textoSmall.textContent = tarea.texto;
            const eliminarBtn = document.createElement("button"); eliminarBtn.textContent = "Eliminar"; eliminarBtn.classList.add("btn-eliminar");
            eliminarBtn.onclick = () => eliminarTarea(tarea);
            divTarea.appendChild(tituloP); divTarea.appendChild(textoSmall); divTarea.appendChild(eliminarBtn);
            contenedor.appendChild(divTarea);
        });
    }

    async function cargarTareas() {
        if (navigator.onLine) {
            try {
                await sincronizar();
                const res = await fetch(API_URL);
                const tareasServidor = await res.json();
                renderizar(tareasServidor);
                localStorage.setItem('tareas_cache', JSON.stringify(tareasServidor));
            } catch (err) {
                const tareasCache = JSON.parse(localStorage.getItem('tareas_cache')) || [];
                renderizar(tareasCache);
            }
        } else {
            const tareasCache = JSON.parse(localStorage.getItem('tareas_cache')) || [];
            const pendientes = JSON.parse(localStorage.getItem('tareas_pendientes')) || [];
            const idsAEliminar = pendientes.filter(p => p.tipo === 'eliminar').map(p => String(p.id));
            const cacheFiltrada = tareasCache.filter(t => !idsAEliminar.includes(String(t.id)));
            const tareasAAgregar = pendientes.filter(p => p.tipo === 'agregar');
            renderizar([...tareasAAgregar, ...cacheFiltrada]);
        }
    }

    function guardarPendiente(operacion) {
        const pendientes = JSON.parse(localStorage.getItem('tareas_pendientes')) || [];
        pendientes.push(operacion);
        localStorage.setItem('tareas_pendientes', JSON.stringify(pendientes));
        cargarTareas();
    }

    async function agregarTarea() {
        const titulo = tituloInput.value.trim();
        const texto = descripcionInput.value.trim();
        if (titulo === '' || texto === '') return;
        const nuevaTarea = { id: `temp-${Date.now()}`, titulo, texto, tipo: 'agregar' };
        tituloInput.value = '';
        descripcionInput.value = '';
        if (navigator.onLine) {
            try {
                await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ titulo: nuevaTarea.titulo, descripcion: nuevaTarea.texto })
                });
                cargarTareas();
            } catch (err) { guardarPendiente(nuevaTarea); }
        } else {
            guardarPendiente(nuevaTarea);
        }
    }

    // --- FUNCIÓN ELIMINAR CON LA CORRECCIÓN ---
    async function eliminarTarea(tarea) {
        if (!confirm("¿Estás seguro de que deseas eliminar esta tarea?")) return;

        // CORRECCIÓN: Usamos String(tarea.id) para convertir el ID a texto antes de usar .startsWith()
        if (tarea.id && String(tarea.id).startsWith('temp-')) {
            let pendientes = JSON.parse(localStorage.getItem('tareas_pendientes')) || [];
            pendientes = pendientes.filter(p => p.id !== tarea.id);
            localStorage.setItem('tareas_pendientes', JSON.stringify(pendientes));
            cargarTareas();
            return;
        }

        if (navigator.onLine) {
            try {
                const res = await fetch(`${API_URL}?id=${tarea.id}`, { method: 'DELETE' });
                if (!res.ok) throw new Error('Falló la petición al servidor');
                cargarTareas();
            } catch (err) {
                guardarPendiente({ id: tarea.id, tipo: 'eliminar' });
            }
        } else {
            guardarPendiente({ id: tarea.id, tipo: 'eliminar' });
        }
    }

    async function sincronizar() {
        const pendientes = JSON.parse(localStorage.getItem('tareas_pendientes')) || [];
        if (!navigator.onLine || pendientes.length === 0) return;
        try {
            const promesas = pendientes.map(op => {
                if (op.tipo === 'agregar') {
                    return fetch(API_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ titulo: op.titulo, descripcion: op.texto })
                    });
                }
                if (op.tipo === 'eliminar') {
                    return fetch(`${API_URL}?id=${op.id}`, { method: 'DELETE' });
                }
            });
            await Promise.all(promesas.filter(p => p));
            localStorage.removeItem('tareas_pendientes');
            console.log("Sincronización completada.");
        } catch (err) {
            console.error("Fallo la sincronización, los cambios pendientes se mantienen.", err);
        }
    }

    // --- INICIALIZACIÓN Y EVENTOS ---
    btnAgregar.addEventListener('click', agregarTarea);
    window.addEventListener('online', cargarTareas);
    cargarTareas(); // Carga inicial
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js');
    }
};
//if ('serviceWorker' in navigator) {
  //  window.addEventListener('load', () => {
//    navigator.serviceWorker.register('./service-worker.js')
    //        .then(reg => console.log('Service Worker inteligente registrado.'))
  //          .catch(err => console.error('Error registrando Service Worker:', err));
    //});
//}