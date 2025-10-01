// /public-html/script.js

// BARRERA 2: VERIFICACIÓN DE SESIÓN CON JAVASCRIPT AL INICIAR
fetch('api/check_session.php', { cache: 'no-store' })
    .then(response => response.json())
    .then(data => {
        if (!data.loggedIn) {
            localStorage.clear();
            window.location.href = 'federacion.php';
        } else {
            initializeApp();
        }
    })
    .catch(error => {
        localStorage.clear();
        window.location.href = 'federacion.php';
    });


// Esta función contiene toda la lógica de tu aplicación
function initializeApp() {
    const tituloInput = document.getElementById("tituloTareas");
    const descripcionInput = document.getElementById("descripcionTareas");
    const btnAgregar = document.getElementById("btn_agregar");
    const contenedor = document.getElementById("contenedor");
    const btnLogout = document.getElementById('logout-btn');
    const API_URL = '/proyecto/api/tareas.php';

    // Limpiamos localStorage al cerrar sesión
    btnLogout.addEventListener('click', (event) => {
        event.preventDefault();
        localStorage.clear();
        window.location.href = event.target.href;
    });

    async function cargarTareas() {
        try {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error("Error del servidor");
            const tareas = await res.json();
            renderizarTareas(tareas);
        } catch (err) {
            contenedor.innerHTML = "<p class='mensaje-error'>No se pudieron cargar las tareas.</p>";
        }
    }

    function renderizarTareas(tareas) {
        contenedor.innerHTML = "";
        if (tareas.length === 0) {
            contenedor.innerHTML = "<p class='mensaje-vacio'>¡No hay tareas pendientes! ✨</p>"; return;
        }
        tareas.forEach(tarea => {
            const divTarea = document.createElement("div"); divTarea.classList.add("lista_Tareas");
            const tituloP = document.createElement("p"); tituloP.textContent = tarea.titulo;
            const textoSmall = document.createElement("small"); textoSmall.textContent = tarea.texto;
            const eliminarBtn = document.createElement("button"); eliminarBtn.textContent = "Eliminar"; eliminarBtn.classList.add("btn-eliminar");
            eliminarBtn.onclick = () => eliminarTarea(tarea.id);
            divTarea.appendChild(tituloP); divTarea.appendChild(textoSmall); divTarea.appendChild(eliminarBtn);
            contenedor.appendChild(divTarea);
        });
    }

    async function agregarTarea() {
        const titulo = tituloInput.value.trim();
        const texto = descripcionInput.value.trim();
        if (titulo === '' || texto === '') return;
        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ titulo: titulo, descripcion: texto })
            });
            tituloInput.value = '';
            descripcionInput.value = '';
            cargarTareas();
        } catch (err) {
            alert("No se pudo agregar la tarea.");
        }
    }

    async function eliminarTarea(id) {
        if (!confirm("¿Estás seguro de que deseas eliminar esta tarea?")) return;
        try {
            await fetch(`${API_URL}?id=${id}`, { method: 'DELETE' });
            cargarTareas();
        } catch (err) {
            alert("No se pudo eliminar la tarea.");
        }
    }

    // --- INICIALIZACIÓN Y POLLING ---
    btnAgregar.addEventListener('click', agregarTarea);
    
    // 1. Carga las tareas la primera vez
    cargarTareas();

    // 2. (NUEVO) Inicia el ciclo de polling para refrescar cada 10 segundos
    setInterval(cargarTareas, 10000); // 10000 milisegundos = 10 segundos
}
// La carga inicial ahora la dispara el "guardia" en index.php,
// así que no necesitamos el 'DOMContentLoaded' aquí.
// --- AÑADE ESTE BLOQUE DE NUEVO ---
// Registra el Service Worker "inteligente"
//if ('serviceWorker' in navigator) {
  //  window.addEventListener('load', () => {
//    navigator.serviceWorker.register('./service-worker.js')
    //        .then(reg => console.log('Service Worker inteligente registrado.'))
  //          .catch(err => console.error('Error registrando Service Worker:', err));
    //});
//}