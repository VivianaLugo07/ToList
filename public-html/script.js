// /public-html/script.js

const tituloTareas = document.getElementById("tituloTareas");
const descripcionTareas = document.getElementById("descripcionTareas");
const btn_agregar = document.getElementById("btn_agregar");
const contenedor = document.getElementById("contenedor");
const API_URL = "/proyecto/api/tareas.php";

// --- FUNCIONES PRINCIPALES ---

/**
 * Carga las tareas. Primero intenta desde el servidor.
 * Si falla (está offline), carga desde el caché local.
 */
const cargarTareas = async () => {
    if (navigator.onLine) {
        try {
            console.log("Modo Online: Cargando tareas desde el servidor.");
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error("Error del servidor.");
            const tareasServidor = await response.json();

            // Guarda la lista fresca de tareas en localStorage como caché
            localStorage.setItem("tareas_cache", JSON.stringify(tareasServidor));
            renderizarTareas(tareasServidor);
            document.querySelector("h1").innerText = "Lista de Tareas";
        } catch (error) {
            console.warn(
                "No se pudo conectar al servidor. Mostrando caché local.",
                error
            );
            const tareasCache =
                JSON.parse(localStorage.getItem("tareas_cache")) || [];
            renderizarTareas(tareasCache);
            document.querySelector("h1").innerText = "Lista de Tareas (Modo Offline)";
        }
    } else {
        console.log("Modo Offline: Mostrando tareas desde el caché local.");
        const tareasCache = JSON.parse(localStorage.getItem("tareas_cache")) || [];
        renderizarTareas(tareasCache);
        document.querySelector("h1").innerText = "Lista de Tareas (Modo Offline)";
    }
};

/**
 * Muestra las tareas en la pantalla.
 * @param {Array} tareas - El array de tareas a mostrar.
 */
const renderizarTareas = (tareas) => {
    contenedor.innerHTML = "";
    if (!tareas || tareas.length === 0) {
        contenedor.innerHTML =
            "<p class='mensaje-vacio'>¡No hay tareas pendientes! ✨</p>";
        return;
    }

    tareas.forEach((tarea) => {
        let listaTareas = document.createElement("div");
        listaTareas.classList.add("lista_Tareas");
        listaTareas.dataset.id = tarea.id;

        let tituloDiv = document.createElement("p");
        tituloDiv.textContent = tarea.titulo;

        let contenidoDiv = document.createElement("small");
        contenidoDiv.textContent = tarea.texto || tarea.descripcion; // Compatible con ambos nombres

        let eliminar_button = document.createElement("button");
        eliminar_button.textContent = "Eliminar";
        eliminar_button.classList.add("btn-eliminar");
        eliminar_button.addEventListener("click", () => eliminarTarea(tarea.id));

        listaTareas.appendChild(tituloDiv);
        listaTareas.appendChild(contenidoDiv);
        listaTareas.appendChild(eliminar_button);
        contenedor.appendChild(listaTareas);
    });
};

/**
 * Agrega una nueva tarea. La envía al servidor si está online,
 * o la guarda localmente si está offline.
 */
const agregarTarea = async () => {
    const titulo = tituloTareas.value.trim();
    const descripcion = descripcionTareas.value.trim();

    if (titulo === "" || descripcion === "") {
        alert("Por favor, completa el título y la descripción.");
        return;
    }

    const nuevaTarea = {
        // ID temporal para manejo offline. El servidor le asignará uno real.
        id: `temp-${Date.now()}`,
        titulo: titulo,
        descripcion: descripcion,
    };

    if (navigator.onLine) {
        try {
            await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(nuevaTarea),
            });
        } catch (error) {
            console.warn(
                "Fallo al enviar la nueva tarea. Guardando para sincronizar.",
                error
            );
            guardarPendiente("agregar", nuevaTarea);
        }
    } else {
        console.log("Modo Offline: Tarea guardada para sincronización futura.");
        guardarPendiente("agregar", nuevaTarea);

        // Actualiza la UI inmediatamente con la tarea nueva (visualmente)
        const tareasCache = JSON.parse(localStorage.getItem("tareas_cache")) || [];
        tareasCache.unshift(nuevaTarea);
        localStorage.setItem("tareas_cache", JSON.stringify(tareasCache));
        renderizarTareas(tareasCache);
    }

    descripcionTareas.value = "";
    tituloTareas.value = "";
    if (navigator.onLine) cargarTareas(); // Recarga desde el servidor si está online
};

