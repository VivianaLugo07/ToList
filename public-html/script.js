
const tituloTareas = document.getElementById("tituloTareas");
const descripcionTareas = document.getElementById("descripcionTareas");
const btn_agregar = document.getElementById("btn_agregar");
const contenedor = document.getElementById("contenedor");
const API_URL = '/proyecto/api/tareas.php';

const cargarTareas = async () => {
    if (navigator.onLine) {
        try {
            console.log("Modo Online: Cargando tareas desde el servidor.");
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error("Error del servidor.");
            const tareasServidor = await response.json();

            localStorage.setItem('tareas_cache', JSON.stringify(tareasServidor));
            renderizarTareas(tareasServidor);
            document.querySelector("h1").innerText = "Lista de Tareas";
        } catch (error) {
            console.warn("No se pudo conectar. Mostrando caché local.", error);
            const tareasCache = JSON.parse(localStorage.getItem("tareas_cache")) || [];
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

const renderizarTareas = (tareas) => {

    contenedor.innerHTML = "";
    if (!tareas || tareas.length === 0) {
        contenedor.innerHTML = "<p class='mensaje-vacio'>¡No hay tareas pendientes! ✨</p>";
        return;
    }
    tareas.forEach((tarea) => {
        let listaTareas = document.createElement("div");
        listaTareas.classList.add("lista_Tareas");
        listaTareas.dataset.id = tarea.id;
        let tituloDiv = document.createElement("p");
        tituloDiv.textContent = tarea.titulo;
        let contenidoDiv = document.createElement("small");
        contenidoDiv.textContent = tarea.texto || tarea.descripcion;
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

const agregarTarea = async () => {
    const titulo = tituloTareas.value.trim();
    const descripcion = descripcionTareas.value.trim();
    if (titulo === "" || descripcion === "") {
        alert("Por favor, completa el título y la descripción.");
        return;
    }
    const nuevaTarea = {
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
            cargarTareas();
        } catch (error) {
            console.warn("Fallo el envío. Guardando para sincronizar.", error);
            guardarPendiente("agregar", nuevaTarea);
        }
    } else {
        console.log("Offline: Tarea guardada en pendientes para agregar.");
        guardarPendiente("agregar", nuevaTarea);
        const tareasCache = JSON.parse(localStorage.getItem("tareas_cache")) || [];
        tareasCache.unshift(nuevaTarea);
        localStorage.setItem("tareas_cache", JSON.stringify(tareasCache));
        renderizarTareas(tareasCache);
    }
    descripcionTareas.value = "";
    tituloTareas.value = "";
};

const eliminarTarea = async (id) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta tarea?")) return;
    if (navigator.onLine) {
        try {
            await fetch(`${API_URL}?id=${id}`, { method: "DELETE" });
            cargarTareas();
        } catch (error) {
            console.warn("Fallo la eliminación. Guardando para sincronizar.", error);
            guardarPendiente("eliminar", { id });
        }

    } else {
        console.log(`Offline: Tarea ${id} marcada en pendientes para eliminar.`);
        guardarPendiente("eliminar", { id });
        let tareasCache = JSON.parse(localStorage.getItem("tareas_cache")) || [];
        tareasCache = tareasCache.filter((t) => t.id !== id);
        localStorage.setItem("tareas_cache", JSON.stringify(tareasCache));
        renderizarTareas(tareasCache);
    }
};

function guardarPendiente(tipo, payload) {
    const pendientes = JSON.parse(localStorage.getItem(`pendientes_${tipo}`)) || [];
    pendientes.push(payload);
    localStorage.setItem(`pendientes_${tipo}`, JSON.stringify(pendientes));
}

const sincronizarPendientes = async () => {
    console.log("Conexión recuperada. Sincronizando...");
    const pendientesAgregar = JSON.parse(localStorage.getItem('pendientes_agregar')) || [];
    const pendientesEliminar = JSON.parse(localStorage.getItem('pendientes_eliminar')) || [];

    if (pendientesAgregar.length === 0 && pendientesEliminar.length === 0) {
        console.log("No hay nada que sincronizar.");
        return;
    }

    document.querySelector("h1").innerText = "Sincronizando... 🔄";

    const promesasAgregar = pendientesAgregar.map(tarea =>
        fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tarea),
        })
    );
    const promesasEliminar = pendientesEliminar.map(tarea =>
        fetch(`${API_URL}?id=${tarea.id}`, { method: 'DELETE' })
    );

    try {
        await Promise.all([...promesasAgregar, ...promesasEliminar]);
        console.log("¡Sincronización completada!");
        localStorage.removeItem('pendientes_agregar');
        localStorage.removeItem('pendientes_eliminar');
        await cargarTareas();

    } catch (error) {
        console.error("Error durante la sincronización. Se reintentará más tarde.", error);
        await cargarTareas();
    }
};

window.addEventListener('online', sincronizarPendientes);

document.addEventListener('DOMContentLoaded', () => {
    cargarTareas();
    if (navigator.onLine) {
        sincronizarPendientes();
    }
});


if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(reg => console.log('Service Worker registrado correctamente.'))
            .catch(err => console.log('Error al registrar el Service Worker:', err));

    });

}