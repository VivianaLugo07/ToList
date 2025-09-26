const tituloTareas = document.getElementById("tituloTareas");
const descripcionTareas = document.getElementById("descripcionTareas");
const btn_agregar = document.getElementById("btn_agregar");
const contenedor = document.getElementById("contenedor");

let tareas = JSON.parse(localStorage.getItem('misTareas')) || [];

const guardarTareas = () => {
    localStorage.setItem('misTareas', JSON.stringify(tareas));
};

const renderizarTareas = () => {
    contenedor.innerHTML = "";

    if (tareas.length === 0) {
        contenedor.innerHTML = "<p class='mensaje-vacio'>¡No hay tareas pendientes! ✨</p>";
        return;
    }

    tareas.forEach(tarea => {
        let listaTareas = document.createElement("div");
        listaTareas.classList.add("lista_Tareas");

        let tituloDiv = document.createElement("p");
        tituloDiv.textContent = tarea.titulo;

        let contenidoDiv = document.createElement("small");
        contenidoDiv.textContent = tarea.descripcion;

        let eliminar_button = document.createElement("button");
        eliminar_button.textContent = "Eliminar";
        eliminar_button.classList.add("btn-eliminar");

        eliminar_button.addEventListener('click', () => {
            eliminarTarea(tarea.id);
        });

        listaTareas.appendChild(tituloDiv);
        listaTareas.appendChild(contenidoDiv);
        listaTareas.appendChild(eliminar_button);
        contenedor.appendChild(listaTareas);
    });
};

const agregarTarea = () => {
    let titulo = tituloTareas.value.trim();
    let descripcion = descripcionTareas.value.trim();

    if (titulo === "" || descripcion === "") {
        alert("Por favor, completa el título y la descripción.");
        return;
    }

    const nuevaTarea = {
        id: Date.now(),
        titulo: titulo,
        descripcion: descripcion
    };

    tareas.unshift(nuevaTarea);
    guardarTareas();
    renderizarTareas();
    descripcionTareas.value = "";
    tituloTareas.value = "";
};

const eliminarTarea = (id) => {
    tareas = tareas.filter(tarea => tarea.id !== id);
    guardarTareas();
    renderizarTareas();
};
btn_agregar.addEventListener('click', agregarTarea);
renderizarTareas();


// Registrar el Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(registration => {
                console.log('Service Worker registrado correctamente.');
            })
            .catch(error => {
                console.log('Error al registrar el Service Worker:', error);
            });
    });
}