/**
 * Elimina una tarea. La elimina del servidor si está online,
 * o la marca para eliminación local si está offline.
 */
const eliminarTarea = async (id) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta tarea?")) return;

    if (navigator.onLine) {
        try {
            await fetch(`${API_URL}?id=${id}`, { method: "DELETE" });
        } catch (error) {
            console.warn(
                "Fallo al eliminar la tarea. Guardando para sincronizar.",
                error
            );
            guardarPendiente("eliminar", { id });
        }
    } else {
        console.log(
            "Modo Offline: Tarea marcada para eliminar en la próxima sincronización."
        );
        guardarPendiente("eliminar", { id });

        // Elimina la tarea de la UI inmediatamente
        let tareasCache = JSON.parse(localStorage.getItem("tareas_cache")) || [];
        tareasCache = tareasCache.filter((t) => t.id !== id);
        localStorage.setItem("tareas_cache", JSON.stringify(tareasCache));
        renderizarTareas(tareasCache);
    }

    if (navigator.onLine) cargarTareas(); // Recarga desde el servidor si está online
};

// --- LÓGICA DE SINCRONIZACIÓN ---

/**
 * Guarda una operación pendiente (agregar/eliminar) en localStorage.
 * @param {'agregar'|'eliminar'} tipo - El tipo de operación.
 * @param {Object} payload - Los datos de la tarea.
 */
function guardarPendiente(tipo, payload) {
    const pendientes =
        JSON.parse(localStorage.getItem(`pendientes_${tipo}`)) || [];
    pendientes.push(payload);
    localStorage.setItem(`pendientes_${tipo}`, JSON.stringify(pendientes));
}

/**
 * Sincroniza todas las operaciones pendientes con el servidor.
 */
const sincronizarPendientes = async () => {
    console.log("Intentando sincronizar cambios pendientes...");

    const pendientesAgregar =
        JSON.parse(localStorage.getItem("pendientes_agregar")) || [];
    const pendientesEliminar =
        JSON.parse(localStorage.getItem("pendientes_eliminar")) || [];

    // Promesas para enviar todo en paralelo
    const promesasAgregar = pendientesAgregar.map((tarea) =>
        fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(tarea),
        })
    );

    const promesasEliminar = pendientesEliminar.map((tarea) =>
        fetch(`${API_URL}?id=${tarea.id}`, { method: "DELETE" })
    );

    try {
        await Promise.all([...promesasAgregar, ...promesasEliminar]);

        // Si todo salió bien, limpia las listas de pendientes
        console.log("Sincronización completada con éxito.");
        localStorage.removeItem("pendientes_agregar");
        localStorage.removeItem("pendientes_eliminar");
    } catch (error) {
        console.error("Error durante la sincronización:", error);
    } finally {
        // Siempre recarga la lista desde el servidor para tener los datos más recientes
        cargarTareas();
    }
};

// --- EVENT LISTENERS ---

btn_agregar.addEventListener("click", agregarTarea);

// Detecta cuándo el navegador vuelve a tener conexión
window.addEventListener("online", () => {
    console.log("¡Conexión recuperada! ");
    document.querySelector("h1").innerText = "Lista de Tareas";
    sincronizarPendientes();
});

// Detecta cuándo el navegador pierde la conexión
window.addEventListener("offline", () => {
    console.log("Conexión perdida. Entrando en modo offline. ");
    document.querySelector("h1").innerText = "Lista de Tareas (Modo Offline)";
});

// Al cargar la página, comprueba si hay pendientes y si está online para sincronizar
document.addEventListener("DOMContentLoaded", () => {
    cargarTareas();
    if (navigator.onLine) {
        sincronizarPendientes();
    }
});
